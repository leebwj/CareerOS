# CareerOS · Morning Digest — OpenPets plugin (mini-Jarvis v1)

Your desktop pet (Pikachu) greets you each morning with your **whole day** — today's **calendar**, the **weather**, and your **job-hunt brief** — in one speech bubble. Pure JS on the [OpenPets](https://github.com/alvinunreal/openpets) SDK, so it runs identically on **macOS and Windows**. **Personal accounts only**; your calendar link stays on your machine.

> ☀️ Morning, Brian! 3 events today — first: Aleph standup at 10:00am. ☁️ 71°F, partly cloudy (H78/L62). Job hunt: 3 new internships · 2 🔥 hot. Let's make it count!

## What it does
- Fires at your chosen time (default **08:00**) + once on launch, via the pet's speech bubble.
- **Calendar:** reads today's events from your Google Calendar's private iCal link (`ctx.net`, allow-listed to `calendar.google.com`). Handles recurring events (daily/weekly/monthly/yearly), all-day events, and exclusions.
- **Weather:** free, no-key [Open-Meteo](https://open-meteo.com) for your city.
- **Job brief:** the tiny `brief.json` the role-grabber emits.
- **Never silent / never breaks** — any piece that's offline or unconfigured is simply skipped; you still get a greeting.
- Adds a **"Deliver digest now"** command to trigger it on demand.

## Setup

1. **Install OpenPets** + the Pikachu pet (see the parent [desktop-pet README](../README.md)).
2. **Install this plugin** — it lives in OpenPets' `plugins-dev/careeros.brief/`. On Brian's Windows machine it's already installed + enabled.
3. **Configure it** (OpenPets → Control Center → this plugin → Settings):
   - **Your city** — e.g. `Philadelphia` (blank = skip weather)
   - **Google Calendar secret iCal link** — Google Calendar → ⚙ Settings → *Settings for my calendars* → your calendar → *Integrate calendar* → **"Secret address in iCal format"** → copy (ends in `.ics`). Blank = skip calendar.
   - **Digest time** / **greet on launch**

## Notes
- The iCal link is a **private** read-only calendar URL — it's stored in the plugin's local config on your machine and only ever sent to `calendar.google.com`. Don't share it.
- Personal accounts only — this never touches work/Aleph calendars or data.
- Files: `index.js` (logic + iCal parser + weather + digest), `openpets.plugin.json` (manifest/permissions/config/hosts), `assets/brief.svg`.
