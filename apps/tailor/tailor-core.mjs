// Tailor — compose a job-targeted résumé from the real résumé blocks, write a
// fact-guarded cover letter, and render both through the same pipeline as the
// real résumés (docx-gen → docx → Word COM → PDF, one-page check).
//
//   node tailor-core.mjs --selftest     (MOCK end-to-end run, no model call)

import { buildDocx } from "../resume/docx-gen.mjs";
import { variants, blocks } from "../resume/resume-data.mjs";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { SYSTEM, buildUser } from "./prompt.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
export const OUT = join(ROOT, "out");

export function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

// ── catalog: a plain-text view of the blocks for the model ──────────────────
const textOf = (runs) => runs.map((r) => r.t).join("");
const entryView = (paras) => ({
  head: textOf(paras[0].left),
  when: textOf(paras[0].right),
  bullets: paras.slice(1).map((p) => textOf(p.runs)),
});
const lastHeadingIndex = (paras) => paras.reduce((a, p, i) => (p.kind === "heading" ? i : a), -1);
export const skillLinesOf = (v) => variants[v].paras.slice(lastHeadingIndex(variants[v].paras) + 1);
export const skillsHeadingOf = (v) => variants[v].paras[lastHeadingIndex(variants[v].paras)].text;

export function catalog() {
  const map = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, entryView(v)]));
  return {
    variants: Object.keys(variants),
    alephAngles: Object.fromEntries(Object.entries(blocks.ALEPH).map(([k, v]) => [k, entryView(v).bullets])),
    experience: map(blocks.SHARED),
    projects: map(blocks.PROJECTS),
    skills: Object.fromEntries(Object.keys(variants).map((v) => [v, { heading: skillsHeadingOf(v), lines: skillLinesOf(v).map((p) => textOf(p.runs)) }])),
    coursework: blocks.COURSES,
  };
}

// ── composition → résumé spec (verbatim blocks only, so it cannot lie) ──────
export function composeResume(c) {
  const errors = [];
  const aleph = blocks.ALEPH[c.aleph] || (errors.push(`unknown internship angle "${c.aleph}"`), blocks.ALEPH.ENG);
  const course = blocks.COURSES[c.coursework] || (errors.push(`unknown coursework "${c.coursework}"`), blocks.COURSES.ENG);
  const seen = new Set();
  const expParas = (Array.isArray(c.experience) ? c.experience : []).flatMap((id) => {
    if (seen.has(id)) return [];
    seen.add(id);
    if (!blocks.SHARED[id]) { errors.push(`unknown experience "${id}"`); return []; }
    return blocks.SHARED[id];
  });
  const projParas = [];
  for (const p of Array.isArray(c.projects) ? c.projects.slice(0, 3) : []) {
    const B = blocks.PROJECTS[p?.id];
    if (!B) { errors.push(`unknown project "${p?.id}"`); continue; }
    const bullets = B.slice(1);
    const idxs = (Array.isArray(p.bullets) && p.bullets.length ? p.bullets : bullets.map((_, i) => i)).filter((i) => Number.isInteger(i) && bullets[i]);
    projParas.push(B[0], ...idxs.map((i) => bullets[i]));
  }
  if (!projParas.length) errors.push("no valid projects chosen");
  const sLines = (Array.isArray(c.skills) ? c.skills.slice(0, 5) : []).flatMap((s) => {
    const lines = variants[s?.variant] ? skillLinesOf(s.variant) : null;
    if (!lines || !lines[s.index]) { errors.push(`unknown skills line ${JSON.stringify(s)}`); return []; }
    return [lines[s.index]];
  }).map((p, i) => (i === 0 ? { ...p, before: 2 } : p));
  if (sLines.length < 3) errors.push("fewer than 3 skills lines chosen");
  const spec = {
    font: "Calibri", sizePt: blocks.SIZES, marginIn: 0.45,
    paras: [
      ...blocks.NAME_CONTACT,
      ...blocks.education(course),
      { kind: "heading", text: "Experience" },
      ...aleph,
      ...expParas,
      { kind: "heading", text: "Projects" },
      ...projParas,
      { kind: "heading", text: String(c.skillsHeading || "Technical Skills").slice(0, 40) },
      ...sLines,
    ],
  };
  return { spec, errors };
}

