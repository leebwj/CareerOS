# tailor — job-targeted résumé + cover letter

Paste a job description, get back a one-page résumé and a cover letter aligned to that
job. The résumé is composed, not written: the model chooses among the real résumé's
building blocks (internship angle, experience entries, project blocks and their bullets,
skills lines) and the tool assembles them verbatim — so it cannot invent a claim. The
cover letter is generated, then every number in it is checked against the résumé content
and the job description; anything unaccounted for fails the run.

## Web

Live at [leebrian.dev/tailor](https://leebrian.dev/tailor), gated by the apply
passphrase (asked once per browser, same as `/apply`). The page pulls the résumé data
from `/api/tailor-data`, relays the model call through `/api/tailor` (the API key stays
in Vercel), composes with [`lib.js`](../portfolio/public/tailor/lib.js) and builds the
docx files in the browser ([`docx.js`](../portfolio/public/tailor/docx.js), store-only
zip); PDF comes from the print view. The data itself lives in the `TAILOR_DATA` env
var, never in this repo — refresh it after editing `resume-data.mjs`:

```bash
node push-data.mjs     # prints the vercel env commands
```

## Local

```bash
cd apps/tailor
node server.mjs        # → http://localhost:5177
```

or double-click `start.cmd`. Same passphrase flow; a `.env` with
`ANTHROPIC_API_KEY=sk-ant-…` switches to direct API calls (`ANTHROPIC_MODEL`
optional). Local runs go through Word COM, which adds the exact page count and
Word-rendered PDFs; output lands in `out/<date>-<company>/` — that folder is the
application history.

Needs `../resume/resume-data.mjs` (private, gitignored) and Word on Windows for the
PDF export. `MOCK=1 node server.mjs` runs the pipeline with a canned composition;
`node tailor-core.mjs --selftest` does the same end-to-end from the terminal.
