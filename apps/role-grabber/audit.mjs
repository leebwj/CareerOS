// CareerOS · role-grabber — coverage audit.
//
// The grabber can fail silently in three different ways, and none of them look
// like an error: a board goes stale and returns 0, a live posting gets dropped
// by a filter, or a role lands in the wrong category and never surfaces. This
// re-fetches every configured board INDEPENDENTLY of the pipeline and diffs the
// live boards against data/roles.json, so "we're not missing anything" is a
// measurement rather than an assumption.
//
//   node apps/role-grabber/audit.mjs               full audit
//   node apps/role-grabber/audit.mjs --focus design early-career design only
//   node apps/role-grabber/audit.mjs --json        machine-readable
//
// Exits 1 if anything is MISSING or a board went dark, so cron can shout.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const FEED = join(ROOT, "data", "roles.json");
const OUT = join(ROOT, "data", "audit.json");
const JSON_ONLY = process.argv.includes("--json");
const FOCUS = (process.argv.includes("--focus") && process.argv[process.argv.indexOf("--focus") + 1]) || "";

// What counts as early-career, and what counts as a role Brian wants. Kept
// deliberately WIDER than the grabber's own filters — the audit's job is to
// catch things the grabber's narrower rules threw away.
const EARLY = /\b(intern(ship)?|new ?grad|university ?grad|campus|co-?op|early ?career|apprentice|graduate (program|scheme)|student)\b/i;
const WANT_SWE = /\b(software|engineer|engineering|developer|swe|backend|back[- ]end|front[- ]?end|full[- ]?stack|infrastructure|platform|systems|mobile|ios|android|graphics|rendering|game|gameplay|shader|machine learning|\bml\b|\bai\b)\b/i;
const WANT_DESIGN = /\b(design(er)?|ux|ui|ui\/ux|user experience|user interface|user research(er)?|interaction|visual|brand|motion|prototyp\w*|human interface|creative technolog\w*)\b/i;
const WANT_PRODUCT = /\b(product manager|product management|associate product manager|\bapm\b|rotational product manager|product owner|technical product manager)\b/i;
// things that LOOK like design but are a different profession entirely
const NOT_DESIGN = /\b(asic|vlsi|\brtl\b|physical design|design verification|silicon|semiconductor|circuit|analog|\bpcb\b|mechanical design|electrical design|thermal|landscape architect\w*|architectural|interior design|civil|\bhvac\b|piping|\bpll\b|fashion|apparel|textile)\b/i;

const wanted = (t) => (WANT_DESIGN.test(t) && !NOT_DESIGN.test(t)) || WANT_PRODUCT.test(t) || (WANT_SWE.test(t) && !NOT_DESIGN.test(t));
const kindOf = (t) => (WANT_DESIGN.test(t) && !NOT_DESIGN.test(t)) ? "design" : WANT_PRODUCT.test(t) ? "product" : "swe";

// The grabber is deliberately US-only, so a Bangalore or Seoul posting is not a
// miss. Location-blank and vague strings ("In-Office", "Remote") are treated as
// possibly-US and kept — better a false alarm than a silent gap.
const NON_US_RX = /\b(india|bangalore|bengaluru|hyderabad|pune|gurgaon|noida|china|shanghai|beijing|shenzhen|hong kong|taiwan|taipei|japan|tokyo|osaka|korea|seoul|singapore|australia|sydney|melbourne|canada|toronto|vancouver|montr[eé]al|ottawa|calgary|uk|united kingdom|england|london|manchester|ireland|dublin|france|paris|lyon|germany|berlin|munich|hamburg|frankfurt|spain|barcelona|madrid|netherlands|amsterdam|belgium|brussels|gent|ghent|sweden|stockholm|poland|warsaw|krakow|romania|bucharest|switzerland|zurich|geneva|israel|tel aviv|brazil|mexico|argentina|chile|colombia|new zealand|philippines|manila|vietnam|malaysia|thailand|bangkok|turkey|istanbul|uae|dubai|abu dhabi|denmark|copenhagen|norway|finland|helsinki|italy|rome|milan|portugal|lisbon|czech|prague|austria|vienna|egypt|nigeria|south africa|kenya|serbia|belgrade|novi sad|ukraine|kyiv|greece|athens|hungary|budapest|bulgaria|sofia|croatia|zagreb|estonia|tallinn|lithuania|latvia|slovakia|slovenia|iceland|luxembourg|malta|cyprus|morocco|tunisia|jordan|saudi|qatar|kuwait|bahrain|pakistan|bangladesh|sri lanka|nepal|indonesia|jakarta|peru|uruguay|ecuador|costa rica|panama|guatemala|dominican)\b/i;
const maybeUS = (loc) => !NON_US_RX.test(String(loc || ""));

// ── fetchers, mirroring the grabber's sources but standalone ────────────────
const UA = { "user-agent": "careeros-audit", accept: "application/json" };
const get = async (u) => {
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
};
const FETCH = {
  greenhouse: async (tok) => ((await get(`https://boards-api.greenhouse.io/v1/boards/${tok}/jobs`)).jobs || [])
    .map((j) => ({ title: j.title, loc: j.location?.name || "", url: j.absolute_url })),
  ashby: async (tok) => ((await get(`https://api.ashbyhq.com/posting-api/job-board/${tok}`)).jobs || [])
    .map((j) => ({ title: j.title, loc: j.location || "", url: j.jobUrl })),
  lever: async (tok) => ((await get(`https://api.lever.co/v0/postings/${tok}?mode=json`)) || [])
    .map((j) => ({ title: j.text, loc: j.categories?.location || "", url: j.hostedUrl })),
};

