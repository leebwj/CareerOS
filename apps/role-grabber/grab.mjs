// CareerOS · role-grabber
// Aggregates open tech + design roles from curated public sources PLUS the
// public JSON endpoints of target companies' ATS boards (Greenhouse / Ashby /
// Lever — research-verified, no auth), normalizes into one schema, scores
// each role for fit deterministically, and emits: data/roles.json +
// data/roles.csv (everything) and ROLES.md (recent, human-readable).
//
// Zero dependencies — Node 20+ (global fetch). Run: node grab.mjs

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const RECENT_DAYS = 30; // ROLES.md shows roles posted within this window
const FRESH_HOURS = 48; // "fresh" section window
const GHOST_DAYS = 45;  // postings older than this get flagged in data

const SOURCES = {
  simplifyIntern:
    "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
  simplifyNewGrad:
    "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
  jobrightDesign:
    "https://raw.githubusercontent.com/jobright-ai/2026-Design-Internship/master/README.md",
};

// ── direct ATS boards (slugs live-verified 2026-07-03; APIs are public/no-auth)
// Sourcing straight from the company board = fresher than any aggregator AND
// the strongest ghost-job filter (if it's not on the board, it's not real).
const ATS_TARGETS = {
  greenhouse: {
    Figma: "figma", Stripe: "stripe", Anthropic: "anthropic", "Scale AI": "scaleai",
    Roblox: "roblox", "Epic Games": "epicgames", "Riot Games": "riotgames",
    Vercel: "vercel", Databricks: "databricks", Datadog: "datadog", Duolingo: "duolingo",
  },
  ashby: {
    OpenAI: "openai", Notion: "notion", Linear: "linear", Ramp: "ramp",
    Perplexity: "perplexity", Cursor: "cursor", Supabase: "supabase",
    Replit: "replit", Cohere: "cohere", ElevenLabs: "elevenlabs",
  },
  lever: { Palantir: "palantir" },
};

// knockout: senior+ roles are never relevant (intern/new-grad/early-career focus)
const SENIOR_RX = /\b(senior|staff|principal|director|manager|head of|vp|vice president|distinguished|sr\.?|lead architect)\b/i;

// ── category mapping (Brian's scope: broad — every bucket matters) ──────────
const GAME_RX = /\b(game|graphics|render(ing)?|technical artist|shader|unreal|unity|3d)\b/i;
const DESIGN_RX = /\b(product design|ux|ui designer|user experience|interaction design|visual design|brand design|graphic design)\b/i;

function categorize(title, sourceCategory) {
  if (GAME_RX.test(title)) return "Graphics / Game / 3D";
  if (DESIGN_RX.test(title)) return "Design / UX";
  const c = (sourceCategory || "").toLowerCase();
  if (c.includes("design")) return "Design / UX";
  if (c.includes("software")) return "Software Engineering";
  if (c.includes("ai") || c.includes("data")) return "Data / AI / ML";
  if (c.includes("product")) return "Product";
  if (c.includes("quant")) return "Quant";
  if (c.includes("hardware")) return "Hardware";
  if (/\b(software|swe|full[- ]?stack|front[- ]?end|back[- ]?end|infrastructure|platform|web develop|mobile|ios|android|founding engineer)\b/i.test(title)) return "Software Engineering";
  if (/\b(data|machine learning|\bml\b|\bai\b|research)\b/i.test(title)) return "Data / AI / ML";
  if (/\bproduct manager\b/i.test(title)) return "Product";
  return "Other";
}

function levelFromTitle(t) {
  if (/\bintern(ship)?\b/i.test(t)) return "intern";
  if (/\b(new grad|university grad|campus|early career|entry[- ]level|graduate)\b/i.test(t)) return "new-grad";
  return "full-time";
}

// ── US filter ────────────────────────────────────────────────────────────────
// ATS boards use bare city names ("San Francisco") — recognize the majors too.
const US_CITIES = /\b(san francisco|new york|nyc|seattle|mountain view|palo alto|menlo park|cupertino|redmond|bellevue|austin|chicago|boston|los angeles|santa monica|irvine|san diego|san jose|sunnyvale|denver|miami|washington|philadelphia|pittsburgh|atlanta|dallas|houston|portland|brooklyn|cambridge|durham|raleigh|salt lake|phoenix|minneapolis|nashville)\b/i;
function isUS(locations) {
  if (!locations || locations.length === 0) return false;
  return locations.some((raw) => {
    const l = String(raw).trim();
    if (/\b(canada|uk|united kingdom|london|toronto|vancouver|india|singapore|germany|munich|berlin|paris|france|ireland|dublin|australia|sydney|japan|tokyo|korea|seoul|mexico|brazil|netherlands|amsterdam|zurich|switzerland|spain|israel|tel aviv|poland|warsaw)\b/i.test(l)) return false;
    return /,\s*[A-Z]{2}(\s|$)/.test(l) || /\b(usa|united states|u\.s\.)\b/i.test(l) || /^remote$/i.test(l) || /remote.*(us|usa|united states)/i.test(l) || /\b(sf bay|bay area)\b/i.test(l) || US_CITIES.test(l);
  });
}

