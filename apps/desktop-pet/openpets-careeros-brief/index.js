// CareerOS Brief (careeros.brief) — an OpenPets plugin.
// Your pet (Pikachu or any other) greets you each morning and speaks today's
// job-hunt brief, pulled from your public CareerOS feed. Pure JS on the OpenPets
// SDK, so it runs identically on macOS and Windows — only the pet art differs.

const SCHEDULE_ID = "careeros-brief-daily";
const LAST_KEY = "lastBriefDate";
// tiny summary the grabber emits twice daily (not the ~2MB full feed)
const BRIEF_URL = "https://raw.githubusercontent.com/leebwj/CareerOS/main/apps/role-grabber/data/brief.json";

function localDateKey(ms = Date.now()) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function normalizeTime(value, fallback = "08:00") {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value) ? value : fallback;
}
async function getConfig(ctx) {
  return (await ctx.config.get()) ?? {};
}

// Compose a short spoken brief from brief.json. Always returns a friendly nudge
// even if the network is down or the feed is empty — the pet never stays silent.
export async function buildBriefText(ctx) {
  try {
    const res = await ctx.net.fetch(BRIEF_URL, { timeoutMs: 12_000 });
    if (!res.ok) throw new Error(`brief-${res.status}`);
    const b = res.json ?? JSON.parse(res.text || "{}");
    const bits = [];
    if (b.newInterns) bits.push(`${b.newInterns} new internship${b.newInterns > 1 ? "s" : ""}`);
    if (b.isNew) bits.push(`${b.isNew} new role${b.isNew > 1 ? "s" : ""}`);
    if (b.hot) bits.push(`${b.hot} 🔥 hot`);
    if (b.fresh && !b.isNew) bits.push(`${b.fresh} fresh`);
    const summary = bits.length ? bits.join(" · ") : "no brand-new roles today";
    return `☀️ Morning, Brian! Today: ${summary}. Open your tracker and fire off a few applications — you've got this!`;
  } catch {
    return "☀️ Morning, Brian! Time to check today's roles and send a few applications. Open your tracker — small steps daily win this.";
  }
}

function briefSpeechSpec(ctx, text) {
  return {
    text,
    indicator: {
      icon: ctx.assets.icon("brief"),
      label: "CareerOS",
      tone: "info",
      color: "#2563eb",
      background: "#dbeafe",
      borderColor: "#93c5fd",
    },
    tone: "info",
  };
}

async function speakBrief(ctx, { force = false } = {}) {
  const today = localDateKey();
  if (!force && (await ctx.storage.get(LAST_KEY)) === today) return false; // once per day unless forced
  await ctx.storage.set(LAST_KEY, today);
  await ctx.pet.speak(briefSpeechSpec(ctx, await buildBriefText(ctx)));
  return true;
}

async function scheduleBrief(ctx) {
  const cfg = await getConfig(ctx);
  await ctx.schedule.cancel(SCHEDULE_ID);
  await ctx.schedule.daily(SCHEDULE_ID, normalizeTime(cfg.briefTime, "08:00"), () => speakBrief(ctx));
}

export function register(OpenPetsPlugin) {
  OpenPetsPlugin.register({
    async start(ctx) {
      await scheduleBrief(ctx);
      const icon = ctx.assets.icon("brief");
      // manual trigger from the Control Center / command palette
      await ctx.commands.register(
        { id: "brief-now", title: "Deliver brief now", description: "Have your pet read today's job-hunt brief.", icon },
        () => speakBrief(ctx, { force: true }),
      );
      const cfg = await getConfig(ctx);
      if (cfg.greetOnLaunch !== false) await speakBrief(ctx); // greet once/day on launch
    },
    async stop() {},
  });
}
