// Renders a hand-picked composition through the same pipeline as runTailor,
// with no model call: useful when the composition is chosen by hand (or by an
// editor) rather than requested from the API.
//
//   node compose.mjs <spec.json>
//   spec = { company, role, jd?, composition, cover? }

import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { composeResume, composeLetter, coverGuard, buildOne, exportPdfs, OUT } from "./tailor-core.mjs";

const specPath = process.argv[2];
if (!specPath) {
  console.error("usage: node compose.mjs <spec.json>");
  process.exit(2);
}
const s = JSON.parse(readFileSync(specPath, "utf8"));
const { spec, errors } = composeResume(s.composition);
if (s.cover) {
  const bad = coverGuard(s.cover, s.jd || "", `${s.company} ${s.role}`);
  if (bad.length) errors.push(`cover letter numbers not found in my content or the JD: ${bad.join(", ")}`);
}
if (errors.length) {
  console.error("rejected:\n- " + errors.join("\n- "));
  process.exit(1);
}

const clean = (t, f) => (String(t || "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || f);
const co = clean(s.company, "Job");
const slug = `${new Date().toISOString().slice(0, 10)}-${co}${s.role ? "-" + clean(s.role, "") : ""}`.slice(0, 80);
const dir = join(OUT, slug);
mkdirSync(dir, { recursive: true });
buildOne(dir, `Brian_Lee_Resume_${co}`, spec);
if (s.cover) buildOne(dir, `Brian_Lee_Cover_Letter_${co}`, composeLetter(s.cover));

let pages = {};
try {
  pages = exportPdfs(dir);
} catch (e) {
  console.error("PDF export needs Word on this machine — docx written. " + String(e).slice(0, 120));
}
console.log(JSON.stringify({ dir, pages }));
for (const [n, p] of Object.entries(pages)) if (p > 1) console.error(`over one page: ${n} (${p})`);
