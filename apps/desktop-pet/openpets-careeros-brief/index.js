// CareerOS · Morning Digest (careeros.brief) — mini-Jarvis v1.
// Pikachu greets you each morning with your whole day: calendar + weather + the
// job-hunt brief. Personal accounts only (your own Google Calendar link + a
// free no-key weather API). Pure JS on the OpenPets SDK → macOS + Windows alike.

const SCHEDULE_ID = "careeros-digest-daily";
const LAST_KEY = "lastDigestDate";
const BRIEF_URL = "https://raw.githubusercontent.com/leebwj/CareerOS/main/apps/role-grabber/data/brief.json";

// ── small helpers ─────────────────────────────────────────────────────────────
function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function normalizeTime(v, fb = "08:00") {
  return typeof v === "string" && /^\d{2}:\d{2}$/.test(v) ? v : fb;
}
function fmtTime(t) {
  if (!t) return "";
  let [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")}${ap}`;
}
async function getConfig(ctx) {
  return (await ctx.config.get()) ?? {};
}

// ── weather (Open-Meteo — free, no key) ───────────────────────────────────────
const WMO = { 0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "cloudy", 45: "fog", 48: "fog", 51: "light drizzle", 53: "drizzle", 55: "heavy drizzle", 56: "freezing drizzle", 57: "freezing drizzle", 61: "light rain", 63: "rain", 65: "heavy rain", 66: "freezing rain", 67: "freezing rain", 71: "light snow", 73: "snow", 75: "heavy snow", 77: "snow", 80: "rain showers", 81: "rain showers", 82: "heavy showers", 85: "snow showers", 86: "snow showers", 95: "thunderstorms", 96: "thunderstorms", 99: "thunderstorms" };
async function getWeather(ctx, city) {
  if (!city) return null;
  try {
    const g = await ctx.net.fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`, { timeoutMs: 10000 });
    const gd = g.json ?? JSON.parse(g.text || "{}");
    const loc = (gd.results || [])[0];
    if (!loc) return null;
    const w = await ctx.net.fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`, { timeoutMs: 10000 });
    const wd = w.json ?? JSON.parse(w.text || "{}");
    const cur = wd.current || {}, day = wd.daily || {};
    return { temp: Math.round(cur.temperature_2m), desc: WMO[cur.weather_code] ?? "", hi: Math.round((day.temperature_2m_max || [])[0]), lo: Math.round((day.temperature_2m_min || [])[0]) };
  } catch { return null; }
}
function weatherPhrase(w) {
  if (!w || Number.isNaN(w.temp)) return "";
  const e = /rain|drizzle|shower/.test(w.desc) ? "🌧️" : /snow/.test(w.desc) ? "🌨️" : /thunder/.test(w.desc) ? "⛈️" : /cloud|fog/.test(w.desc) ? "☁️" : "☀️";
  return `${e} ${w.temp}°F${w.desc ? ", " + w.desc : ""} (H${w.hi}/L${w.lo})`;
}

// ── calendar (Google Calendar secret iCal → today's events) ───────────────────
// Compact RFC 5545 read: unfold lines, split VEVENTs, resolve which occur TODAY
// (non-recurring + DAILY/WEEKLY/MONTHLY/YEARLY basics, honoring UNTIL + EXDATE).
// It's a friendly digest, not a calendar app — approximations are fine; on any
// parse trouble it just reports fewer events rather than crashing.
const DOW = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
function unfold(ics) { return String(ics).replace(/\r\n/g, "\n").replace(/\n[ \t]/g, ""); }
function parseDT(val) {
  const m = val.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm, ss, z] = m;
  if (hh && z) { // UTC instant → convert to local
    const dt = new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mm, +(ss || 0)));
    return { date: localDateKey(dt), time: `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`, allDay: false, dow: dt.getDay(), d: dt.getDate(), mo: dt.getMonth() + 1 };
  }
  const dt = new Date(+y, +mo - 1, +d);
  return { date: `${y}-${mo}-${d}`, time: hh ? `${hh}:${mm}` : null, allDay: !hh, dow: dt.getDay(), d: +d, mo: +mo };
}
export function eventOccursToday(ev, today, todayDow, todayObj) {
  const s = ev.start;
  if (!s) return false;
  if (ev.exdates && ev.exdates.includes(today)) return false;
  if (!ev.rrule) return s.date === today;
  const rr = ev.rrule;
  if (rr.UNTIL && today.replace(/-/g, "") > rr.UNTIL.slice(0, 8)) return false;
  if (s.date > today) return false;
  switch (rr.FREQ) {
    case "DAILY": return true;
    case "WEEKLY": {
      const days = rr.BYDAY ? rr.BYDAY.split(",").map((x) => DOW[x.slice(-2)]) : [s.dow];
      return days.includes(todayDow);
    }
    case "MONTHLY": return todayObj.getDate() === s.d;
    case "YEARLY": return todayObj.getMonth() + 1 === s.mo && todayObj.getDate() === s.d;
    default: return false;
  }
}
export function parseCalendar(ics, now = new Date()) {
  const today = localDateKey(now), todayDow = now.getDay();
  const events = [];
  const blocks = unfold(ics).split("BEGIN:VEVENT").slice(1);
  for (const raw of blocks) {
    const body = raw.split("END:VEVENT")[0];
    const line = (k) => { const m = body.match(new RegExp("^" + k + "[^:\\n]*:(.*)$", "m")); return m ? m[1].trim() : null; };
    const dtRaw = line("DTSTART");
    if (!dtRaw) continue;
    const start = parseDT(dtRaw);
    if (!start) continue;
    const summary = (line("SUMMARY") || "(busy)").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\n/gi, " ").trim();
    const rrRaw = line("RRULE");
    const rrule = rrRaw ? Object.fromEntries(rrRaw.split(";").map((p) => p.split("="))) : null;
    const exdates = [...body.matchAll(/^EXDATE[^:\n]*:(.*)$/gm)].flatMap((m) => m[1].split(",").map((v) => { const p = parseDT(v.trim()); return p ? p.date : null; }).filter(Boolean));
    if (eventOccursToday({ start, rrule, exdates }, today, todayDow, now)) {
      events.push({ time: start.allDay ? null : start.time, summary, allDay: start.allDay });
    }
  }
  return events.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
}
async function getEvents(ctx, icalUrl) {
  if (!icalUrl) return null;
  try {
    const r = await ctx.net.fetch(icalUrl, { timeoutMs: 12000 });
    if (!r.ok) return null;
    return parseCalendar(r.text || "");
  } catch { return null; }
}