// The same role is worded differently by each source — Lever says "Software
// Engineer, Internship" where Simplify says "Software Engineer Intern", and the
// grabber dedupes to one of them. Literal comparison reports those as missing,
// which is a false alarm that would bury the real ones. So titles are
// canonicalised (internship→intern, parentheticals dropped, synonyms folded)
// and then compared as TOKEN SETS: a board role counts as covered if the feed
// has a role at the same company whose tokens contain all of its meaningful
// ones. Errs toward "covered" — a missed alarm beats an unusable report.
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const STOP = new Set(["the", "a", "an", "of", "and", "for", "to", "at", "in", "on", "with", "or", "us", "usa"]);
const canon = (s) => String(s || "").toLowerCase()
  .replace(/\([^)]*\)/g, " ")                       // drop "(Fall 2026)", "(2027 Start)"
  .replace(/\binternships?\b/g, "intern")
  .replace(/\bnew ?grads?\b/g, "newgrad")
  .replace(/\buniversity ?grad\w*\b/g, "newgrad")
  .replace(/\bco[- ]?op\b/g, "intern")
  .replace(/\bearly ?career\b/g, "newgrad")
  .replace(/\bsr\b/g, "senior")
  .replace(/[^a-z0-9]+/g, " ").trim();
const tokens = (s) => new Set(canon(s).split(" ").filter((w) => w && !STOP.has(w)));
const covers = (feedTok, boardTok) => { for (const t of boardTok) if (!feedTok.has(t)) return false; return true; };

async function main() {
  const feed = JSON.parse(readFileSync(FEED, "utf8"));
  // index the feed's title token-sets per company, plus a global set — a role
  // can arrive under "Palantir" or "Palantir Technologies" depending on source
  const byCompany = new Map();
  const anyTitle = [];
  for (const r of feed) {
    const t = tokens(r.title);
    anyTitle.push(t);
    const key = norm(r.company).split(" ")[0];       // "palantir technologies" → "palantir"
    if (!byCompany.has(key)) byCompany.set(key, []);
    byCompany.get(key).push(t);
  }
  const inFeed = (co, title) => {
    const bt = tokens(title);
    if (!bt.size) return true;
    const pool = byCompany.get(norm(co).split(" ")[0]) || [];
    return pool.some((ft) => covers(ft, bt)) || anyTitle.some((ft) => covers(ft, bt));
  };

  // read the grabber's own target map so the audit can never drift from it.
  // Comment lines are stripped first — otherwise "// v2b (research-verified…)"
  // parses as a company name and the report fills with phantom rows.
  const src = readFileSync(join(ROOT, "grab.mjs"), "utf8");
  const block = src.slice(src.indexOf("const ATS_TARGETS"), src.indexOf("const NO_AUTO_TARGET"))
    .split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  const targets = {};
  for (const kind of ["greenhouse", "ashby", "lever"]) {
    const seg = block.slice(block.indexOf(kind + ": {"), block.indexOf("},", block.indexOf(kind + ": {")));
    for (const m of seg.matchAll(/"?([^",:{]+?)"?\s*:\s*"([^"]+)"/g)) {
      const co = m[1].trim();
      if (co && co !== kind) (targets[kind] ||= {})[co] = m[2];
    }
  }

  const rows = [], dark = [], missing = [];
  await Promise.all(Object.entries(targets).flatMap(([kind, map]) =>
    Object.entries(map).map(async ([co, tok]) => {
      let jobs;
      try { jobs = await FETCH[kind](tok); }
      catch (e) { dark.push({ co, kind, tok, err: e.message }); return; }
      if (!jobs.length) { dark.push({ co, kind, tok, err: "0 rows" }); return; }
      const early = jobs.filter((j) => EARLY.test(j.title) && wanted(j.title) && maybeUS(j.loc));
      const gone = early.filter((j) => !inFeed(co, j.title));
      rows.push({ co, kind, total: jobs.length, early: early.length, missing: gone.length });
      for (const j of gone) missing.push({ co, kind: kindOf(j.title), ...j });
    })));

  const sum = { boards: rows.length, dark: dark.length, live: rows.reduce((a, r) => a + r.early, 0), missing: missing.length };
  if (JSON_ONLY) { console.log(JSON.stringify({ sum, rows, dark, missing }, null, 2)); }
  else {
    console.log(`\n===== ROLE-GRABBER COVERAGE AUDIT =====`);
    console.log(`boards probed: ${sum.boards} · dark: ${sum.dark} · live early-career matches: ${sum.live} · MISSING FROM FEED: ${sum.missing}\n`);
    const show = FOCUS ? missing.filter((m) => m.kind === FOCUS) : missing;
    if (show.length) {
      console.log(`--- on the board but NOT in your feed${FOCUS ? ` (${FOCUS} only)` : ""} ---`);
      for (const m of show.sort((a, b) => a.co.localeCompare(b.co)))
        console.log(`  [${m.kind.padEnd(7)}] ${m.co.slice(0, 20).padEnd(20)} ${m.title.slice(0, 58)}\n      ${m.loc.slice(0, 44)} · ${m.url}`);
    } else console.log("--- nothing missing: every live early-career role on every board is in the feed ---");
    if (dark.length) {
      console.log(`\n--- boards returning nothing (stale slug, renamed, or genuinely empty) ---`);
      for (const d of dark.sort((a, b) => a.co.localeCompare(b.co))) console.log(`  ${d.co.slice(0, 24).padEnd(24)} ${d.kind}/${d.tok} — ${d.err}`);
    }
  }
  writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), sum, rows, dark, missing }, null, 2) + "\n");
  if (sum.missing || sum.dark) process.exitCode = 1;
}
main();
