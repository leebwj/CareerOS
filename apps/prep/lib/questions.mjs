// Pure parsing/ranking for the open company-question datasets. No I/O here so
// it stays unit-testable; fetching lives in fetch-questions.mjs.

// The dataset splits by recency. "Six Months" answers "what are they asking
// NOW", which matters more than the all-time list.
export const DATASET_WINDOWS = { sixMonths: "3. Six Months.csv", allTime: "5. All.csv" };

// Minimal CSV reader: fields may be quoted and contain commas (Topics always is).
function splitRow(line) {
  const out = [];
  let cur = "", inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseCsv(text) {
  const lines = String(text || "").trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];                     // header-only = no coverage
  return lines.slice(1).map((line) => {
    const [difficulty, title, frequency, acceptance, link, topics] = splitRow(line);
    return {
      difficulty: (difficulty || "").trim(),
      title: (title || "").trim(),
      frequency: Number(frequency) || 0,
      acceptance: Number(acceptance) || 0,
      link: (link || "").trim(),
      topics: (topics || "").split(",").map((t) => t.trim()).filter(Boolean),
    };
  });
}

export function rankQuestions(rows, limit = 25) {
  return [...rows].sort((a, b) => b.frequency - a.frequency).slice(0, limit);
}
