# Art originals — full-resolution masters

The **only** full-resolution copies of Brian's artwork. `brianleeportfolio.cargo.site`
was cancelled on 2026-07-29; these were pulled while it was still answering.

**Why this exists:** the site copies under `apps/portfolio/public/art/` were
downloaded through Cargo's `w/1600` resize. 64 of the 84 images had larger
originals (e.g. `ceiling-light/04` is 3508×2480 here vs 1600×1131 on the site).
Once Cargo went dark those masters would have been unrecoverable.

**Not deployed.** This folder sits at the repo root, outside
`apps/portfolio/public/`, so Vercel never serves it. The site continues to serve
the 1600px copies, which is the right size for the web.

**Provenance:** original URL form was `https://freight.cargo.site/i/<hash>/<name>`
(no `/w/<width>/` segment). Folder names match the art slugs in
`apps/portfolio/src/data/art.json`; filenames keep Cargo's original names.

84 files · ~111 MB · 15 projects.
