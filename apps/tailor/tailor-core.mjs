// Tailor — compose a job-targeted résumé from the real résumé blocks, write a
// fact-guarded cover letter, and render both through the same pipeline as the
// real résumés (docx-gen → docx → Word COM → PDF, one-page check). The
// composition logic lives in the shared lib so the web page runs the same code.
//
//   node tailor-core.mjs --selftest     (MOCK end-to-end run, no model call)

import { buildDocx } from "../resume/docx-gen.mjs";
import {
  SYSTEM, buildUser,
  catalog as catalogOf, composeResume as composeResumeOf,
  coverGuard as coverGuardOf, composeLetter as composeLetterOf,
} from "../portfolio/public/tailor/lib.js";
import { buildData } from "./data.mjs";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = dirname(fileURLToPath(import.meta.url));
export const OUT = join(ROOT, "out");
const DATA = buildData();

export const catalog = () => catalogOf(DATA);
export const composeResume = (c) => composeResumeOf(DATA, c);
export const coverGuard = (cover, jd, extra = "") => coverGuardOf(DATA, cover, jd, extra);
export const composeLetter = (cover) => composeLetterOf(DATA, cover);

export function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

// ── the model call (or MOCK) ────────────────────────────────────────────────
// direct API call with a local key, or relayed through the deployed
// /api/tailor (which holds the key) using the /apply passphrase
export async function callModel({ jd, company, role, pass }) {
  if (process.env.MOCK) return mockComposition({ jd, company });
  const key = process.env.ANTHROPIC_API_KEY;
  const relayPass = pass || process.env.APPLY_KEY;
  if (!key && !relayPass) throw new Error("Enter the apply passphrase (the APPLY_SECRET from Vercel — same as /apply), or put ANTHROPIC_API_KEY in apps/tailor/.env for direct calls.");
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
  const relay = process.env.TAILOR_RELAY || "https://leebrian.dev/api/tailor";
  const user = buildUser({ jd, company, role, catalogJson: JSON.stringify(catalog()) });

  const send = async (content) => {
    const r = key
      ? await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model, max_tokens: 3500, system: SYSTEM, messages: [{ role: "user", content }] }),
        })
      : await fetch(relay, {
          method: "POST",
          headers: { "content-type": "application/json", "x-apply-key": relayPass },
          body: JSON.stringify({ system: SYSTEM, user: content, maxTokens: 3500 }),
        });
    if (r.status === 401) throw new Error("Wrong passphrase.");
    if (!r.ok) throw new Error(`Claude API error ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const data = await r.json();
    return key
      ? (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim()
      : String(data.text || "").trim();
  };

  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await send(attempt === 0 ? user : `${user}\n\nYour previous reply failed to parse: ${lastErr}. Reply with ONLY the JSON object.`);
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
    skillsHeading: DATA.skills[base].heading,
    skills: DATA.skills[base].lines.map((_, i) => ({ variant: base, index: i })),
    whyFit: "Mock run — pipeline check without a model call.",
    cover: { greeting: `Dear ${company} team,`, paragraphs: ["Mock paragraph one.", "Mock paragraph two.", "Mock paragraph three."] },
  };
}

// ── rendering: docx (same generator), zip, Word COM → PDF + page counts ─────
const zipDocx = (pkg, docx) =>
  execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${pkg.replace(/\\/g, "/")}', '${docx.replace(/\\/g, "/")}')"`);

export function buildOne(dir, name, spec) {
  const pkg = join(dir, `pkg-${name}`);
  const docx = join(dir, `${name}.docx`);
  if (existsSync(pkg)) rmSync(pkg, { recursive: true });
  if (existsSync(docx)) rmSync(docx);
  buildDocx({ ...spec, out: pkg });
  zipDocx(pkg, docx);
  rmSync(pkg, { recursive: true });
  return docx;
}

export function exportPdfs(dir) {
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

export async function runTailor({ jd, company, role, pass }) {
  if (!jd || !String(jd).trim()) throw new Error("Paste a job description first.");
  const composition = await callModel({ jd, company, role, pass });
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
