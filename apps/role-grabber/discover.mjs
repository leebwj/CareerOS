// CareerOS · role-grabber — board discovery.
//
// The structural risk: a target company with no DIRECT source is visible only
// if Simplify happens to carry it. That is how a Google 2027 internship went
// missing — Brian found out from LinkedIn, not from his own feed. Fixing that
// company-by-company does not scale (75 of 175 target companies were in that
// state), so this sweeps instead: for every target with no direct source, try
// the standard ATS platforms against generated slug candidates and report which
// ones have a real, reachable board.
//
//   node apps/role-grabber/discover.mjs            sweep every unsourced target
//   node apps/role-grabber/discover.mjs --all      include already-sourced ones
//   node apps/role-grabber/discover.mjs --json     machine-readable
//
// Output is a ready-to-paste ATS_TARGETS block for whatever it finds.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(join(ROOT, "grab.mjs"), "utf8");
const JSON_ONLY = process.argv.includes("--json");

// ── who is already covered ──────────────────────────────────────────────────
const atsBlock = SRC.slice(SRC.indexOf("const ATS_TARGETS"), SRC.indexOf("const NO_AUTO_TARGET"))
  .split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
const PLATFORM_KEYS = ["greenhouse", "ashby", "lever", "smartrecruiters", "workday", "workable", "recruitee", "tenant", "wd", "site"];
const sourced = [...atsBlock.matchAll(/"?([A-Za-z0-9][^":,{}]*?)"?\s*:\s*["{]/g)]
  .map((m) => m[1].trim()).filter((x) => !PLATFORM_KEYS.includes(x));
// companies with a hand-written adapter
const CUSTOM = ["Amazon", "Netflix", "Microsoft", "Google"];

// ── the dream list ──────────────────────────────────────────────────────────
const ti = SRC.indexOf("const TARGETS = new RegExp");
const targets = [...SRC.slice(ti, SRC.indexOf('].join("|")', ti)).matchAll(/"([^"]+)"/g)]
  .map((m) => m[1]).filter((x) => x.length > 2 && !x.includes("\\b("));

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const covered = [...sourced, ...CUSTOM].map(norm);
const isCovered = (t) => { const n = norm(t); return covered.some((c) => c === n || c.includes(n) || n.includes(c)); };

// ── slug candidates ─────────────────────────────────────────────────────────
// Boards are named inconsistently (andurilindustries, doordashusa, remotecom),
// so try a spread rather than one guess.
function slugs(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const squash = base.replace(/\s+/g, "");
  const dash = base.replace(/\s+/g, "-");
  const first = base.split(" ")[0];
  const out = new Set([squash, dash, first, squash + "inc", squash + "games", squash + "studios", squash + "technologies", squash + "usa", squash + "com"]);
  if (base.includes(" ")) out.add(base.split(" ").map((w) => w[0]).join(""));
  return [...out].filter((s) => s.length > 2);
}

const UA = { "user-agent": "careeros-discover", accept: "application/json" };
const timeout = (ms) => { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; };

// A probe counts as a HIT only if the board returns actual postings — an empty
// 200 means a squatted or retired slug, which would trip the stale-board alarm
// on every run if we wired it in.
const PROBES = [
  { kind: "greenhouse", url: (s) => `https://boards-api.greenhouse.io/v1/boards/${s}/jobs`, count: (d) => (d.jobs || []).length, sample: (d) => (d.jobs || [])[0]?.title },
  { kind: "ashby", url: (s) => `https://api.ashbyhq.com/posting-api/job-board/${s}`, count: (d) => (d.jobs || []).length, sample: (d) => (d.jobs || [])[0]?.title },
  { kind: "lever", url: (s) => `https://api.lever.co/v0/postings/${s}?mode=json`, count: (d) => (Array.isArray(d) ? d.length : 0), sample: (d) => (Array.isArray(d) ? d[0]?.text : "") },
  { kind: "smartrecruiters", url: (s) => `https://api.smartrecruiters.com/v1/companies/${s}/postings?limit=10`, count: (d) => (d.content || []).length, sample: (d) => (d.content || [])[0]?.name },
  { kind: "recruitee", url: (s) => `https://${s}.recruitee.com/api/offers/`, count: (d) => (d.offers || []).length, sample: (d) => (d.offers || [])[0]?.title },
];