// ── fetch helpers (a failed source never kills the run) ─────────────────────
async function fetchJSON(url) {
  const r = await fetch(url, { headers: { "user-agent": "careeros-role-grabber" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}
async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": "careeros-role-grabber" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

// ── source parsers → normalized {company,title,category,locations,url,posted,level,source}
function fromSimplify(list, level) {
  return list
    .filter((x) => x.active && x.is_visible !== false)
    .map((x) => ({
      company: x.company_name,
      title: x.title,
      category: categorize(x.title, x.category),
      locations: x.locations || [],
      url: x.url,
      posted: new Date((x.date_posted || x.date_updated) * 1000).toISOString().slice(0, 10),
      level,
      source: "simplify",
    }));
}

function fromJobrightDesign(md) {
  const roles = [];
  let lastCompany = "";
  const year = new Date().getFullYear();
  const month = new Date().getMonth(); // 0-11
  for (const line of md.split("\n")) {
    if (!line.startsWith("|") || line.includes("-----") || line.includes("Company |")) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 6) continue;
    const companyCell = cells[1];
    const titleCell = cells[2];
    const location = cells[3];
    const postedCell = cells[5];
    const company =
      companyCell.includes("↳") ? lastCompany : (companyCell.match(/\[([^\]]+)\]/) || [])[1] || companyCell.replace(/\*/g, "");
    lastCompany = company;
    const title = (titleCell.match(/\[([^\]]+)\]/) || [])[1] || titleCell.replace(/\*/g, "");
    const url = (titleCell.match(/\((https?:[^)]+)\)/) || [])[1] || "";
    const m = postedCell.match(/([A-Z][a-z]{2})\s+(\d{1,2})/);
    let posted = "";
    if (m) {
      const mi = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(m[1]);
      const y = mi > month ? year - 1 : year;
      posted = `${y}-${String(mi + 1).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
    }
    if (!company || !title || !url) continue;
    roles.push({ company, title, category: "Design / UX", locations: [location], url, posted, level: "intern", source: "jobright" });
  }
  return roles;
}

// ATS fetchers — filter senior titles at ingestion (boards carry all levels)
async function fromGreenhouse(company, token) {
  const d = await fetchJSON(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs`);
  return (d.jobs || []).filter((j) => !SENIOR_RX.test(j.title)).map((j) => ({
    company,
    title: j.title,
    category: categorize(j.title, ""),
    locations: [j.location?.name || ""].filter(Boolean),
    url: j.absolute_url,
    posted: String(j.first_published || j.updated_at || "").slice(0, 10),
    level: levelFromTitle(j.title),
    source: "greenhouse",
  }));
}
async function fromAshby(company, org) {
  const d = await fetchJSON(`https://api.ashbyhq.com/posting-api/job-board/${org}`);
  return (d.jobs || []).filter((j) => j.isListed !== false && !SENIOR_RX.test(j.title)).map((j) => ({
    company,
    title: j.title,
    category: categorize(j.title, ""),
    locations: [j.location || ""].concat((j.secondaryLocations || []).map((s) => s.location)).filter(Boolean),
    url: j.jobUrl || j.applyUrl,
    posted: String(j.publishedAt || "").slice(0, 10),
    level: j.employmentType === "Intern" ? "intern" : levelFromTitle(j.title),
    source: "ashby",
  }));
}
async function fromLever(company, site) {
  const d = await fetchJSON(`https://api.lever.co/v0/postings/${site}?mode=json`);
  return (Array.isArray(d) ? d : []).filter((j) => !SENIOR_RX.test(j.text)).map((j) => ({
    company,
    title: j.text,
    category: categorize(j.text, ""),
    locations: [j.categories?.location || ""].filter(Boolean),
    url: j.hostedUrl,
    posted: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : "",
    level: levelFromTitle(j.text),
    source: "lever",
  }));
}

