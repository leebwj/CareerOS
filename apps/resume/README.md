# resume — résumé-as-code

Both résumé variants (Engineer / Design) live as data and render to pixel-consistent,
ATS-clean `.docx` + `.pdf` on demand. No hand-formatting in Word, ever.

## Why

- **One source of truth** — content edits are diffs, not document archaeology
- **Format locked to the researched Big-Tech spec**: one column, one page, 0.5" margins,
  Calibri, small-caps ruled section headers, title-bold/date-right entries, real
  right-tab stops (never space-padding), `June 2025 – Aug 2025` dates, no bullet periods
- **One-page rule enforced by machine** — the build fails loudly if content overflows

## Layout

| file | what | committed? |
|---|---|---|
| `docx-gen.mjs` | minimal OOXML generator (right tabs, bullets, hyperlinks, small caps) | ✅ public |
| `build.mjs` | renders all variants → `out/`; `--pdf` adds Word-COM PDF export + page check | ✅ public |
| `resume-data.mjs` | the actual content (contact, entries, bullets) | 🚫 gitignored (personal) |
| `resume-data.example.mjs` | shape of the data file, anonymized | ✅ public |
| `out/` | generated docx/pdf | 🚫 gitignored |

## Usage

```bash
node build.mjs        # docx only
node build.mjs --pdf  # + PDF export + one-page verification (Windows + Word)
```

Content rules (from the deep-research pass, see repo history):
2–4 bullets per entry · 1–2 lines each · strong past-tense verb first · real numbers
with defensible denominators · no helped/utilized/spearheaded · tech named inline ·
every claim interview-defensible.
