import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv, rankQuestions, DATASET_WINDOWS } from "../lib/questions.mjs";

const SAMPLE = `Difficulty,Title,Frequency,Acceptance Rate,Link,Topics
EASY,Two Sum,100.0,0.0057,https://leetcode.com/problems/two-sum,"Array, Hash Table"
HARD,Trapping Rain Water,73.9,0.0067,https://leetcode.com/problems/trapping-rain-water,"Array, Two Pointers"
MEDIUM,Add Two Numbers,77.7,0.0048,https://leetcode.com/problems/add-two-numbers,"Linked List, Math"`;

test("parseCsv reads rows, numbers and quoted topic lists", () => {
  const rows = parseCsv(SAMPLE);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].title, "Two Sum");
  assert.equal(rows[0].difficulty, "EASY");
  assert.equal(rows[0].frequency, 100);
  assert.deepEqual(rows[0].topics, ["Array", "Hash Table"]);
  assert.equal(rows[1].link, "https://leetcode.com/problems/trapping-rain-water");
});

test("parseCsv returns [] for a header-only file (the empty-coverage case)", () => {
  assert.deepEqual(parseCsv("Difficulty,Title,Frequency,Acceptance Rate,Link"), []);
  assert.deepEqual(parseCsv(""), []);
});

test("rankQuestions sorts by frequency desc and caps", () => {
  const ranked = rankQuestions(parseCsv(SAMPLE), 2);
  assert.equal(ranked.length, 2);
  assert.deepEqual(ranked.map((r) => r.title), ["Two Sum", "Add Two Numbers"]);
});

test("DATASET_WINDOWS names the exact dataset files", () => {
  assert.equal(DATASET_WINDOWS.sixMonths, "3. Six Months.csv");
  assert.equal(DATASET_WINDOWS.allTime, "5. All.csv");
});