// ── deterministic fit scoring (title tier + skills + recency + target + level)
// Tiers not fake-precision percentages — the #1 complaint about commercial
// match scores is inflated exactness.
const TARGETS = /\b(google|deepmind|meta|apple|amazon|microsoft|figma|notion|stripe|vercel|linear|anthropic|openai|riot games|epic games|roblox|naughty dog|nvidia|unity|valve|blizzard|nintendo|tiktok|bytedance|adobe|airbnb|netflix|ramp|retool|perplexity|scale ai|cursor|databricks|datadog|duolingo|palantir|supabase|replit|cohere|elevenlabs)\b/i;
const TITLE_TIER = [
  [1.0, /\b(graphics|render(ing)?|technical artist|shader|game|gameplay|engine|3d|unreal|unity|creative technolog|design engineer|ux engineer)\b/i],
  [0.7, /\b(product design|ux|ui|interaction design|visual design|software engineer|swe|full[- ]?stack|front[- ]?end|founding engineer|web develop)\b/i],
  [0.3, /\b(data|machine learning|\bml\b|\bai\b|product manager|research|mobile|ios|android|developer|engineer)\b/i],
];
const SKILL_RX = [/c\+\+/i, /\b(opengl|webgl|glsl|hlsl|vulkan)\b/i, /\bunreal\b/i, /\bunity\b/i, /\breact\b/i, /\b(typescript|javascript)\b/i, /\bnext\.?js\b/i, /\bfigma\b/i, /\bpython\b/i, /\b(three\.?js|r3f)\b/i];

function fitScore(r) {
  let tier = 0;
  for (const [v, rx] of TITLE_TIER) if (rx.test(r.title)) { tier = v; break; }
  const skillN = Math.min(1, SKILL_RX.filter((rx) => rx.test(r.title)).length / 2);
  const age = Math.max(0, (Date.now() - new Date(r.posted || "2000-01-01").getTime()) / 864e5);
  const recency = Math.exp(-age / 20);
  const target = TARGETS.test(r.company) ? 1 : 0;
  const level = r.level === "intern" ? 1 : r.level === "new-grad" ? 0.9 : 0.55;
  return 0.34 * tier + 0.16 * skillN + 0.2 * recency + 0.12 * target + 0.18 * level;
}
const tierIcon = (fit) => (fit >= 0.6 ? "⭐" : fit >= 0.48 ? "◐" : "");

