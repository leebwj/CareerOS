// CareerOS — outreach sheet builder
//
// Turns LinkedIn's OWN data export into a ranked list of people worth messaging,
// by joining it against the two things that make a contact worth a message: the
// roles Brian has actually applied to, and the roles currently open at companies
// he targets. A connection list on its own is noise; "you applied to Palantir on
// Jul 5 and it is still sitting at Applied, and you know a recruiter there" is a
// task.
//
// NOTHING here touches LinkedIn. There is no LinkedIn API for connections, and
// scraping the site with a logged-in session violates their User Agreement and
// gets accounts restricted — a bad trade mid-search. This reads the archive
// LinkedIn hands you on request (Settings → Data privacy → Get a copy of your
// data → "Connections"), which is your own data, delivered by them, in CSV.
//
//   node build.mjs <path-to-Connections.csv> [--alumni penn.csv] [--out DIR]
//
// Optional --alumni: LinkedIn's export carries NO school field for connections,
// so Penn affiliation cannot be derived from it. Supply a CSV with a "name"
// column (paste from LinkedIn's alumni page or Penn's directory) and matching
// people get flagged and promoted a tier.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith("--"));
const argOf = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const OUT = argOf("--out") || path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ""));
if (!csvPath) { console.error("usage: node build.mjs <Connections.csv> [--alumni penn.csv] [--out DIR]"); process.exit(1); }

// ── CSV: LinkedIn prefixes the file with a 3-line "Notes:" preamble ──────────
function parseCSV(text) {
  const t = text.replace(/^﻿/, "");
  const lines = [];
  let cur = "", row = [], q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); lines.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || row.length) { row.push(cur); lines.push(row); }
  // LinkedIn prefixes Connections.csv with a "Notes:" paragraph and blank lines.
  // Skip anything that is not a plausible header: a header row has several short
  // cells, never one long sentence.
  const plausible = (r) => r.filter((c) => c.trim()).length >= 1 &&
    r.every((c) => c.length < 60) && !/^notes:/i.test(r[0] || "");
  const h = lines.findIndex((r) => r.some((c) => /first name|^name$/i.test(c.trim()))) >= 0
    ? lines.findIndex((r) => r.some((c) => /first name|^name$/i.test(c.trim())))
    : lines.findIndex(plausible);
  if (h < 0) throw new Error("no header row found in " + (lines.length) + " parsed rows");
  const head = lines[h].map((c) => c.trim().toLowerCase());
  return lines.slice(h + 1).filter((r) => r.some((c) => c.trim())).map((r) =>
    Object.fromEntries(head.map((k, i) => [k, (r[i] || "").trim()])));
}

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
// Suffixes matter: /recruit/ does NOT match "Recruiter" or "Recruiting" — the
// trailing letters kill the closing word boundary, so a University Recruiter and
// a Technical Recruiter both fell silently to the lowest tier. Same trap as the
// plural "Internships" one recorded in grab.mjs. Match prefixes, not whole words.
const RECRUITER_RX = /\b(recruit\w*|talent acquisition|talent partner|sourc\w*|staffing|university relations|campus)\b/i;
const HIRING_MGR_RX = /\b(engineering manager|em|director of engineering|head of|vp |chief|founder|co-?founder)\b/i;
const RELEVANT_RX = /\b(software|engineer|developer|graphics|game|technical artist|design|ux|ui|product|research|ml|ai|rendering|gameplay|tools)\b/i;

// ── inputs we join against ──────────────────────────────────────────────────
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const roles = readJSON(path.join(OUT, "..", "role-grabber", "data", "roles.json"));

// tracked applications: pulled live from the sync proxy, falling back to a local
// snapshot so this still runs offline
async function tracked() {
  const snap = path.join(OUT, ".tracker-snapshot.json");
  try {
    const r = await fetch("https://leebrian.dev/api/sync");
    const p = await r.json();
    const s = JSON.parse(p.state);
    fs.writeFileSync(snap, JSON.stringify(s));
    return s;
  } catch {
    if (fs.existsSync(snap)) return readJSON(snap);
    return { s: {} };
  }
}

