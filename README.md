# CareerOS

My personal career platform, built as a monorepo. Each module is a tool I actually use — a portfolio, an automated job finder, an application tracker, a résumé generator, and a morning-brief agent.

**Live → [leebrian.dev](https://leebrian.dev)**

## Modules

| Module | Status | What it is |
|---|---|---|
| [`apps/portfolio`](apps/portfolio) | **Live** | My portfolio — case studies across graphics, engineering, and design |
| [`apps/role-grabber`](apps/role-grabber) | **Live** | Twice-daily role aggregation from ~110 company boards + curated feeds → [ROLES.md](apps/role-grabber/ROLES.md); deterministic fit tiers, 🔥 hot / 🆕 new / 🎯 target, term + level |
| [`apps/tracker`](apps/tracker) | **Live** | Application dashboard over the daily data — filter, fit-rank, track stages + follow-ups, **two-way Google Sheet sync (durable + cross-device)** |
| [`apps/resume`](apps/resume) | **V1 live** | Résumé-as-code — both variants render to ATS-clean docx/PDF from one data file (content stays private) |
| [`apps/apply-helper`](apps/apply-helper) | **V2 live** | Answer bank (22 editable answers) + **in-app AI drafter** — type any question, get a tailored answer via the Claude API (serverless, passphrase-gated), edit, and save to your bank |
| [`apps/secretary`](apps/secretary) | **V1** | Morning-brief agent — composes what-to-do-today from the feed and emails it daily (Task Scheduler @ 8am) |
| [`apps/desktop-pet`](apps/desktop-pet) | **V1 scaffold** | The secretary's face — a transparent desktop character that pops the brief in a speech bubble (bring your own art) |

## The job-hunt system

The core loop: **grabber finds roles → tracker manages them → apply-helper speeds applications → secretary reminds you daily.**

**Role-grabber** (zero-dependency Node, runs on a GitHub Action twice a day):
- Sources **~110 company ATS boards directly** — Greenhouse, Ashby, Lever, SmartRecruiters, Workday, Workable, Recruitee — plus curated aggregator feeds. ~5,000+ live US roles.
- Covers big tech, design-forward companies, **game studios** (Riot, Epic, Nintendo, Rockstar, Naughty Dog, Scopely…), **VFX/animation** (Pixar, DreamWorks, Sony Imageworks…), and a large **AI-lab** set.
- **Deterministic fit scoring** (title-tier + skills + recency + target + level) → ⭐ strong / ◐ good tiers, no black-box LLM ranking.
- **Relevance-gated inbox** — filters out unrelated roles (sales/recruiting/finance) while protecting every real tech/design/creative role; categorizes into Graphics·Game, Art·Animation·VFX, Design·UX, SWE, Data·AI·ML, and more.

**Tracker** (single self-contained HTML, no backend):
- Views: Inbox / Starred / Tracker / Hidden · filters for search, category, level, **term** (Summer 2027…), **sort** (newest / best fit / follow-up due), and ⭐ strong-fit / 🔥 hot / 🆕 new / 🎯 target.
- Fit tier on every row · funnel stats (applied / in-progress / offers / this week) · one-click **apply → stage tracking → follow-up reminders → notes**.
- **Two-way Google Sheet sync** — your data lives in your own Google Sheet, syncs on every change, and loads on any computer (last-write-wins, never wipes). Plus local auto-backup and CSV export.

## The portfolio

Built from scratch on **Astro 5 + Tailwind 4**, fully static. Two designs ship side by side behind a small switch in the corner:

- **Polished (default, `/`)** — the original design with a few things changed. Three intro styles sit behind a switch in the hero (the name in the logo face over the field, a film-credit caption, a spec sheet with the shader's real frame time and GPU). The audience switch (`/`, `/graphics`, `/engineering`, `/design`) reorders the work in place and updates the URL, so one link can be pasted into a studio application and another into a design one; the résumé link follows. Hovering a company on the holo card swaps the About text for that job's brief without moving the page; clicking opens the full page. Tags are squared outlined labels instead of pills; the grain is gone. Card thumbnails morph into case-study heroes through cross-document View Transitions (no router; unsupported browsers just load the page).
- **Original (`/classic/`)** — the earlier version, kept whole for comparison: statement-wall hero, duotone thumbnails, Mona Sans.
- Shared: the shaders (`ShaderField`, `CardShader`) use a fract-free permutation lattice hash so they render correctly on Intel MacBooks, where Metal's fast-math `fract()` used to tear the noise into triangles. `scripts/noise-robustness.mjs` proves the seam; `scripts/shader-smoke.mjs` compiles every mode in headless Chrome; `scripts/shot.mjs` screenshots any page; `scripts/copy-lint.mjs` keeps boilerplate out of the polished pages; `scripts/behaviour-check.mjs` exercises the audience switch, the row-filling grid and the About hover in headless Chrome.

### Run it

```bash
cd apps/portfolio
npm install
npm run dev      # → http://localhost:4321
npm run build    # static output in dist/
```

Deployed on Vercel; every push to `main` ships automatically.

---

**Brian Wonjun Lee** — designer & engineer, CS + Design @ UPenn
[leebrian.dev](https://leebrian.dev) · [GitHub](https://github.com/leebwj) · [LinkedIn](https://www.linkedin.com/in/brian-lee-0b706b225/)
