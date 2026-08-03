# prep — interview dossiers

One page per company telling you what rounds are coming, what each is actually
scoring, what's most likely to be asked, and which of your own stories to tell.

Live at `/prep` and `/prep/<slug>` — **noindex'd**, like `/tracker`. It's personal
working material on a public site.

## Why a dossier per company

Formats differ enough that generic prep is worse than none. Palantir's loop has
no LeetCode round at all — it tests undefined scope, unfamiliar code and
unfamiliar APIs. Google's is a conventional DS&A loop where the variance is in
how you communicate. A single "interview prep" page would be wrong for both.

## Layout

| file | what | committed? |
|---|---|---|
| `lib/questions.mjs` | pure CSV parse + rank. No I/O, so it unit-tests without a network | ✅ |
| `fetch-questions.mjs` | fetch a company's question data, merge it into the dossier | ✅ |
| `test/*.test.mjs` | unit tests for both | ✅ |
| `../portfolio/src/data/prep/<slug>.json` | the dossiers themselves | ✅ |
| `../portfolio/src/data/prep/index.ts` | discovery + typing — drop a JSON in, get a route | ✅ |
| `../portfolio/src/pages/prep/` | the pages | ✅ |

## Adding a company

1. **Author the dossier.** Copy an existing `<slug>.json`. The part that carries
   its weight is `formatIntel.rounds[].scoring` — what the round is *really*
   judged on, which is the thing a question list can't tell you. Research it;
   don't derive it.
2. **Pull question data**, if the dataset covers them:
   ```bash
   node apps/prep/fetch-questions.mjs <slug> "<Dataset Company Name>"
   ```
   The dataset name is the folder in [liquidslr/leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems)
   — often not the display name ("Palantir Technologies", not "Palantir").
   Coverage is uneven: Google and Amazon are rich; Palantir, NVIDIA, Anthropic
   and Anduril have none. Zero coverage is fine and renders an explicit note —
   a gap must never look like a finding.
3. **Add the slug to `PREP`** in `apps/tracker/index.html` so tracked rows at
   interview stages link to it, then copy the file to
   `apps/portfolio/public/tracker/index.html` (the two must stay identical).
   Include every spelling the feed uses — it carries both "Palantir" and
   "Palantir Technologies".

## Two things the generator will not do

- **Overwrite your writing.** `formatIntel`, `behavioral` and `askThem` are
  copied through untouched. What you write after a real interview is the most
  valuable content in the file.
- **Silently drop questions.** A dossier that had questions and now fetches none
  means the dataset moved, not that the company stopped asking — that's refused
  rather than written. Pass `--force` if the drop is real.

## Tests

```bash
node --test "apps/prep/test/*.test.mjs"
```

Quote the glob, and don't pass the bare directory — Node 22 resolves
`apps/prep/test` as a module and fails.
