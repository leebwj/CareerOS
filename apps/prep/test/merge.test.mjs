import test from "node:test";
import assert from "node:assert/strict";
import { mergeQuestions } from "../fetch-questions.mjs";

const existing = {
  slug: "palantir",
  company: "Palantir",
  formatIntel: { summary: "authored", rounds: [{ name: "Decomposition" }] },
  behavioral: { values: ["mission"], stories: [{ story: "Aleph retention" }] },
  questions: { sixMonths: [], allTime: [], note: "old note" },
  askThem: ["What does success look like?"],
};

test("merge replaces questions only — authored fields survive", () => {
  const out = mergeQuestions(existing, { sixMonths: [{ title: "Two Sum" }], allTime: [], note: "" });
  assert.equal(out.questions.sixMonths[0].title, "Two Sum");
  assert.equal(out.formatIntel.summary, "authored");
  assert.deepEqual(out.behavioral.stories, [{ story: "Aleph retention" }]);
  assert.deepEqual(out.askThem, ["What does success look like?"]);
});

test("merge never mutates the input dossier", () => {
  const before = JSON.stringify(existing);
  mergeQuestions(existing, { sixMonths: [], allTime: [], note: "x" });
  assert.equal(JSON.stringify(existing), before);
});

test("empty coverage produces an honest note, not an empty table", () => {
  const out = mergeQuestions(existing, { sixMonths: [], allTime: [], note: "" });
  assert.match(out.questions.note, /no public question data/i);
});
