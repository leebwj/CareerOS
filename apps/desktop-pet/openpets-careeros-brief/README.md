# CareerOS Brief — OpenPets plugin

Makes your desktop pet (Pikachu or any other) **greet you each morning and speak today's job-hunt brief** — new internships, fresh roles, hot listings — pulled live from your CareerOS feed. Pure JS on the [OpenPets](https://github.com/alvinunreal/openpets) SDK, so it runs identically on **macOS and Windows** (only the pet art differs).

## What it does
- At your chosen time (default **08:00**) — and once on launch — the pet pops a speech bubble like:
  > ☀️ Morning, Brian! Today: 3 new internships · 5 new roles · 2 🔥 hot. Open your tracker and fire off a few applications — you've got this!
- Fetches a tiny `brief.json` summary the role-grabber emits twice daily (not the ~2 MB feed).
- **Never stays silent** — if you're offline it still greets you with a plain nudge.
- Adds a **"Deliver brief now"** command (Control Center / command palette) to trigger it on demand.

## Setup (macOS + Windows)

**1. Install OpenPets** (cross-platform Electron app) — download the installer for your OS from [OpenPets releases](https://github.com/alvinunreal/openpets/releases/latest): `…win-x64-setup.exe` (Windows) or the `.dmg` (macOS).

**2. Add the Pikachu pet:**
```bash
npx -y install-pet pikachu
```
Then pick **Pikachu** in OpenPets → Control Center → Pet Gallery. *(If you have `pikachu.zip`, you can also import it there instead.)*

**3. Install this plugin** — copy this whole `openpets-careeros-brief/` folder into OpenPets' **user plugins** directory, then enable **"CareerOS Brief"** in the Control Center → Plugins. (Find the exact plugins path via the Control Center; on most setups it's under the OpenPets app-data folder.) Optionally validate first:
```bash
npx @open-pets/cli plugin validate ./openpets-careeros-brief
```

**4. Configure** (Control Center → this plugin):
- **Morning brief time** — when the pet delivers the brief (default `08:00`)
- **Greet on launch** — also deliver it when OpenPets starts (default on)

## Notes
- **Live counts** appear once the grabber has committed `apps/role-grabber/data/brief.json` (next scheduled run). Until then, the pet shows the friendly fallback nudge.
- The feed host `raw.githubusercontent.com` is allow-listed in `openpets.plugin.json` (`network.hosts`) — the plugin can only reach that one host.
- Files: `index.js` (logic), `openpets.plugin.json` (manifest/permissions/config), `assets/brief.svg` (bubble icon).
