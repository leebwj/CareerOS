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
const FEED = join(ROOT, "..", "role-grabber", "data", "roles.json");
// optional: tracker state exported to this path enables the follow-up section
const TRACKER = join(ROOT, "data", "tracker-export.json");

const TARGETS = /\b(google|deepmind|meta|apple|amazon|microsoft|figma|notion|stripe|vercel|linear|anthropic|openai|riot games|epic games|roblox|naughty dog|nvidia|unity|valve|blizzard|nintendo|tiktok|bytedance|adobe|airbnb|netflix|ramp|retool|perplexity|scale ai|cursor|databricks|datadog|duolingo|palantir|supabase|replit|cohere|elevenlabs)\b/i;

const readJSON = (p, fallback) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; }
};

// `todayISO` is injected (Node's Date is fine here — this is a live script, not
// a replay-sensitive workflow) so the brief can be generated for any date.
export function composeBrief(todayISO = new Date().toISOString().slice(0, 10)) {
  const roles = readJSON(FEED, []);
  if (!roles.length) return { text: "No roles feed found — run the role-grabber first.", empty: true };

  const yesterdayISO = new Date(new Date(todayISO + "T12:00:00").getTime() - 864e5).toISOString().slice(0, 10);
  const key = (r) => `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ");

  const hot = roles.filter((r) => r.hot).sort((a, b) => b.fit - a.fit);
  const fresh = roles.filter((r) => r.posted >= yesterdayISO);
  const newCount = roles.filter((r) => r.isNew).length;
  const topTargets = roles
    .filter((r) => TARGETS.test(r.company) && r.posted >= yesterdayISO && !r.hot)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 5);

  // tracker export (if present) → follow-ups due + applied-this-week count
  const tracker = readJSON(TRACKER, null);
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
  const headline =
    followups.length ? `**${followups.length} follow-up${followups.length > 1 ? "s" : ""} due today** — send those first, then the hot roles.`
    : hot.length ? `**${hot.length} hot role${hot.length > 1 ? "s" : ""} posted** — these get swamped within 48h, so apply today.`
    : `No urgent items — a good day to polish a case study or tailor a résumé.`;
  L.push(headline, "");

  if (followups.length) {
    L.push(`## 📮 Follow up today (${followups.length})`);
    for (const f of followups) L.push(`- **${f.company}** — ${f.title}${f.n > 1 ? ` (attempt #${f.n})` : ""}`);
    L.push("");
  }

  if (hot.length) {
    L.push(`## 🔥 Hot — apply now (${hot.length})`);
    for (const r of hot.slice(0, 8)) {
      const tier = r.fit >= 0.6 ? "⭐ " : "";
      L.push(`- ${tier}**${r.company}** — ${r.title.replace(/\|/g, "/")}${r.term ? ` · ${r.term}` : ""} · [apply](${r.url})`);
    }
    if (hot.length > 8) L.push(`- …and ${hot.length - 8} more in the tracker.`);
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
  L.push(`- [Open the full board →](https://leebrian.dev/tracker)`, "");

  L.push(`_Composed by your CareerOS secretary._`);

  const md = L.join("\n");
  const text = md.replace(/\*\*/g, "").replace(/^#+ /gm, "").replace(/\[apply\]\((.*?)\)/g, "$1").replace(/\[(.*?)\]\((.*?)\)/g, "$1: $2");
  return { md, text, empty: false, stats: { hot: hot.length, fresh: fresh.length, newCount, followups: followups.length } };
}

// standalone (robust on Windows: compare resolved paths, not file:// strings)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const brief = composeBrief();
  mkdirSync(join(ROOT, "out"), { recursive: true });
  if (brief.md) writeFileSync(join(ROOT, "out", "brief.md"), brief.md);
  console.log("\n" + brief.text + "\n");
  if (brief.stats) console.log(`[stats] ${JSON.stringify(brief.stats)}`);
}
