# desktop-pet — the secretary's face

A desktop companion that greets you each morning and delivers your CareerOS
job-hunt brief in a speech bubble. This is the **V2 skin** over the
[secretary](../secretary) brain.

## ✅ Chosen approach — OpenPets + Pikachu + the CareerOS Brief plugin

Runs on **macOS and Windows** (Electron). You get a polished animated pet with
zero art work, plus your daily brief:

1. **Install OpenPets** for your OS from [releases](https://github.com/alvinunreal/openpets/releases/latest) (`.exe` / `.dmg`).
2. **Add the pet:** `npx -y install-pet pikachu`, then select Pikachu in the Pet Gallery.
3. **Add the brief:** install [`openpets-careeros-brief/`](openpets-careeros-brief) as a plugin — it makes the pet speak today's fresh roles / hot listings / internships on a schedule. Full steps in that folder's README.

The brief data is a tiny `brief.json` the role-grabber emits twice daily
(`apps/role-grabber/data/brief.json`); the plugin fetches it and speaks a short
summary (with a friendly offline fallback).

> ⚠️ Pet sprite packs (Pikachu etc.) are third-party IP — they install into
> OpenPets on your machine and are **gitignored**, never committed to this public repo.

## Option B — the from-scratch Electron scaffold (in this folder)

The `index.html` / `main.js` / `preload.js` here are a minimal, own-it-end-to-end
alternative that reads `secretary/out/brief.md` directly. Kept as a reference /
fallback; the OpenPets route above is the one in use.

```bash
cd apps/desktop-pet
npm install     # pulls Electron (~one-time, ~200 MB)
npm start
```

> ⚠️ Transparent/always-on-top/click-through behavior is OS-specific and can't be
> verified headlessly — run once and confirm the character shows with a
> transparent background, stays on top, and clicks pass through the empty area.

### Make the scaffold character yours

- **The character:** in `index.html`, replace the `#pet` block (`.blob` + eyes +
  blush) with your own art — a PNG spritesheet, an `<img>`, a `<canvas>`, a
  Live2D/Lottie widget, whatever. Keep `id="pet"` and `class="interactive"`.
- **Idle animation:** the `bob`/`blink`/`pulse` keyframes are placeholders; swap
  for your sprite's frames.
- **Position/size:** `W`/`H` and the corner offset live in `main.js`.
- **Brief time:** `BRIEF_HOUR` in `main.js`.

## How it connects

```
secretary/run.mjs  →  writes  secretary/out/brief.md
                                     │
desktop-pet/main.js  ── reads ───────┘  → speech bubble
```

Keep the secretary scheduled (Task Scheduler, 8am) so `brief.md` is fresh when
the character reads it. Next step for a real "walking" mascot or richer
animation: the research recommends forking
[OpenPets](https://github.com/alvinunreal/openpets) (MIT, has scheduling + LLM +
bubble plumbing) — this scaffold is the minimal from-scratch version to start
with and own end-to-end.
