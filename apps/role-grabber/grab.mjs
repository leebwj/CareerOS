// CareerOS · role-grabber (lite)
// Pulls open tech + design roles from curated public sources, normalizes them
// into one schema, and emits a daily sheet: data/roles.json + data/roles.csv
// (everything) and ROLES.md (recent, human-readable).
//
// Zero dependencies — Node 20+ (global fetch). Run: node grab.mjs

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const RECENT_DAYS = 30; // ROLES.md shows roles posted within this window

const SOURCES = {
  simplifyIntern:
    "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
  simplifyNewGrad:
    "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
  jobrightDesign:
    "https://raw.githubusercontent.com/jobright-ai/2026-Design-Internship/master/README.md",
};

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
  return "Other";
}

// ── US filter (locations like "San Jose, CA", "Remote in USA", "NYC") ───────
function isUS(locations) {
  if (!locations || locations.length === 0) return false;
  return locations.some((raw) => {
    const l = String(raw).trim();
    if (/\b(canada|uk|united kingdom|london|toronto|vancouver|india|singapore|germany|ireland|australia|japan|korea|mexico|brazil)\b/i.test(l)) return false;
    return /,\s*[A-Z]{2}(\s|$)/.test(l) || /\b(usa|united states|u\.s\.)\b/i.test(l) || /^remote$/i.test(l) || /remote in usa/i.test(l) || /\b(nyc|sf bay|bay area)\b/i.test(l);
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

// ── source parsers → normalized {company,title,category,locations,url,posted,level,source} ──
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
    // "Jul 02" → ISO; months later than the current month belong to last year
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

// ── main ─────────────────────────────────────────────────────────────────────
// previous run's keys (last committed data) → mark newly-appeared roles 🆕
let prevKeys = new Set();
try {
  const prev = JSON.parse(readFileSync(join(ROOT, "data", "roles.json"), "utf8"));
  prevKeys = new Set(prev.map((r) => `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ")));
} catch {}

const collected = [];
const errors = [];

await Promise.all([
  fetchJSON(SOURCES.simplifyIntern)
    .then((d) => collected.push(...fromSimplify(d, "intern")))
    .catch((e) => errors.push(`simplifyIntern: ${e.message}`)),
  fetchJSON(SOURCES.simplifyNewGrad)
    .then((d) => collected.push(...fromSimplify(d, "new-grad")))
    .catch((e) => errors.push(`simplifyNewGrad: ${e.message}`)),
  fetchText(SOURCES.jobrightDesign)
    .then((t) => collected.push(...fromJobrightDesign(t)))
    .catch((e) => errors.push(`jobrightDesign: ${e.message}`)),
]);

if (collected.length === 0) {
  console.error("All sources failed:", errors);
  process.exit(1);
}

// US filter + dedupe on company|title|first-location
const seen = new Set();
const roles = [];
for (const r of collected) {
  if (!isUS(r.locations)) continue;
  const key = `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ");
  if (seen.has(key)) continue;
  seen.add(key);
  r.isNew = prevKeys.size > 0 && !prevKeys.has(key);
  roles.push(r);
}
roles.sort((a, b) => (b.posted || "").localeCompare(a.posted || ""));

// ── emit ─────────────────────────────────────────────────────────────────────
mkdirSync(join(ROOT, "data"), { recursive: true });

writeFileSync(join(ROOT, "data", "roles.json"), JSON.stringify(roles, null, 1));

const csvEsc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
writeFileSync(
  join(ROOT, "data", "roles.csv"),
  ["posted,company,title,category,level,location,url,source"]
    .concat(roles.map((r) => [r.posted, r.company, r.title, r.category, r.level, r.locations.join(" · "), r.url, r.source].map(csvEsc).join(",")))
    .join("\n")
);

// ROLES.md — recent window, grouped by category (Brian's poles first)
const cutoff = new Date(Date.now() - RECENT_DAYS * 864e5).toISOString().slice(0, 10);
const recent = roles.filter((r) => r.posted >= cutoff);
const ORDER = ["Graphics / Game / 3D", "Design / UX", "Software Engineering", "Data / AI / ML", "Product", "Quant", "Hardware", "Other"];
const counts = Object.fromEntries(ORDER.map((c) => [c, roles.filter((r) => r.category === c).length]));

// target-company hit list (master plan: big tech · design-forward · game studios · AI labs)
const TARGETS = /\b(google|deepmind|meta|apple|amazon|microsoft|figma|notion|stripe|vercel|linear|anthropic|openai|riot games|epic games|roblox|naughty dog|nvidia|unity|valve|blizzard|nintendo|tiktok|bytedance|adobe|airbnb|netflix|ramp|retool|perplexity|scale ai)\b/i;
const targetRows = recent.filter((r) => TARGETS.test(r.company));
const newCount = roles.filter((r) => r.isNew).length;

const row = (r) => `| ${r.isNew ? "🆕 " : ""}${r.posted} | ${r.company} | ${r.title.replace(/\|/g, "/")} | ${(r.locations[0] || "").replace(/\|/g, "/")} | ${r.level} | [link](${r.url}) |\n`;
const HEAD = `| Posted | Company | Role | Location | Level | Apply |\n|---|---|---|---|---|---|\n`;

let md = `# 📋 Open Roles — auto-updated daily\n\n`;
md += `_Last updated: ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · ${roles.length} active US roles total (🆕 ${newCount} since last run) · showing roles posted in the last ${RECENT_DAYS} days (${recent.length}) · full data: [\`data/roles.csv\`](data/roles.csv)_\n\n`;
md += `| Category | Active total |\n|---|---|\n` + ORDER.map((c) => `| ${c} | ${counts[c]} |`).join("\n") + "\n";
if (targetRows.length) {
  md += `\n## 🎯 Target companies (${targetRows.length} recent)\n\n` + HEAD;
  for (const r of targetRows) md += row(r);
}
for (const cat of ORDER) {
  const rows = recent.filter((r) => r.category === cat);
  if (rows.length === 0) continue;
  md += `\n## ${cat} (${rows.length} recent)\n\n` + HEAD;
  for (const r of rows) md += row(r);
}
if (errors.length) md += `\n> ⚠️ Sources with errors this run: ${errors.join("; ")}\n`;
writeFileSync(join(ROOT, "ROLES.md"), md);

console.log(`OK — ${roles.length} US roles (${recent.length} recent) → data/roles.{json,csv} + ROLES.md`);
if (errors.length) console.warn("source errors:", errors);