const state = await tracked();
// The tracker stores its keys lowercased, so "epic games | gameplay programmer
// intern" is what comes back. Recover real casing from the roles feed where the
// role still exists, and title-case whatever is left — an outreach sheet that
// says "palantir" reads like a mail merge.
const properCo = {}, properTitle = {};
for (const r of roles) { properCo[norm(r.company)] = r.company; properTitle[norm(r.title)] = r.title; }
const titleCase = (s) => String(s || "").split(/\s+/).map((w) => w ? w[0].toUpperCase() + w.slice(1) : w).join(" ");
const showCo = (c) => properCo[norm(c)] || titleCase(c);
const showTitle = (t) => properTitle[norm(t)] || titleCase(t);
// company → { count, statuses, latest, titles }
const applied = {};
for (const [k, v] of Object.entries(state.s || {})) {
  const [co, title] = k.split("|");
  const e = (applied[norm(co)] ||= { name: showCo(co), n: 0, statuses: new Set(), latest: "", titles: [] });
  e.n++; e.statuses.add(v.st || "starred");
  if ((v.date || "") > e.latest) e.latest = v.date || "";
  if (e.titles.length < 3) e.titles.push(showTitle(title));
}
// company → open intern roles right now
const openIntern = {};
for (const r of roles) {
  if (r.level !== "intern") continue;
  const e = (openIntern[norm(r.company)] ||= { name: r.company, roles: [] });
  if (e.roles.length < 3) e.roles.push(r);
  e.n = (e.n || 0) + 1;
}

const alumniPath = argOf("--alumni");
const alumni = new Set();
if (alumniPath && fs.existsSync(alumniPath)) {
  for (const row of parseCSV(fs.readFileSync(alumniPath, "utf8"))) {
    const n = row.name || [row["first name"], row["last name"]].filter(Boolean).join(" ");
    if (n) alumni.add(norm(n));
  }
}

// ── classify + rank ─────────────────────────────────────────────────────────
const rows = parseCSV(fs.readFileSync(csvPath, "utf8"));
const people = [];
for (const c of rows) {
  const name = [c["first name"], c["last name"]].filter(Boolean).join(" ").trim();
  const company = c.company || "";
  const title = c.position || "";
  if (!name || !company) continue;
  const co = norm(company);
  const app = applied[co];
  const open = openIntern[co];
  const isRec = RECRUITER_RX.test(title);
  const isAlum = alumni.has(norm(name));
  const isRelevant = RELEVANT_RX.test(title) || isRec || HIRING_MGR_RX.test(title);

  let tier = 0, why = "";
  if (app && isRec) {
    tier = 1;
    why = `Recruiter where you have ${app.n} live application${app.n > 1 ? "s" : ""} (${[...app.statuses].join("/")}${app.latest ? ", latest " + app.latest : ""}) — the one person who can actually move it.`;
  } else if (app && isRelevant) {
    tier = 2;
    why = `Works at ${app.name}, where you applied to ${app.titles[0]}${app.n > 1 ? ` and ${app.n - 1} other role${app.n > 2 ? "s" : ""}` : ""}. Ask about the team, not the status.`;
  } else if (open && isRec) {
    tier = 3;
    why = `Recruiter at ${open.name}, which has ${open.n} internship${open.n > 1 ? "s" : ""} open right now (e.g. ${open.roles[0].title}) that you have NOT applied to.`;
  } else if (open && isRelevant) {
    tier = 4;
    why = `At ${open.name} with ${open.n} internship${open.n > 1 ? "s" : ""} open (e.g. ${open.roles[0].title}) — worth a note before you apply.`;
  } else if (app) {
    tier = 5;
    why = `At ${app.name} where you have an application in, but their role does not look adjacent to yours.`;
  } else continue; // no application, no open role → not worth a message today

  // Penn alum sorts FIRST WITHIN its tier rather than jumping one. Promoting
  // across tiers put peers under a heading that reads "Recruiter where you have
  // a live application", which was simply untrue of them.
  if (isAlum) why = "Penn alum. " + why;
  people.push({ tier, name, title, company, url: c.url || "", why, isRec, isAlum,
    role: (open && open.roles[0]) || null, app: app || null });
}

people.sort((a, b) => a.tier - b.tier || (b.isAlum - a.isAlum) || a.company.localeCompare(b.company) || a.name.localeCompare(b.name));