// ── job-hunt brief (the tiny brief.json the grabber emits) ────────────────────
async function getBrief(ctx) {
  try {
    const r = await ctx.net.fetch(BRIEF_URL, { timeoutMs: 10000 });
    if (!r.ok) return null;
    const b = r.json ?? JSON.parse(r.text || "{}");
    const bits = [];
    if (b.newInterns) bits.push(`${b.newInterns} new internship${b.newInterns > 1 ? "s" : ""}`);
    if (b.isNew) bits.push(`${b.isNew} new role${b.isNew > 1 ? "s" : ""}`);
    if (b.hot) bits.push(`${b.hot} 🔥 hot`);
    return bits.length ? bits.join(" · ") : null;
  } catch { return null; }
}

// ── compose the spoken digest ─────────────────────────────────────────────────
export function composeDigest({ events, weather, brief }) {
  const parts = ["☀️ Morning, Brian!"];
  if (events) {
    if (events.length === 0) parts.push("No events today — open runway.");
    else {
      const first = events.find((e) => !e.allDay) || events[0];
      const when = first.allDay ? "" : ` at ${fmtTime(first.time)}`;
      parts.push(`${events.length} event${events.length > 1 ? "s" : ""} today — first: ${first.summary}${when}.`);
    }
  }
  const wp = weatherPhrase(weather);
  if (wp) parts.push(wp + ".");
  if (brief) parts.push(`Job hunt: ${brief}.`);
  parts.push("Let's make it count!");
  return parts.join(" ");
}
async function buildDigest(ctx) {
  const cfg = await getConfig(ctx);
  const [events, weather, brief] = await Promise.all([
    getEvents(ctx, cfg.icalUrl),
    getWeather(ctx, cfg.city),
    getBrief(ctx),
  ]);
  return composeDigest({ events, weather, brief });
}

function digestSpeechSpec(ctx, text) {
  return {
    text,
    indicator: { icon: ctx.assets.icon("brief"), label: "mini-Jarvis", tone: "info", color: "#2563eb", background: "#dbeafe", borderColor: "#93c5fd" },
    tone: "info",
  };
}
async function speakDigest(ctx, { force = false } = {}) {
  const today = localDateKey();
  if (!force && (await ctx.storage.get(LAST_KEY)) === today) return false; // once per day unless forced
  await ctx.storage.set(LAST_KEY, today);
  await ctx.pet.speak(digestSpeechSpec(ctx, await buildDigest(ctx)));
  return true;
}
async function scheduleDigest(ctx) {
  const cfg = await getConfig(ctx);
  await ctx.schedule.cancel(SCHEDULE_ID);
  await ctx.schedule.daily(SCHEDULE_ID, normalizeTime(cfg.digestTime, "08:00"), () => speakDigest(ctx));
}

export function register(OpenPetsPlugin) {
  OpenPetsPlugin.register({
    async start(ctx) {
      await scheduleDigest(ctx);
      const icon = ctx.assets.icon("brief");
      await ctx.commands.register(
        { id: "digest-now", title: "Deliver digest now", description: "Have your pet read today's calendar + weather + job brief.", icon },
        () => speakDigest(ctx, { force: true }),
      );
      const cfg = await getConfig(ctx);
      if (cfg.greetOnLaunch !== false) await speakDigest(ctx); // greet once/day on launch
    },
    async stop() {},
  });
}
