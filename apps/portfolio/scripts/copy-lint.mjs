// Copy + markup lint for the 2026 tree of the built site.
//
// Fails when the polished pages contain boilerplate vocabulary, em-dash chains,
// or markup that belongs only to the classic design (a sign the trees got
// tangled). The classic tree under dist/classic/ is deliberately not linted —
// it is frozen as-is.
//
//   npm run build && node scripts/copy-lint.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "dist";
// frozen / out-of-scope trees: the classic design, the private tools, the art board, 404
const SKIP = /^dist\/(classic|prep|tracker|apply|art)(\/|$)/;
const norm = (p) => p.replace(/\\/g, "/");
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP.test(norm(p))) walk(p); }
    else if (name === "index.html") files.push(p);
  }
};
walk(ROOT);
const lintable = files.filter((f) => !SKIP.test(norm(f)));

// the original headline and section headings ("Things I've built.",
// "Let's work together.") stay, so their words are not on the list
const BANNED_WORDS = /\b(seamless|seamlessly|elevate|elevating|crafting|journey|empower|empowering|unlock|supercharge|revolutionary|cutting-edge)\b/i;
const BANNED_PHRASES = [/passionate (about|developer)/i, /crafting digital experiences/i];
// markup that should never reach the polished pages: the old blueprint covers
// and grain textures (the B&W wash and the numbered kickers stay)
const STALE_MARKUP = [/proj-cover"/, /feTurbulence/];

const stripTags = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, " ");

let failures = 0;
const fail = (file, why, snippet) => { failures++; console.log(`✗ ${file}\n    ${why}\n    …${snippet.slice(0, 160)}…`); };

for (const file of lintable) {
  const html = readFileSync(file, "utf8");
  // the case-study bodies are the project data, which Brian chose to keep as
  // written; lint only the page chrome + landing pages for vocabulary
  const isCaseStudy = /^dist\/work\//.test(norm(file));
  const text = stripTags(html);
  if (!isCaseStudy) {
    const w = text.match(BANNED_WORDS);
    if (w) fail(file, `banned word "${w[0]}"`, text.slice(Math.max(0, w.index - 60)));
    for (const re of BANNED_PHRASES) { const m = text.match(re); if (m) fail(file, `banned phrase "${m[0]}"`, text.slice(Math.max(0, m.index - 60))); }
    // three or more em dashes in one ~600-char window = the reflex, not an aside
    for (let i = 0; i < text.length; i += 300) { const win = text.slice(i, i + 600); const n = (win.match(/—/g) || []).length; if (n >= 3) { fail(file, `${n} em dashes in one passage`, win); break; } }
  }
  for (const re of STALE_MARKUP) { const m = html.match(re); if (m) fail(file, `stale markup "${m[0]}"`, html.slice(Math.max(0, m.index - 40), m.index + 120)); }
}

console.log(`${lintable.length} pages linted, ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
