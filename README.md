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
| [`apps/apply-helper`](apps/apply-helper) | **V1 live** | Answer bank — 22 editable application answers + a draft-a-prompt mode; local-first, ATS-question ready |
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

An intentionally motion-forward site, built from scratch:

- **Astro 5 + Tailwind 4**, fully static — no framework runtime on the page
- **Hand-written WebGL shaders** (GLSL) as a full-bleed, cursor-reactive hero with three switchable modes — DPR- and pixel-area-capped so it stays smooth on any screen
- **Custom interaction system** — a morphing snap cursor, cursor-tracked kinetic type, magnetic buttons, a pointer-tilted holo trading card, smooth scroll
- **Performance-minded** — non-blocking fonts, idle-deferred shader compile, hover prefetch, responsive images, reduced-motion support throughout

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