// A reachable board is NOT proof it is the right company. Short generic slugs
// are squatted by unrelated firms: greenhouse/bethesda is Bethesda HEALTH and
// returns "Physical Therapist"; greenhouse/industrial is a door company, not
// Industrial Light & Magic; recruitee/meta is someone's one-role board. Wiring
// those in would inject unrelated jobs into the feed under a trusted company
// name — worse than the gap it closes. So confirm the board IDENTIFIES as the
// company before accepting it.
const BOARD_NAME = {
  greenhouse: async (s) => { const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${s}`, { headers: UA, signal: timeout(10000) }); return r.ok ? (await r.json())?.name : null; },
  ashby: async (s) => { const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${s}`, { headers: UA, signal: timeout(10000) }); return r.ok ? (await r.json())?.organizationName ?? null : null; },
  smartrecruiters: async (s) => { const r = await fetch(`https://api.smartrecruiters.com/v1/companies/${s}`, { headers: UA, signal: timeout(10000) }); return r.ok ? (await r.json())?.name : null; },
  lever: async () => null,
  recruitee: async (s) => { const r = await fetch(`https://${s}.recruitee.com/api/c/`, { headers: UA, signal: timeout(10000) }); return r.ok ? (await r.json())?.company?.name ?? null : null; },
};
const tokens = (s) => new Set(String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !["the", "inc", "llc", "ltd", "games", "studio", "studios", "interactive", "entertainment", "technologies", "labs", "group"].includes(w)));
// One shared word is far too weak: "bethesda" matches "Bethesda Physical
// Therapy", "industrial light" matches "Industrial Door Company", "moon
// studios" matches "Moon Creative Lab". Require the wanted name's distinctive
// words to ALL appear AND the board to add at most one word of its own —
// otherwise it is a different organisation that happens to share a word.
function nameMatches(want, got) {
  if (!got) return false;
  const a = tokens(want), b = tokens(got);
  if (!a.size || !b.size) return false;
  if (norm(got) === norm(want)) return true;
  for (const t of a) if (!b.has(t)) return false;               // every wanted word present
  let extra = 0;
  for (const t of b) if (!a.has(t)) extra++;
  return extra <= 1;
}

async function probe(slug, p, want) {
  try {
    const r = await fetch(p.url(slug), { headers: UA, signal: timeout(12000) });
    if (!r.ok) return null;
    const d = await r.json();
    const n = p.count(d);
    if (!n) return null;
    let boardName = null;
    try { boardName = await BOARD_NAME[p.kind]?.(slug); } catch {}
    const ok = nameMatches(want, boardName);
    // Lever exposes no board name, so fall back to size — a real target
    // company's board is not two postings.
    // Size alone is NOT proof of identity — ashby/playground has 16 jobs and is
    // a B2B SaaS company ("SDR", "SaaS Account Executive"), not Playground
    // Games. Boards that expose no name are reported for a human to eyeball
    // rather than auto-accepted.
    if (ok) return { kind: p.kind, slug, n, boardName, sample: String(p.sample(d) || "").slice(0, 46) };
    if (boardName === null && n >= 10) return { unverified: true, kind: p.kind, slug, n, boardName: "(no name exposed)", sample: String(p.sample(d) || "").slice(0, 60) };
    return { rejected: true, kind: p.kind, slug, n, boardName: boardName || "(no name)", sample: String(p.sample(d) || "").slice(0, 40) };
  } catch { return null; }
}

async function discover(name) {
  const rejects = [];
  for (const s of slugs(name)) {
    for (const p of PROBES) {
      const hit = await probe(s, p, name);
      if (!hit) continue;
      if (hit.rejected) { rejects.push(hit); continue; }
      return { name, ...hit };
    }
  }
  return rejects.length ? { name, rejectedOnly: rejects } : null;
}

const pool = process.argv.includes("--all") ? targets : targets.filter((t) => !isCovered(t));
if (!JSON_ONLY) console.log(`sweeping ${pool.length} target companies with no direct source…\n`);

const found = [], missed = [], rejected = [];
const LIMIT = 6;                                    // be polite to the ATS APIs
for (let i = 0; i < pool.length; i += LIMIT) {
  const batch = await Promise.all(pool.slice(i, i + LIMIT).map(discover));
  for (const [k, res] of batch.entries()) {
    const nm = pool[i + k];
    if (res && !res.rejectedOnly) {
      found.push(res);
      if (!JSON_ONLY) console.log(`  ✓ ${nm.padEnd(22)} ${(res.kind + "/" + res.slug).padEnd(30)} ${res.n} jobs · board says "${res.boardName}"`);
    } else {
      missed.push(nm);
      if (res?.rejectedOnly) { rejected.push({ name: nm, tried: res.rejectedOnly });
        if (!JSON_ONLY) for (const r of res.rejectedOnly.slice(0, 1)) console.log(`  ✗ ${nm.padEnd(22)} ${(r.kind + "/" + r.slug).padEnd(30)} rejected — board says "${r.boardName}" (${r.n} jobs, e.g. ${r.sample})`); }
    }
  }
}

if (JSON_ONLY) console.log(JSON.stringify({ found, missed }, null, 2));
else {
  console.log(`\n=== ${found.length} boards discovered · ${missed.length} still unreachable ===\n`);
  if (found.length) {
    console.log("paste into ATS_TARGETS:");
    for (const kind of [...new Set(found.map((f) => f.kind))]) {
      const rows = found.filter((f) => f.kind === kind).map((f) => `"${f.name}": "${f.slug}"`).join(", ");
      console.log(`  ${kind}: { ${rows} },`);
    }
  }
  console.log(`\nno public board found (custom site, or none): ${missed.join(", ")}`);
}
writeFileSync(join(ROOT, "data", "discover.json"), JSON.stringify({ generated: new Date().toISOString(), found, missed }, null, 2) + "\n");
