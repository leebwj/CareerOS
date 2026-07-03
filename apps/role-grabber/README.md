# role-grabber (lite)

CareerOS module #2 — an automated open-role sheet. A daily GitHub Action pulls
open US tech + design roles from curated public sources, normalizes and
dedupes them, and publishes:

- **[`ROLES.md`](ROLES.md)** — the human sheet: recent roles (last 30 days),
  grouped by category, newest first
- **[`data/roles.csv`](data/roles.csv)** / **[`data/roles.json`](data/roles.json)** —
  every active role, for spreadsheets or downstream tooling

## Scope

Broad by design: Software Engineering · Data/AI/ML · Design/UX · Product ·
Quant · Hardware · **Graphics/Game/3D** (title-detected across all sources).
Internships and new-grad roles, US locations.

## Sources

| Source | What it provides |
|---|---|
| [SimplifyJobs/Summer2026-Internships](https://github.com/SimplifyJobs/Summer2026-Internships) | internships (structured JSON) |
| [SimplifyJobs/New-Grad-Positions](https://github.com/SimplifyJobs/New-Grad-Positions) | full-time new-grad (structured JSON) |
| [jobright-ai/2026-Design-Internship](https://github.com/jobright-ai/2026-Design-Internship) | design/UX internships |

A failed source never kills a run — it's noted at the bottom of the sheet.

## Run locally

```bash
node apps/role-grabber/grab.mjs
```

Zero dependencies (Node 20+).

## Next (the full agent)

This lite sheet is step one. The planned agent adds: API-first sourcing from
company job boards (Greenhouse/Lever/Ashby), fit-ranking against my résumé
with "why it fits" notes, off-the-radar role discovery, closed-role detection,
and an Inbox → Tracker workflow.
