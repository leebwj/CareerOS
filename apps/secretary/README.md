# secretary — your morning brief

A tiny scheduled agent that reads the CareerOS role feed (and, optionally, your
tracker state) and tells you what matters today: follow-ups due, hot roles to
apply to now, what's new on the board. Built to grow a **desktop-character face**
later (V2) — this is the brain.

## What you get

```
☀️ Morning brief — Friday, July 3

24 hot roles posted — these get swamped within 48h, so apply today.

🔥 Hot — apply now (24)
- ⭐ Apple — Graphics Software Content Engineer · apply →
- ⭐ EA SPORTS — Technical Artist Intern · Fall 2026 · apply →
  ...
🎯 New at target companies
📊 The board — 240 posted in last day · 🆕 4 new
```

## Layout

| file | what | committed? |
|---|---|---|
| `brief.mjs` | composes the brief from the role feed + live tracker state — pure, deterministic, no secrets; also exports `fetchTrackerState(sheetUrl)` | ✅ |
| `send.mjs` | zero-dep Gmail sender (raw SMTP over TLS) | ✅ |
| `run.mjs` | load config → pull follow-ups from the sheet → compose → print + write `out/brief.md` → email if configured | ✅ |
| `config.mjs` | your Gmail creds + optional tracker `sheetUrl` | 🚫 gitignored |
| `config.example.mjs` | the shape of config | ✅ |

## Setup (~5 min, once)

1. **See it work with zero setup** (print-only):
   ```bash
   node run.mjs
   ```
2. **Enable email:** copy `config.example.mjs` → `config.mjs`, then generate a
   Gmail **App Password** (needs 2-Step Verification on):
   https://myaccount.google.com/apppasswords — paste the 16-char password in.
   ```bash
   node run.mjs      # now also emails you
   ```
   ⚠️ The SMTP sender is standard Gmail but **unverified until your first real
   send** — run it once and confirm the email lands.
3. **Schedule it** (Windows Task Scheduler, 8:00am daily):
   - Action: `node`, arguments `run.mjs`, start-in this folder
   - Settings: ✔ *Run whether user is logged on or not* → ✔ *Wake the computer to run* → ✔ *Start when available* (catches a missed run)

## Follow-ups in the brief (V2 — live from your Google Sheet)

Follow-ups due are pulled **live from your tracker's Google Sheet** each morning —
no manual export. Add your sheet's web-app URL (the same `/exec` URL you paste
into the tracker's **⧉ Sheet** button) to `config.mjs`:

```js
sheetUrl: "https://script.google.com/macros/s/AKfyc.../exec",
```

`run.mjs` fetches the tracker state from that endpoint, computes follow-ups due +
applied-this-week, and places the **📮 Follow up today** section at the **bottom**
of the brief (so new openings stay at the top where they're most visible). A
headline nudge points down to it. Leave `sheetUrl` blank to skip follow-ups
(it also still falls back to a local `data/tracker-export.json` if present).

## Later: LLM polish + a desktop character (V2)

- **Prose polish:** pipe `brief.text` through a cheap model (Haiku ~$0.15/mo, or
  free on a Claude subscription via `claude -p --bare`) to reword/prioritize.
  The facts stay computed here so nothing hallucinates.
- **Character face:** fork [OpenPets](https://github.com/alvinunreal/openpets)
  (Electron, MIT — has scheduling + LLM proxy + speech bubbles) and feed it this
  same brief. That's the fun V2 skin.