// ── main ─────────────────────────────────────────────────────────────────────
// previous run's data → 🆕 detection + firstSeen persistence
let prevKeys = new Set();
let prevFirstSeen = {};
try {
  const prev = JSON.parse(readFileSync(join(ROOT, "data", "roles.json"), "utf8"));
  for (const r of prev) {
    const k = `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ");
    prevKeys.add(k);
    if (r.firstSeen) prevFirstSeen[k] = r.firstSeen;
  }
} catch {}

const collectedATS = [];   // ATS rows first → dedupe prefers the fresher board row
const collectedAgg = [];
const errors = [];
const atsCounts = {};

const atsJobs = [];
for (const [company, token] of Object.entries(ATS_TARGETS.greenhouse))
  atsJobs.push(fromGreenhouse(company, token).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`gh:${company}: ${e.message}`)));
for (const [company, org] of Object.entries(ATS_TARGETS.ashby))
  atsJobs.push(fromAshby(company, org).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`ashby:${company}: ${e.message}`)));
for (const [company, site] of Object.entries(ATS_TARGETS.lever))
  atsJobs.push(fromLever(company, site).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`lever:${company}: ${e.message}`)));

await Promise.all([
  ...atsJobs,
  fetchJSON(SOURCES.simplifyIntern)
    .then((d) => collectedAgg.push(...fromSimplify(d, "intern")))
    .catch((e) => errors.push(`simplifyIntern: ${e.message}`)),
  fetchJSON(SOURCES.simplifyNewGrad)
    .then((d) => collectedAgg.push(...fromSimplify(d, "new-grad")))
    .catch((e) => errors.push(`simplifyNewGrad: ${e.message}`)),
  fetchText(SOURCES.jobrightDesign)
    .then((t) => collectedAgg.push(...fromJobrightDesign(t)))
    .catch((e) => errors.push(`jobrightDesign: ${e.message}`)),
]);

// stale-board tripwire (research trap: 200 + empty ≠ healthy)
for (const [company, n] of Object.entries(atsCounts)) if (n === 0) errors.push(`ats:${company}: 0 rows (stale board or bad slug?)`);

const collected = [...collectedATS, ...collectedAgg];
if (collected.length === 0) {
  console.error("All sources failed:", errors);
  process.exit(1);
}

// US filter + dedupe (ATS rows win) + fit + firstSeen/ghost
const seen = new Set();
const roles = [];
const today = new Date().toISOString().slice(0, 10);
for (const r of collected) {
  if (!isUS(r.locations)) continue;
  const key = `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ");
  if (seen.has(key)) continue;
  seen.add(key);
  r.isNew = prevKeys.size > 0 && !prevKeys.has(key);
  r.firstSeen = prevFirstSeen[key] || r.posted || today;
  r.fit = Math.round(fitScore(r) * 1000) / 1000;
  const age = (Date.now() - new Date(r.posted || today).getTime()) / 864e5;
  if (age > GHOST_DAYS && r.source !== "greenhouse" && r.source !== "ashby" && r.source !== "lever") r.ghost = true;
  roles.push(r);
}
roles.sort((a, b) => (b.posted || "").localeCompare(a.posted || ""));

// ── emit ─────────────────────────────────────────────────────────────────────
mkdirSync(join(ROOT, "data"), { recursive: true });

writeFileSync(join(ROOT, "data", "roles.json"), JSON.stringify(roles, null, 1));

const csvEsc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
writeFileSync(
  join(ROOT, "data", "roles.csv"),
  ["posted,company,title,category,level,location,fit,url,source"]
    .concat(roles.map((r) => [r.posted, r.company, r.title, r.category, r.level, r.locations.join(" · "), r.fit, r.url, r.source].map(csvEsc).join(",")))
    .join("\n")
);

// ROLES.md — fresh first, then targets, then categories (fit-sorted within)
const cutoff = new Date(Date.now() - RECENT_DAYS * 864e5).toISOString().slice(0, 10);
const freshCut = new Date(Date.now() - FRESH_HOURS * 36e5).toISOString().slice(0, 10);
const recent = roles.filter((r) => r.posted >= cutoff);
const ORDER = ["Graphics / Game / 3D", "Design / UX", "Software Engineering", "Data / AI / ML", "Product", "Quant", "Hardware", "Other"];
const counts = Object.fromEntries(ORDER.map((c) => [c, roles.filter((r) => r.category === c).length]));
const byFit = (a, b) => b.fit - a.fit || (b.posted || "").localeCompare(a.posted || "");

const targetRows = recent.filter((r) => TARGETS.test(r.company)).sort(byFit);
const freshRows = recent.filter((r) => r.posted >= freshCut).sort(byFit).slice(0, 120);
const newCount = roles.filter((r) => r.isNew).length;

const row = (r) => `| ${tierIcon(r.fit)}${r.isNew ? " 🆕" : ""} ${r.posted} | ${r.company} | ${r.title.replace(/\|/g, "/")} | ${(r.locations[0] || "").replace(/\|/g, "/")} | ${r.level} | [link](${r.url}) |\n`;
const HEAD = `| Posted | Company | Role | Location | Level | Apply |\n|---|---|---|---|---|---|\n`;

let md = `# 📋 Open Roles — auto-updated twice daily\n\n`;
md += `_Last updated: ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · ${roles.length} active US roles (🆕 ${newCount} since last run) · sources: Simplify + jobright + ${Object.values(ATS_TARGETS).reduce((n, o) => n + Object.keys(o).length, 0)} company boards direct · ⭐ strong fit ◐ good fit · dashboard: [leebrian.dev/tracker](https://leebrian.dev/tracker) · full data: [\`data/roles.csv\`](data/roles.csv)_\n\n`;
md += `| Category | Active total |\n|---|---|\n` + ORDER.map((c) => `| ${c} | ${counts[c]} |`).join("\n") + "\n";
if (freshRows.length) {
  md += `\n## 🔥 Fresh — posted in the last ${FRESH_HOURS}h (${freshRows.length})\n\n` + HEAD;
  for (const r of freshRows) md += row(r);
}
if (targetRows.length) {
  md += `\n## 🎯 Target companies (${targetRows.length} recent)\n\n` + HEAD;
  for (const r of targetRows) md += row(r);
}
for (const cat of ORDER) {
  const rows = recent.filter((r) => r.category === cat).sort(byFit);
  if (rows.length === 0) continue;
  md += `\n## ${cat} (${rows.length} recent)\n\n` + HEAD;
  for (const r of rows) md += row(r);
}
if (errors.length) md += `\n> ⚠️ Source issues this run: ${errors.join("; ")}\n`;
writeFileSync(join(ROOT, "ROLES.md"), md);

console.log(`OK — ${roles.length} US roles (${recent.length} recent, ${freshRows.length} fresh-48h, ATS direct: ${collectedATS.length}) → data + ROLES.md`);
if (errors.length) console.warn("source errors:", errors);
