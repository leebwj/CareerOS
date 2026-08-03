// Offline generator: pull company question-frequency data from the open dataset
// and merge it into a dossier. Run by hand when adding/refreshing a company —
// the site itself never calls an API.
//
//   node apps/prep/fetch-questions.mjs palantir "Palantir Technologies"
//   node apps/prep/fetch-questions.mjs google --force   (accept a drop to zero)
//
// Brian's authored content (formatIntel, behavioral, askThem) is NEVER touched:
// what he writes after a real interview is the most valuable thing in the file.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, rankQuestions, DATASET_WINDOWS } from "./lib/questions.mjs";

const BASE = "https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main";
// resolved from this file, not the cwd, so the script works from any directory
const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "portfolio", "src", "data", "prep");

export const NO_DATA_NOTE =
  "No public question data for this company. That is expected for companies that do not run LeetCode-style rounds — work the format intel above instead.";

export function mergeQuestions(existing, questions) {
  const next = JSON.parse(JSON.stringify(existing));      // never mutate the input
  const empty = !questions.sixMonths.length && !questions.allTime.length;
  next.questions = {
    sixMonths: questions.sixMonths,
    allTime: questions.allTime,
    note: empty ? NO_DATA_NOTE : questions.note || "",
  };
  next.updated = new Date().toISOString().slice(0, 10);
  return next;
}

async function fetchWindow(datasetName, file) {
  const url = `${BASE}/${encodeURIComponent(datasetName)}/${encodeURIComponent(file)}`;
  const r = await fetch(url);
  if (!r.ok) return [];                                    // absent company folder = no coverage
  return rankQuestions(parseCsv(await r.text()));
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const [slug, datasetName] = argv.filter((a) => !a.startsWith("--"));
  if (!slug) { console.error('usage: node apps/prep/fetch-questions.mjs <slug> ["Dataset Company Name"] [--force]'); process.exit(1); }
  const file = join(DATA_DIR, `${slug}.json`);
  if (!existsSync(file)) { console.error(`no dossier at ${file} — author it first`); process.exit(1); }
  const existing = JSON.parse(readFileSync(file, "utf8"));
  const name = datasetName || existing.datasetName || "";
  let questions = { sixMonths: [], allTime: [], note: "" };
  if (name) {
    try {
      questions = {
        sixMonths: await fetchWindow(name, DATASET_WINDOWS.sixMonths),
        allTime: await fetchWindow(name, DATASET_WINDOWS.allTime),
        note: "",
      };
    } catch (e) {
      // network failure must never damage a good dossier
      console.error(`fetch failed (${e.message}) — leaving ${slug}.json untouched`);
      process.exit(1);
    }
  }
  // A company that HAD questions and now fetches none means the dataset moved or
  // was renamed, not that the company stopped asking. Writing that through would
  // silently replace real data with the "no coverage" note, and the note would
  // read as a finding. Refuse unless explicitly forced.
  const had = (existing.questions?.sixMonths?.length || 0) + (existing.questions?.allTime?.length || 0);
  const got = questions.sixMonths.length + questions.allTime.length;
  if (had > 0 && got === 0 && !force) {
    console.error(`${slug}: had ${had} questions, fetched 0 — refusing to overwrite. Check the dataset path, or pass --force if the drop is real.`);
    process.exit(1);
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(mergeQuestions(existing, questions), null, 2) + "\n");
  console.log(`${slug}: ${questions.sixMonths.length} six-month, ${questions.allTime.length} all-time`);
}

// standalone only (robust on Windows: compare resolved paths, not file:// strings)
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