// ── cover letter: generated text, but its numbers must come from somewhere real ──
const digits = (s) => (String(s).match(/\d[\d,.]*/g) || []).map((n) => n.replace(/\D/g, "")).filter(Boolean);
export function coverGuard(cover, jd, extra = "") {
  const source = new Set(digits(JSON.stringify(catalog()) + " " + jd + " " + extra + " " + new Date().getFullYear()));
  const bad = [];
  for (const p of [cover?.greeting || "", ...(cover?.paragraphs || [])])
    for (const n of digits(p)) if (!source.has(n)) bad.push(n);
  return [...new Set(bad)];
}

export function composeLetter(cover) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return {
    font: "Calibri", sizePt: { body: 11, name: 18, heading: 12, contact: 10 }, marginIn: 0.9,
    paras: [
      ...blocks.NAME_CONTACT,
      { kind: "gap", pts: 10 },
      { kind: "plain", runs: [{ t: date }] },
      { kind: "plain", runs: [{ t: String(cover.greeting || "Dear Hiring Team,").slice(0, 90) }], before: 10 },
      ...(cover.paragraphs || []).slice(0, 4).map((t) => ({ kind: "plain", runs: [{ t: String(t).slice(0, 1200) }], before: 8 })),
      { kind: "plain", runs: [{ t: "Sincerely," }], before: 12 },
      { kind: "plain", runs: [{ t: "Brian Wonjun Lee", b: true }], before: 2 },
    ],
  };
}

// ── the model call (or MOCK) ────────────────────────────────────────────────
export async function callModel({ jd, company, role }) {
  if (process.env.MOCK) return mockComposition({ jd, company });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("No API key. Create apps/tailor/.env with ANTHROPIC_API_KEY=<the same key the Vercel project uses>.");
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
  const user = buildUser({ jd, company, role, catalogJson: JSON.stringify(catalog()) });
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model, max_tokens: 3500, system: SYSTEM,
        messages: [{ role: "user", content: attempt === 0 ? user : `${user}\n\nYour previous reply failed to parse: ${lastErr}. Reply with ONLY the JSON object.` }],
      }),
    });
    if (!r.ok) throw new Error(`Claude API error ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    try {
      return JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    } catch (e) { lastErr = String(e).slice(0, 200); }
  }
  throw new Error(`The model did not return valid JSON (${lastErr}).`);
}

function mockComposition({ jd = "", company = "Company" }) {
  const l = jd.toLowerCase();
  const base = /design|ux|ui|figma/.test(l) ? "Design" : /game|unity|unreal/.test(l) ? "Game" : /graphic|render|shader|gpu/.test(l) ? "Graphics" : /\bai\b|ml|llm|agent/.test(l) ? "AI" : "SWE";
  const aleph = { Design: "DES", Game: "GAME", Graphics: "ENG", AI: "AI", SWE: "ENG" }[base];
  const projIds = { SWE: ["MINI_MC", "MINI_MAYA", "CAPSULE"], Graphics: ["MINI_MC", "PASSENGER", "MINI_MAYA"], Game: ["MINI_MC", "PASSENGER", "MINI_MAYA"], AI: ["MINI_MC", "MINI_MAYA", "CAREEROS"], Design: ["WIKI", "PATH", "SPARK"] }[base];
  return {
    base, coursework: base === "Design" ? "DES" : "ENG", aleph,
    experience: ["BITMANGO", "PENNSPARK", "MILITARY", "ITFARM"],
    projects: projIds.map((id) => ({ id })),
    skillsHeading: skillsHeadingOf(base),
    skills: skillLinesOf(base).map((_, i) => ({ variant: base, index: i })),
    whyFit: "Mock run — pipeline check without a model call.",
    cover: { greeting: `Dear ${company} team,`, paragraphs: ["Mock paragraph one.", "Mock paragraph two.", "Mock paragraph three."] },
  };
}

// ── rendering: docx (same generator), zip, Word COM → PDF + page counts ─────
const zipDocx = (pkg, docx) =>
  execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${pkg.replace(/\\/g, "/")}', '${docx.replace(/\\/g, "/")}')"`);

function buildOne(dir, name, spec) {
  const pkg = join(dir, `pkg-${name}`);
  const docx = join(dir, `${name}.docx`);
  if (existsSync(pkg)) rmSync(pkg, { recursive: true });
  if (existsSync(docx)) rmSync(docx);
  buildDocx({ ...spec, out: pkg });
  zipDocx(pkg, docx);
  rmSync(pkg, { recursive: true });
  return docx;
}

