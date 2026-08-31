# tailor — job-targeted résumé + cover letter

Paste a job description, get back a one-page résumé and a cover letter aligned to that
job, as ATS-clean `.docx` + `.pdf` through the same pipeline as [`apps/resume`](../resume).

The résumé is composed, not written: the model chooses among the real résumé's building
blocks (internship angle, experience entries, project blocks and their bullets, skills
lines) and the tool assembles them verbatim — so it cannot invent a claim. The cover
letter is generated, then every number in it is checked against the résumé content and
the job description; anything unaccounted for fails the run.

## Run

```bash
cd apps/tailor
node server.mjs        # → http://localhost:5177
```

or double-click `start.cmd`, which starts the server and opens the page.

Needs `../resume/resume-data.mjs` (private, gitignored) and Word on Windows for the PDF
export and page check (docx still builds without it). No API key needed on the machine:
the page asks once for the apply passphrase (the same one `/apply` uses) and the model
call is relayed through `leebrian.dev/api/tailor`, where the key lives. A local `.env`
with `ANTHROPIC_API_KEY=sk-ant-…` switches to direct API calls (`ANTHROPIC_MODEL`
optional).

`MOCK=1 node server.mjs` runs the whole pipeline with a canned composition (no API
calls); `node tailor-core.mjs --selftest` does the same end-to-end from the terminal.

Output lands in `out/<date>-<company>/` — that folder is the application history.
