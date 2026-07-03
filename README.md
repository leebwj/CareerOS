# CareerOS

My personal career platform, built as a monorepo. Each module is a tool I actually use — starting with my portfolio.

**Live → [leebrian.dev](https://leebrian.dev)**

## Modules

| Module | Status | What it is |
|---|---|---|
| [`apps/portfolio`](apps/portfolio) | **Live** | My portfolio — case studies across graphics, engineering, and design |
| [`apps/role-grabber`](apps/role-grabber) | **Live** | Twice-daily role aggregation (aggregators + direct ATS boards) → [ROLES.md](apps/role-grabber/ROLES.md); fit tiers, 🔥 hot / 🆕 new / 🎯 target, term + level |
| [`apps/tracker`](apps/tracker) | **V1 live** | Single-file application dashboard over the daily data — Inbox / Starred / Tracker, Hot filter, follow-up reminders, local-first |
| [`apps/resume`](apps/resume) | **V1 live** | Résumé-as-code — both variants render to ATS-clean docx/PDF from one data file (content stays private) |
| [`apps/apply-helper`](apps/apply-helper) | **V1 live** | Answer bank — 22 editable application answers + a draft-a-prompt mode; local-first, ATS-question ready |
| [`apps/secretary`](apps/secretary) | **V1 brain** | Morning-brief agent — composes what-to-do-today from the feed, emails it (Task Scheduler @ 8am) |
| [`apps/desktop-pet`](apps/desktop-pet) | **V1 scaffold** | The secretary's face — a transparent desktop character that pops the brief in a speech bubble (bring your own art) |

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