function exportPdfs(dir) {
  const script = `
$word = New-Object -ComObject Word.Application; $word.Visible = $false
Get-ChildItem '${dir.replace(/\\/g, "/")}' -Filter *.docx | ForEach-Object {
  $doc = $word.Documents.Open($_.FullName, $false, $true)
  $pages = $doc.ComputeStatistics(2)
  $pdf = $_.FullName -replace '\\.docx$', '.pdf'
  $doc.SaveAs([ref]$pdf, [ref]17)
  $doc.Close($false)
  Write-Output ($_.BaseName + '|' + $pages)
}
$word.Quit()`;
  const out = execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '\\"').replace(/\n/g, "; ")}"`).toString();
  const pages = {};
  for (const line of out.split(/\r?\n/)) { const m = line.match(/^(.+)\|(\d+)$/); if (m) pages[m[1]] = +m[2]; }
  return pages;
}

const clean = (s, fallback) => (String(s || "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || fallback);

export async function runTailor({ jd, company, role }) {
  if (!jd || !String(jd).trim()) throw new Error("Paste a job description first.");
  const composition = await callModel({ jd, company, role });
  const { spec, errors } = composeResume(composition);
  const badNumbers = coverGuard(composition.cover, jd, `${company} ${role}`);
  if (badNumbers.length) errors.push(`cover letter contains numbers not found in my content or the job description: ${badNumbers.join(", ")}`);
  if (errors.length) throw new Error("Rejected the model's composition:\n- " + errors.join("\n- "));

  const co = clean(company, "Job");
  const slug = `${new Date().toISOString().slice(0, 10)}-${co}${role ? "-" + clean(role, "") : ""}`.slice(0, 80);
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });
  const resumeName = `Brian_Lee_Resume_${co}`;
  const letterName = `Brian_Lee_Cover_Letter_${co}`;
  buildOne(dir, resumeName, spec);
  buildOne(dir, letterName, composeLetter(composition.cover));

  let pages = {}, warnings = [];
  try { pages = exportPdfs(dir); } catch (e) { warnings.push("PDF export needs Word on this machine — docx files were written. " + String(e).slice(0, 120)); }
  if (pages[resumeName] > 1) warnings.push(`résumé is ${pages[resumeName]} pages — trim before sending (fewer bullets or entries).`);
  if (pages[letterName] > 1) warnings.push(`cover letter runs ${pages[letterName]} pages — shorten it.`);

  return { slug, composition, pages, warnings, files: [resumeName + ".pdf", resumeName + ".docx", letterName + ".pdf", letterName + ".docx"].filter((f) => existsSync(join(dir, f))) };
}

export async function rebuildLetter({ slug, cover, jd = "", company = "", role = "" }) {
  const dir = join(OUT, String(slug).replace(/[^A-Za-z0-9_-]/g, ""));
  if (!existsSync(dir)) throw new Error("Unknown run — tailor first.");
  const badNumbers = coverGuard(cover, jd, `${company} ${role}`);
  const co = clean(company, "Job");
  const letterName = `Brian_Lee_Cover_Letter_${co}`;
  buildOne(dir, letterName, composeLetter(cover));
  let pages = {}, warnings = badNumbers.length ? [`numbers not found in my content or the job description: ${badNumbers.join(", ")} — double-check them.`] : [];
  try { pages = exportPdfs(dir); } catch (e) { warnings.push("PDF export needs Word — docx written."); }
  return { pages, warnings, files: [letterName + ".pdf", letterName + ".docx"].filter((f) => existsSync(join(dir, f))) };
}

// ── selftest ────────────────────────────────────────────────────────────────
if (process.argv.includes("--selftest")) {
  loadEnv();
  process.env.MOCK = "1";
  const jd = "We are looking for a graphics engineering intern: real-time rendering, C++, shaders, GPU pipelines, Unreal.";
  runTailor({ jd, company: "Selftest Studio", role: "Graphics Intern" })
    .then((r) => { console.log("selftest ok:", r.slug, JSON.stringify(r.pages), r.files.join(", ")); if (r.warnings.length) console.log("warnings:", r.warnings.join(" | ")); })
    .catch((e) => { console.error("selftest FAILED:", e.message); process.exit(1); });
}