// ── a specific opener, not a template ───────────────────────────────────────
function opener(p) {
  const me = "I'm a Penn CS + Design junior heading into the CGGT master's";
  const first = p.name.split(" ")[0];
  const alum = p.isAlum ? "I saw you're also a Penn grad. " : "";
  // recruiter + live application → ask about the file
  if (p.isRec && p.app) {
    return `${first} — ${alum}${me}. I applied to ${p.app.titles[0]} at ${p.app.name} on ${p.app.latest || "recently"}. This summer I shipped an app-wide React Native redesign at a YC startup and packaged their AI agent as an SDK an outside studio built a game mode on. If anything would be useful alongside my application, I'm glad to send it.`;
  }
  // recruiter, role open, not yet applied → ask before applying
  if (p.isRec && p.role) {
    return `${first} — ${alum}${me}, and I'm about to apply to ${p.role.title} at ${p.company}. Is there anything about how the team weighs intern candidates that the posting doesn't say? Most recent work: a flag-gated React Native redesign and a versioned agent SDK with 1,301 tests.`;
  }
  // peer where you have an application in → ask about the work, not the status
  if (p.app) {
    return `${first} — ${alum}${me}, and I applied to ${p.app.titles[0]} at ${p.app.name}. I'd rather understand the work than chase the status — what does your team actually spend a week on? I've just come off building an agent SDK and a lifecycle notification system end to end.`;
  }
  // peer at a company with something open
  if (p.role) {
    return `${first} — ${alum}${me}, looking at ${p.role.title} at ${p.company} before I apply. What separates the interns who do well on your team from the ones who don't? Recent work is a React Native redesign shipped behind a flag and an agent SDK an external studio built on.`;
  }
  return `${first} — ${alum}${me}, with an application in at ${p.company}. Would value your read on the team if you have a few minutes.`;
}

// ── output ──────────────────────────────────────────────────────────────────
const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const csvOut = [["Tier", "Name", "Title", "Company", "Penn alum", "Recruiter", "Why now", "Opener", "Profile"].join(",")]
  .concat(people.map((p) => [p.tier, p.name, p.title, p.company, p.isAlum ? "yes" : "", p.isRec ? "yes" : "", p.why, opener(p), p.url].map(esc).join(",")))
  .join("\n");
fs.writeFileSync(path.join(OUT, "outreach.csv"), csvOut);

const TIER_LABEL = {
  1: "Recruiter where you have a LIVE application — highest leverage",
  2: "Works where you applied — ask about the team",
  3: "Recruiter where an internship is open and you have NOT applied",
  4: "At a company with an open internship — message before applying",
  5: "At a company you applied to, adjacent role",
};
let md = `# Outreach sheet\n\nGenerated ${new Date().toISOString().slice(0, 10)} · ${people.length} people worth contacting, from ${rows.length} connections.\n\n`;
md += `Ranked by leverage, not alphabetically. Everyone here is at a company you have either applied to or that has an internship open right now — connections with neither are left out on purpose.\n`;
for (const t of [1, 2, 3, 4, 5]) {
  const g = people.filter((p) => p.tier === t);
  if (!g.length) continue;
  md += `\n## Tier ${t} — ${TIER_LABEL[t]} (${g.length})\n\n`;
  for (const p of g.slice(0, 40)) {
    md += `**${p.name}** — ${p.title}, ${p.company}${p.isAlum ? " · 🎓 Penn" : ""}${p.url ? ` · [profile](${p.url})` : ""}\n`;
    md += `- ${p.why}\n`;
    md += `- Opener: ${opener(p)}\n\n`;
  }
  if (g.length > 40) md += `_…and ${g.length - 40} more in outreach.csv_\n`;
}
fs.writeFileSync(path.join(OUT, "outreach.md"), md);

const byTier = people.reduce((a, p) => ((a[p.tier] = (a[p.tier] || 0) + 1), a), {});
console.log(`${rows.length} connections → ${people.length} worth contacting`);
for (const t of Object.keys(byTier).sort()) console.log(`  tier ${t}: ${byTier[t]}  — ${TIER_LABEL[t]}`);
console.log(`\nwrote ${path.join(OUT, "outreach.csv")} and outreach.md`);
if (!alumniPath) console.log("\nnote: no --alumni file given. LinkedIn's export has no school field for\nconnections, so Penn affiliation cannot be inferred — supply a CSV with a\n'name' column to flag alums and promote them a tier.");
