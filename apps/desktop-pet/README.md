# desktop-pet — the secretary's face

A desktop companion that lives in the corner of your screen and delivers your
CareerOS morning brief in a speech bubble. This is the **V2 skin** over the
[secretary](../secretary) brain — the brain composes the brief, the character
delivers it.

## What it is

- A transparent, frameless, always-on-top window in the bottom-right corner
- **Click-through everywhere except the character + bubble** — it won't block
  your desktop
- Pops the brief on launch and every morning at 8am; click the character to
  toggle it anytime
- A placeholder character (a friendly cobalt blob) that's **yours to replace**

## Run it

```bash
cd apps/desktop-pet
npm install     # pulls Electron (~one-time, ~200 MB)
npm start
```

> ⚠️ **Untested on a real display by the author** — transparent/always-on-top/
> click-through behavior is OS-specific and can't be verified headlessly. Run it
> once and confirm: (1) the character shows with a transparent background (no
> white box), (2) it stays on top, (3) clicks pass through the empty area to
> your desktop but land on the character. If any of those misbehave on your
> Windows build, tell me the symptom and I'll tune the window flags.

## Make it yours (the fun part)

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
