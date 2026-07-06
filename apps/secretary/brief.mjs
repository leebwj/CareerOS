// CareerOS · secretary — the brief composer.
// Reads the role-grabber feed (+ optional tracker export) and composes a
// short, deterministic morning brief: what's hot, what's new, what needs you.
// No secrets, no network, no LLM required — facts computed straight from JSON
// so dates and counts can never hallucinate. An optional LLM polish layer can
// rewrite the prose later (see README); this file stays the source of truth.
//
// Zero dependencies — Node 20+. Import composeBrief(), or run standalone:
//   node brief.mjs         → prints the brief + writes out/brief.md

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
// live feed (the bot's latest, refreshed 2×/day) — so a scheduled brief is
// always current without needing a git pull; falls back to the local file offline
const FEED_URL = "https://raw.githubusercontent.com/leebwj/CareerOS/main/apps/role-grabber/data/roles.json";
const FEED_LOCAL = join(ROOT, "..", "role-grabber", "data", "roles.json");
// optional: tracker state exported to this path enables the follow-up section
const TRACKER = join(ROOT, "data", "tracker-export.json");

// "target" is computed by the grabber (relevant role at a desirable company) → r.target

const readJSON = (p, fallback) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; }
};

// fetch the live feed; fall back to the local file if offline
async function readRoles() {
  try {
    const r = await fetch(FEED_URL, { headers: { "user-agent": "careeros-secretary" } });
    if (r.ok) return await r.json();
  } catch {}
  return readJSON(FEED_LOCAL, []);
}

// pull the tracker's live state from the synced Google Sheet — its doGet returns
// {state:"<json>"} (plain JSON when no ?callback); Node follows the 302 redirect.
// Returns the parsed tracker state ({s,hidden,updated}) or null on any failure.
export async function fetchTrackerState(sheetUrl) {
  if (!sheetUrl) return null;
  try {
    const r = await fetch(sheetUrl, { redirect: "follow", headers: { "user-agent": "careeros-secretary" } });
    if (!r.ok) return null;
    const data = JSON.parse(await r.text());
    return data && data.state ? JSON.parse(data.state) : null;
  } catch { return null; }
}

// `todayISO` is injected (Node's Date is fine here — this is a live script, not
// a replay-sensitive workflow) so the brief can be generated for any date.
export async function composeBrief(todayISO = new Date().toISOString().slice(0, 10), trackerState = null) {
  const roles = await readRoles();
  if (!roles.length) return { text: "No roles feed found — run the role-grabber first.", empty: true };

  const yesterdayISO = new Date(new Date(todayISO + "T12:00:00").getTime() - 864e5).toISOString().slice(0, 10);
  const key = (r) => `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ");

  const hot = roles.filter((r) => r.hot).sort((a, b) => b.fit - a.fit);
  // internships are the priority — fresh, intern-level, best fit first
  const internships = roles.filter((r) => r.level === "intern" && r.posted >= yesterdayISO).sort((a, b) => b.fit - a.fit);
  const fresh = roles.filter((r) => r.posted >= yesterdayISO);
  const newCount = roles.filter((r) => r.isNew).length;
  const topTargets = roles
    .filter((r) => r.target && r.posted >= yesterdayISO && !r.hot)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 5);

  // tracker state — live from the synced Google Sheet if provided, else the
  // optional local export file → follow-ups due + applied-this-week count
  const tracker = trackerState || readJSON(TRACKER, null);
  let followups = [], appliedWeek = 0;
  if (tracker && tracker.s) {
    const weekAgo = new Date(new Date(todayISO + "T12:00:00").getTime() - 7 * 864e5).toISOString().slice(0, 10);
    for (const [k, v] of Object.entries(tracker.s)) {
      if (v.date && v.date >= weekAgo) appliedWeek++;
      if (v.fu && v.st === "Applied" && v.fu <= todayISO) {
        const [company, title] = k.split("|");
        followups.push({ company, title, due: v.fu, n: v.fuDone ? v.fuDone + 1 : 1 });
      }
    }
  }

  // ── compose (markdown + plain mirror) ──
  const L = [];
  const dow = new Date(todayISO + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  L.push(`# ☀️ Morning brief — ${dow}`, "");

  // the one-line headline: the single most important thing
  // openings lead the brief (most visible); follow-ups get a nudge → bottom section
  const headline =
    internships.length ? `**${internships.length} new internship${internships.length > 1 ? "s" : ""}** posted — your priority, apply today.`
    : hot.length ? `**${hot.length} hot role${hot.length > 1 ? "s" : ""} posted** — apply today, they get swamped fast.`
    : `No new urgent openings — a good day to polish a case study or tailor a résumé.`;
  const fuNudge = followups.length ? ` _· ${followups.length} follow-up${followups.length > 1 ? "s" : ""} due today — see the bottom._` : "";
  L.push(headline + fuNudge, "");

  const roleRow = (r) => {
    const tier = r.fit >= 0.6 ? "⭐ " : "";
    L.push(`- ${tier}**${r.company}** — ${r.title.replace(/\|/g, "/")}${r.term ? ` · ${r.term}` : ""} · [apply](${r.url})`);
  };

  if (internships.length) {
    L.push(`## 🎓 New internships — your priority (${internships.length})`);
    internships.slice(0, 12).forEach(roleRow);
    if (internships.length > 12) L.push(`- …and ${internships.length - 12} more — filter to interns in the tracker.`);
    L.push("");
  }

  const otherHot = hot.filter((r) => r.level !== "intern");
  if (otherHot.length) {
    L.push(`## 🔥 Also hot — new-grad & beyond (${otherHot.length})`);
    otherHot.slice(0, 6).forEach(roleRow);
    L.push("");
  }

  if (topTargets.length) {
    L.push(`## 🎯 New at target companies`);
    for (const r of topTargets) L.push(`- **${r.company}** — ${r.title.replace(/\|/g, "/")}${r.term ? ` · ${r.term}` : ""} · [apply](${r.url})`);
    L.push("");
  }

  L.push(`## 📊 The board`);
  L.push(`- ${fresh.length} roles posted in the last day · 🆕 ${newCount} new since the last refresh`);
  if (appliedWeek) L.push(`- You've applied to ${appliedWeek} role${appliedWeek > 1 ? "s" : ""} this week — keep the streak.`);
  L.push(`- [Open the full board →](https://leebrian.dev/tracker)`);
  L.push(`- [Answer bank & apply helper →](https://leebrian.dev/apply)`, "");

  // follow-ups go LAST — openings stay at the top where they're most visible
  if (followups.length) {
    L.push(`## 📮 Follow up today (${followups.length})`);
    for (const f of followups) L.push(`- **${f.company}** — ${f.title}${f.n > 1 ? ` (attempt #${f.n})` : ""}`);
    L.push("");
  }

  L.push(`_Composed by your CareerOS secretary._`);

  const md = L.join("\n");
  const text = md.replace(/\*\*/g, "").replace(/^#+ /gm, "").replace(/\[apply\]\((.*?)\)/g, "$1").replace(/\[(.*?)\]\((.*?)\)/g, "$1: $2");
  return { md, text, empty: false, stats: { hot: hot.length, fresh: fresh.length, newCount, followups: followups.length } };
}

// standalone (robust on Windows: compare resolved paths, not file:// strings)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const brief = await composeBrief();
  mkdirSync(join(ROOT, "out"), { recursive: true });
  if (brief.md) writeFileSync(join(ROOT, "out", "brief.md"), brief.md);
  console.log("\n" + brief.text + "\n");
  if (brief.stats) console.log(`[stats] ${JSON.stringify(brief.stats)}`);
}
