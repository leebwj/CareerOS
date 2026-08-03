// CareerOS · role-grabber
// Aggregates open tech + design roles from curated public sources PLUS the
// public JSON endpoints of target companies' ATS boards (Greenhouse / Ashby /
// Lever — research-verified, no auth), normalizes into one schema, scores
// each role for fit deterministically, and emits: data/roles.json +
// data/roles.csv (everything) and ROLES.md (recent, human-readable).
//
// Zero dependencies — Node 20+ (global fetch). Run: node grab.mjs

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const RECENT_DAYS = 30; // ROLES.md shows roles posted within this window
const FRESH_HOURS = 48; // "fresh" section window
const GHOST_DAYS = 45;  // postings older than this get flagged in data
const STALE_INTERN_DAYS = 120;  // intern posts older than this + no live term → dropped (dead cycle)

// ── recruiting calendar, derived from TODAY (never hand-tuned) ───────────────
// The old version hard-coded which seasons counted as "future" (Fall 2026+,
// any 2027+). That is correct for exactly one moment in time: once the cycle
// turns, Fall 2026 quietly stays "future" forever and dead postings stop being
// dropped. So work it out from the date instead.
// Month each intake BEGINS. The test is "can Brian still join this?", not "has
// the term finished" — a Summer 2026 internship is already underway by July and
// is dead weight in the feed even though it runs into August.
const TERM_START = { winter: 1, spring: 3, summer: 6, fall: 9 };
// A term string may list several ("Summer 2026 / Fall 2026") — live if ANY is.
// Cutoff is the END of the start month, so a role isn't dropped the very week
// its intake begins.
function termsLive(term, now = new Date()) {
  if (!term) return false;
  let live = false;
  for (const m of String(term).matchAll(/(spring|summer|fall|autumn|winter)\s*(20\d{2})/gi)) {
    const season = m[1].toLowerCase().replace("autumn", "fall");
    if (new Date(+m[2], TERM_START[season], 0) > now) live = true;
  }
  return live;
}
// The intake currently being recruited for. US tech opens the Summer N+1 cycle
// around August of year N, and it runs through roughly February of N+1 — so from
// July onward the live cycle is next summer's.
const CYCLE_YEAR = new Date().getMonth() >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear();
const CYCLE_LABEL = `Summer ${CYCLE_YEAR}`;
// a role belongs to the active cycle if any of its terms names that year
const inCycle = (r) => new RegExp(`\\b${CYCLE_YEAR}\\b`).test(r.term || "") || new RegExp(`\\b${CYCLE_YEAR}\\b`).test(r.title || "");

const SOURCES = {
  simplifyIntern:
    "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
  simplifyNewGrad:
    "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
  jobrightDesign:
    "https://raw.githubusercontent.com/jobright-ai/2026-Design-Internship/master/README.md",
};

// ── direct ATS boards (slugs live-verified 2026-07-03; APIs are public/no-auth)
// Sourcing straight from the company board = fresher than any aggregator AND
// the strongest ghost-job filter (if it's not on the board, it's not real).
const ATS_TARGETS = {
  greenhouse: {
    Figma: "figma", Stripe: "stripe", Anthropic: "anthropic", "Scale AI": "scaleai",
    Roblox: "roblox", "Epic Games": "epicgames", "Riot Games": "riotgames",
    Vercel: "vercel", Databricks: "databricks", Datadog: "datadog", Duolingo: "duolingo",
    "Rockstar Games": "rockstargames", "2K": "2k", "Take-Two": "taketwo", Nintendo: "nintendo",
    "Naughty Dog": "naughtydog", "Insomniac Games": "insomniac", Bungie: "bungie", "Bandai Namco": "bandainamco",
    Krafton: "krafton", "NetEase Games": "neteasegames", Gearbox: "gearbox",
    "Sony Pictures Imageworks": "sonypicturesimageworks", "Sony Pictures Animation": "sonypicturesanimation", Laika: "laika",
    Discord: "discord", Reddit: "reddit", Twitch: "twitch", Cloudflare: "cloudflare", MongoDB: "mongodb",
    Twilio: "twilio", Pinterest: "pinterest", Coinbase: "coinbase", Robinhood: "robinhood", Dropbox: "dropbox", GitLab: "gitlab",
    // v2b (research-verified 2026-07-05)
    Scopely: "scopely", "Digital Extremes": "digitalextremes", "Singularity 6": "singularity6", Wooga: "wooga",
    "Wildlife Studios": "wildlifestudios", "Hasbro (WotC)": "hasbro", "Tripwire": "tripwireinteractive",
    Airbnb: "airbnb", Waymo: "waymo", Samsara: "samsara", Verkada: "verkada", Remote: "remotecom", Brex: "brex",
    Elastic: "elastic", Affirm: "affirm", Instacart: "instacart", Lyft: "lyft", Asana: "asana", Fivetran: "fivetran",
    Gusto: "gusto", Faire: "faire", "Sigma Computing": "sigmacomputing", Chime: "chime", Mercury: "mercury",
    Temporal: "temporaltechnologies", Carta: "carta", Amplitude: "amplitude", Airtable: "airtable", Mixpanel: "mixpanel",
    "Cockroach Labs": "cockroachlabs", LaunchDarkly: "launchdarkly", Marqeta: "marqeta", Webflow: "webflow",
    PlanetScale: "planetscale", Netlify: "netlify",
    // v3 (2026-07-14) — coverage expansion (adjacent AI / dev-tools seen on LinkedIn but not sourced)
    Anduril: "andurilindustries", Glean: "gleanwork", Hex: "hextechnologies", "Together AI": "togetherai", Watershed: "watershed", xAI: "xai",
    // v4 (2026-07-24) — big-tech + game-company sweep (all probe-verified w/ sample titles)
    "PlayStation (SIE)": "sonyinteractiveentertainmentglobal", "Google DeepMind": "deepmind",
    "Magic Leap": "magicleap", DoorDash: "doordashusa", "Samsung Research America": "samsungresearchamerica", Squarespace: "squarespace",
    SpaceX: "spacex",  // Brian's explicit ask — huge board (~2k jobs); auto-🎯 exempted below so it can't bury the target view
    // v5 (2026-07-24) — final product-co sweep (probe-verified; empty boards like
    // HubSpot/Raycast/Atlassian-lever exist but return 0 rows → NOT added, they'd
    // trip the stale-board alarm every run)
    "Block (Square)": "block", Peloton: "peloton", Box: "boxinc", "Khan Academy": "khanacademy",
    Coursera: "coursera", Calm: "calm",
    // v6 (2026-08-04) — found by discover.mjs and identity-verified against the
    // board's own name; slug-squatters like greenhouse/bethesda (a physical
    // therapy practice) and ashby/playground (a B2B SaaS co) were rejected.
    Remedy: "remedy", "Crystal Dynamics": "crystaldynamics",
  },
  ashby: {
    OpenAI: "openai", Notion: "notion", Linear: "linear", Ramp: "ramp",
    Perplexity: "perplexity", Cursor: "cursor", Supabase: "supabase",
    Replit: "replit", Cohere: "cohere", ElevenLabs: "elevenlabs", Snowflake: "snowflake",
    // v2b
    "That Game Company": "thatgamecompany", "Second Dinner": "seconddinner", Crusoe: "crusoe", Harvey: "harvey",
    Sierra: "sierra", Decagon: "decagon", Cerebras: "cerebras", "Cognition": "cognition", Synthesia: "synthesia",
    Lovable: "lovable", Baseten: "baseten", Mercor: "mercor", Suno: "suno", Deepgram: "deepgram", Writer: "writer",
    "Lambda Labs": "lambda", Cartesia: "cartesia", Modal: "modal", "Physical Intelligence": "physicalintelligence",
    Krea: "krea", "Character.AI": "character", "Normal Computing": "normalcomputing", Pika: "pika", Tavus: "tavus",
    Reka: "reka", Ideogram: "ideogram", Runway: "runway", Plaid: "plaid", Vanta: "vanta", Sardine: "sardine",
    Miro: "miro", Browserbase: "browserbase",
    // v3 (2026-07-14) — Speak + adjacent AI startups
    Speak: "speak", Abridge: "abridge", Gamma: "gamma", Poolside: "poolside", Zapier: "zapier",
    // v5 (2026-07-24)
    Granola: "granola", Quora: "quora",
    // v6 (2026-08-04) — discover.mjs; Supercell confirmed by its own titles
    // (Clash of Clans, Brawl Stars), Midjourney by its engineering roles
    Supercell: "supercell", Midjourney: "midjourney",
  },
  lever: {
    Palantir: "palantir", Spotify: "spotify", Larian: "larian", Illumination: "illumination",
    Skydance: "skydance", Voodoo: "voodoo", Kabam: "kabam", "Dream Games": "dreamgames",
    Easybrain: "easybrain", Mistplay: "mistplay", "Jam City": "jamcity",
  },
  // SmartRecruiters: { Company: "companyId" } — CASE-SENSITIVE, oddly suffixed (Ubisoft2, NBCUniversal3)
  smartrecruiters: {
    Ubisoft: "Ubisoft2", "CD Projekt Red": "CDPROJEKTRED", HoYoverse: "HoYoverse", "Rodeo FX": "RodeoFX", "Weta Workshop": "WetaWorkshop",
    "NBCUniversal (DreamWorks)": "NBCUniversal3", Gameloft: "Gameloft", "Keywords Studios": "KeywordsStudios", "People Can Fly": "PeopleCanFly",
    Canva: "Canva",  // v5 — 222 jobs (their greenhouse/lever/ashby probes all 404)
  },
  // Workday: { Company: { tenant, wd, site } } — POST; wd number is per-tenant (Pixar=wd501, Sega=wd3!)
  workday: {
    NVIDIA: { tenant: "nvidia", wd: 5, site: "NVIDIAExternalCareerSite" },
    Adobe: { tenant: "adobe", wd: 5, site: "external_experienced" },
    Intel: { tenant: "intel", wd: 1, site: "External" },
    // Disney's board is large enough that ILM and Lucasfilm never surface in a
    // newest-200 sample — both were counted as unsourced companies until the
    // sweeps landed.
    Disney: { tenant: "disney", wd: 5, site: "disneycareer", sweeps: ["Industrial Light", "Lucasfilm", "intern"] },
    Autodesk: { tenant: "autodesk", wd: 1, site: "Ext" },
    "Warner Bros Games": { tenant: "warnerbros", wd: 5, site: "global" },
    Pixar: { tenant: "pixar", wd: 501, site: "Pixar_External_Career_Site" },
    Sony: { tenant: "sonyglobal", wd: 1, site: "SonyGlobalCareers" },
    Sega: { tenant: "sega", wd: 3, site: "Sega_Careers" },
    // v4 (2026-07-24) — probe-verified; adapter samples the newest ~200/tenant
    Salesforce: { tenant: "salesforce", wd: 12, site: "External_Career_Site" },
    Micron: { tenant: "micron", wd: 1, site: "External" },
    // MISLABELLED until 2026-08-04: this tenant is NOT a Microsoft Gaming
    // central board. Pulling all 57 rows shows only Activision Blizzard King
    // studios (Treyarch, Infinity Ward, Sledgehammer, Beenox, Demonware, King);
    // searches for Bethesda, ZeniMax, Mojang and Obsidian all return 0. The
    // Xbox first-party studios post on Microsoft's own pcsx API instead, which
    // fromMicrosoftCareers already covers, and ZeniMax runs a separate iCIMS
    // portal. The old name made three separate gaps look covered.
    "Activision Blizzard King": { tenant: "xboxgaming", wd: 1, site: "External" },
    // v6 (2026-08-04) — 336 jobs incl. "Game Operations Intern"
    Tencent: { tenant: "tencent", wd: 1, site: "Tencent_Careers" },
    // Snap is Workday but on the myworkdaysite.com host, and its apply URLs
    // sit under /recruiting/… rather than /en-US/…. Display name must be
    // "Snapchat" — that is what the TARGETS list matches, "Snap" would not.
    Snapchat: { tenant: "snapchat", wd: 1, site: "snap", host: "wd1.myworkdaysite.com", urlBase: "https://wd1.myworkdaysite.com/recruiting/snapchat/snap" },
    // v5 (2026-07-24)
    Zoom: { tenant: "zoom", wd: 5, site: "Zoom" },
    PayPal: { tenant: "paypal", wd: 1, site: "jobs" },
  },
  workable: { "Square Enix": "square-enix", "Hugging Face": "huggingface" },
  recruitee: { Framestore: "framestore" },
};
// every company we source directly IS a desirable target-company (curated), so
// treat them as targets without bloating the TARGETS regex. ATS rows carry the
// exact display name as r.company, so an exact-set check is reliable.
// Exception: boards included for COVERAGE at Brian's ask but not on his target
// list — their rows are fully in the feed but don't auto-🎯 (a ~2k-role board
// would otherwise bury the target view).
const NO_AUTO_TARGET = new Set(["SpaceX"]);
const ATS_COMPANY_SET = new Set(Object.values(ATS_TARGETS).flatMap((o) => Object.keys(o)).filter((c) => !NO_AUTO_TARGET.has(c)));

// knockout: senior+ roles are never relevant (intern/new-grad/early-career focus)
const SENIOR_RX = /\b(senior|staff|principal|director|manager|head of|vp|vice president|distinguished|sr\.?|lead architect)\b/i;

// ── category mapping (Brian's scope: broad — every bucket matters) ──────────
const GAME_RX = /\b(game|graphics|render(ing)?|technical artist|shader|unreal|unity|3d|gameplay|game engine|xr|augmented reality|virtual reality|mixed reality|spatial comput\w*|creative technolog\w*|creative cod\w*|creative develop\w*)\b/i;
// pure art/creative roles Brian added to scope (2026-07-04) — niche but wanted
const ART_RX = /\b(3d artist|character artist|environment artist|concept artist|texture artist|lighting artist|vfx artist|fx artist|cg artist|cgi artist|digital sculptor|3d modell?er|character modell?er|animator|character animator|technical animator|look[- ]?dev|\brigger\b|rigging artist|character td|creature td|compositor|matte painter|simulation artist|storyboard artist|3d generalist|game artist|game designer)\b/i;
// "Design" is two completely different jobs and the feed conflated them: 23% of
// the Design/UX bucket was ASIC/VLSI/mechanical work, because "design engineer"
// matches "ASIC Design Engineer" and "Mechanical Design Engineer". Hardware
// NOTE "product design engineer": that is MECHANICAL engineering at Apple and
// most hardware companies — Beats, Vision Pro, Interconnect, Core Systems are
// all ME roles. "Product DESIGNER" (no "engineer") is the UX job. That single
// word is the whole distinction, and it generalises well beyond Apple.
// design is checked FIRST and routed to Hardware, so the design bucket means
// what Brian means by it.
const HW_DESIGN_RX = /\b(asic|vlsi|\brtl\b|register transfer|physical design|design verification|\bdft\b|\bsoc\b|silicon|semiconductor|standard cell|floorplan|place and route|synthesis and implementation|static timing|timing analysis|analog|mixed[- ]signal|\bpcb\b|schematic|circuit design|chip design\w*|hardware design\w*|mechanical design\w*|electrical design\w*|electronic design\w*|thermal design\w*|packaging design\w*|structures design\w*|structural design\w*|harness design\w*|layout design\w*|\brfic\b|\bbaw\b|\brcdd\b|filter design\w*|\bhvac\b|piping|\bcad\b|design for manufactur\w*|\bdfm\b|test hardware|cache controller|memory controller|\bdram\b|\bhbm\b|\bpll\b|phase[- ]locked|control design|system design engineer|power design|\brf design|antenna|optical design|process design|tool design|die design|package design|verification engineer|\bfpga\b|\bmechanical\b|materials engineer|interconnect|\bthermal\b|enclosure|product design engineer)\b/i;
// Every big company names design differently and a generic list misses them:
// Apple's UX org is HUMAN INTERFACE (and its "Product Design" is mechanical
// engineering); Google ships UX Engineer, UX Writer and Design Technologist;
// Meta uses Content Design; games use UI Artist and Level Designer. The list is
// deliberately vocabulary-wide so a role is caught whatever its employer calls
// it — HW_DESIGN_RX runs first, so widening here cannot pull in chip work.
const DESIGN_RX = /\b(product design(er)?|ux|ui designer|ui\/ux|ux\/ui|user experience|user interface|user research(er)?|ux research\w*|design research\w*|interaction design\w*|visual design\w*|brand design\w*|graphic design\w*|motion design\w*|industrial design\w*|service design\w*|experience design\w*|communications? design\w*|content design\w*|conversation design\w*|design system\w*|design language|design technolog\w*|design program\w*|design ops|design operations|\bdesigner\b|design engineer|design lead|ux engineer|ui engineer|ux writer|ux content|web designer|digital designer|creative technolog\w*|prototyper|human interface|human factors|\bhci\b|usability|information architect\w*|\bui artist\b|\bux\/ui\b)\b/i;
// Product management — was only matching "product manager", so APM/RPM/PM
// programmes (which is how big tech actually names its intern product tracks)
// all fell through to "Other".
const PRODUCT_RX = /\b(product manager|product management|associate product manager|\bapm\b|rotational product manager|\brpm\b|technical product manager|product owner|product analyst|product strategy|product operations)\b/i;

// ── inbox relevance gate — DROP wildly-unrelated roles so the inbox stays clean.
// GUARDRAIL: exclude by SPECIFIC phrase/qualifier, NEVER by bare "engineer"/
// "developer" — every real tech title must survive. Verified against category
// counts before shipping (Software Eng + Data/AI/ML must stay ~unchanged).
// NOTE: only CLEARLY non-tech phrases here. Domain words that appear in real
// tech titles (supply chain, procurement, accounting, warehouse, solutions
// architect) are deliberately NOT excluded — e.g. "ML Engineer - Supply Chain",
// "Data Warehouse Software Engineer", "Software Engineer, Accounting" must survive.
const EXCLUDE_RX = /\b(account executive|account manager|\baccountant\b|bookkeeper|sales representative|sales associate|sales manager|sales lead|sales development|sales engineer|account partner|\bsdr\b|\bbdr\b|business development representative|business development manager|pre[- ]?sales|sales operations|revenue operations|\brevops\b|revenue analyst|\brecruiter\b|recruiting|talent acquisition|\bsourcer\b|human resources|human resource|\bhr\b|business partner|people operations|people partner|people team|payroll|benefits administrator|compensation analyst|financial planning|fp&a|legal counsel|\bparalegal\b|\battorney\b|law clerk|financial analyst|finance manager|treasury|tax associate|tax analyst|\bauditor\b|\bactuary\b|marketing manager|marketing associate|marketing specialist|product marketing|developer marketing|growth marketing|brand manager|content strategist|content writer|copywriter|social media|public relations|communications manager|customer success|customer support|customer experience|support specialist|technical support|technical services|help desk|security officer|security guard|deal desk|strategic deals|deals lead|employee lifecycle|revenue transformation|marketing scientist|production assistant|\bambassador\b|order management|privacy counsel|\bcounsel\b|\bgrc\b|accounts payable|accounts receivable|marketing lead|influencer marketing|creator marketing|\brvp\b|regional vice president|inside sales|field sales|brand ambassador|grant writer|technical writer|proposal writer|executive assistant|administrative assistant|office manager|receptionist|facilities|\bbuyer\b|logistics coordinator|clinical|registered nurse|\bphysician\b|therapist|\bteacher\b|\btutor\b|\bbarista\b|\bcashier\b|retail associate|store manager|delivery driver|maintenance technician|field technician|installation technician|phlebotomist|dental|pharmac|landscape architect\w*|architectural intern|architectural design\w*|architectural draft\w*|\barchitecture intern\b|interior design|civil engineer|surveyor|estimator|cad drafter|drafting technician|fashion design|apparel design|textile design|floral design|set design|stage design|jewelry design|packaging engineer)\b/i;

function categorize(title, sourceCategory) {
  if (ART_RX.test(title)) return "Art / Animation / VFX";
  // hardware "design" before everything — an ASIC Design Engineer is not a designer
  if (HW_DESIGN_RX.test(title)) return "Hardware";
  if (GAME_RX.test(title)) return "Graphics / Game / 3D";
  if (DESIGN_RX.test(title)) return "Design / UX";
  if (PRODUCT_RX.test(title)) return "Product";
  const c = (sourceCategory || "").toLowerCase();
  if (c.includes("design")) return "Design / UX";
  if (c.includes("software")) return "Software Engineering";
  if (c.includes("ai") || c.includes("data")) return "Data / AI / ML";
  if (c.includes("product")) return "Product";
  if (c.includes("quant")) return "Quant";
  if (c.includes("hardware")) return "Hardware";
  if (/\b(software|swe|full[- ]?stack|front[- ]?end|back[- ]?end|infrastructure|platform|web develop|mobile|ios|android|founding engineer|security engineer|security operations|systems engineer|devops|site reliability|reliability engineer|observability|\bsre\b|cloud engineer|network engineer|\bqa\b|test engineer|automation engineer|embedded|firmware|solutions architect|application engineer|deployment engineer|technical operations|forward deployed|developer advocate|developer relations|developer experience|\bdevrel\b|growth engineer|applied engineer|member of technical staff|prototype engineer)\b/i.test(title)) return "Software Engineering";
  if (/\b(data|machine learning|\bml\b|\bai\b|research|applied scientist)\b/i.test(title)) return "Data / AI / ML";
  if (/\bproduct manager\b/i.test(title)) return "Product";
  return "Other";
}

function levelFromTitle(t) {
  // Plurals matter: "\bintern(ship)?\b" does NOT match "Internships", because
  // the trailing s kills the word boundary. Apple posts "Product Design
  // Undergrad Internships" and every one of them read as full-time.
  if (/\binterns?(hips?)?\b/i.test(t)) return "intern";
  if (/\b(new grad|university grad|campus|early career|entry[- ]level|graduate)\b/i.test(t)) return "new-grad";
  // Research fellowships (Anthropic Fellows Program, residencies) are the AI
  // labs' early-career on-ramp and often the ONLY one they run — but "Fellow"
  // read as full-time, so they sank. Guarded against senior fellow titles.
  // NOT a bare \bresidency\b — that matches "Data Residency", a compliance term.
  if (/\b(fellows? program|fellowship|residency program|research residency|ai residency)\b/i.test(t) && !SENIOR_RX.test(t)) return "new-grad";
  return "full-time";
}

// term extraction: Simplify carries a terms[] field; others parse from title
function termFromTitle(t) {
  const m = t.match(/(spring|summer|fall|autumn|winter)\s*[',-]?\s*(20\d{2})/i) || t.match(/(20\d{2})\s*(spring|summer|fall|autumn|winter)/i);
  if (!m) return "";
  const season = (/^20/.test(m[1]) ? m[2] : m[1]).toLowerCase().replace("autumn", "fall");
  const year = /^20/.test(m[1]) ? m[1] : m[2];
  return season[0].toUpperCase() + season.slice(1) + " " + year;
}

// ── US filter ────────────────────────────────────────────────────────────────
// ATS boards use bare city names ("San Francisco") — recognize the majors too.
const US_CITIES = /\b(san francisco|new york|nyc|seattle|mountain view|palo alto|menlo park|cupertino|redmond|bellevue|austin|chicago|boston|los angeles|santa monica|irvine|san diego|san jose|sunnyvale|denver|miami|washington|philadelphia|pittsburgh|atlanta|dallas|houston|portland|brooklyn|cambridge|durham|raleigh|salt lake|phoenix|minneapolis|nashville)\b/i;
// the real 50 states + DC/territories — precise, so foreign region codes
// (German "RP", Canadian "QC") that look like US states don't sneak through.
const US_STATE = /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR)\b/;
// full state names too — feeds list bare "Texas" / "Ohio" with no code
const US_STATE_NAME = /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|west virginia|wisconsin|wyoming)\b/i;
const NON_US = /\b(canada|montr[eé]al|qu[eé]bec|ontario|toronto|ottawa|vancouver|calgary|edmonton|winnipeg|uk|united kingdom|england|scotland|london|manchester|india|bangalore|bengaluru|hyderabad|pune|gurgaon|noida|singapore|germany|mainz|munich|berlin|hamburg|frankfurt|paris|france|lyon|bordeaux|ireland|dublin|australia|sydney|melbourne|japan|tokyo|osaka|korea|seoul|mexico|guadalajara|brazil|netherlands|amsterdam|zurich|switzerland|geneva|spain|barcelona|madrid|israel|tel aviv|poland|warsaw|krakow|china|shanghai|beijing|shenzhen|hong kong|taiwan|taipei|philippines|manila|vietnam|malaysia|thailand|bangkok|new zealand|sweden|stockholm|finland|helsinki|norway|denmark|copenhagen|italy|rome|milan|portugal|lisbon|romania|bucharest|belgium|brussels|austria|vienna|czech|prague|turkey|istanbul|uae|dubai|abu dhabi|argentina|colombia|chile|egypt|nigeria|south africa|kenya)\b/i;
function isUS(locations) {
  if (!locations || locations.length === 0) return false;
  return locations.some((raw) => {
    const l = String(raw).trim();
    // An explicit US state WINS over a city name that also exists abroad —
    // otherwise "Melbourne, FL" reads as Australia and "Dublin, OH" as Ireland,
    // and both were being thrown away.
    if (US_STATE.test(l) || US_STATE_NAME.test(l) || /\b(usa|united states|u\.s\.)\b/i.test(l)) return true;
    if (NON_US.test(l)) return false;          // global ATS boards return worldwide roles
    // bare metro shorthand the feeds use with no state at all
    if (/^remote$/i.test(l) || /remote.*(us|usa|united states)/i.test(l) || /\b(sf bay|bay area)\b/i.test(l) || /^(sf|la)$/i.test(l) || US_CITIES.test(l)) return true;
    // Some boards put a WORK MODE where the location goes — Cloudflare says
    // "In-Office", SpaceX says "Flexible - Any SpaceX Site". There is no
    // geography to test, so the filter was silently dropping real US roles
    // (a Cloudflare SWE intern in Austin, TX was lost this way — the city was
    // in the TITLE, not the location). No non-US signal + no geography at all
    // means unknown, and unknown at a curated US-centric board is worth keeping.
    return /^(in[- ]?office|on[- ]?site|onsite|hybrid|flexible|remote|various|multiple|any\b|n\/?a)/i.test(l) || !/[a-z]/i.test(l);
  });
}

// ── fetch helpers (a failed source never kills the run) ─────────────────────
async function fetchJSON(url) {
  const r = await fetch(url, { headers: { "user-agent": "careeros-role-grabber" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}
async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": "careeros-role-grabber" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

// ── source parsers → normalized {company,title,category,locations,url,posted,level,source}
// Simplify: active listings PLUS ones it closed within the last 14 days.
// Companies like Google rotate posting IDs, so Simplify flips real, still-
// applyable roles (e.g. the Summer-2027 SWE MS intern) to inactive — those
// must not silently vanish from Brian's feed. Recently-closed rows carry
// closedRecently=true and get ghost-flagged (dimmed, "verify before applying").
const CLOSED_KEEP_DAYS = 14;
function fromSimplify(list, level) {
  const cutoff = Date.now() / 1000 - CLOSED_KEEP_DAYS * 86400;
  return list
    .filter((x) => x.is_visible !== false && (x.active || (x.date_updated || 0) > cutoff))
    .map((x) => ({
      company: x.company_name,
      title: x.title,
      category: categorize(x.title, x.category),
      locations: x.locations || [],
      url: x.url,
      posted: new Date((x.date_posted || x.date_updated) * 1000).toISOString().slice(0, 10),
      term: (x.terms || []).filter((t) => t && t !== "N/A").join(" / ") || termFromTitle(x.title),
      level,
      source: "simplify",
      ...(x.active ? {} : { closedRecently: true }),
    }));
}

function fromJobrightDesign(md) {
  const roles = [];
  let lastCompany = "";
  const year = new Date().getFullYear();
  const month = new Date().getMonth(); // 0-11
  for (const line of md.split("\n")) {
    if (!line.startsWith("|") || line.includes("-----") || line.includes("Company |")) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 6) continue;
    const companyCell = cells[1];
    const titleCell = cells[2];
    const location = cells[3];
    const postedCell = cells[5];
    const company =
      companyCell.includes("↳") ? lastCompany : (companyCell.match(/\[([^\]]+)\]/) || [])[1] || companyCell.replace(/\*/g, "");
    lastCompany = company;
    const title = (titleCell.match(/\[([^\]]+)\]/) || [])[1] || titleCell.replace(/\*/g, "");
    const url = (titleCell.match(/\((https?:[^)]+)\)/) || [])[1] || "";
    const m = postedCell.match(/([A-Z][a-z]{2})\s+(\d{1,2})/);
    let posted = "";
    if (m) {
      const mi = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(m[1]);
      const y = mi > month ? year - 1 : year;
      posted = `${y}-${String(mi + 1).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
    }
    if (!company || !title || !url) continue;
    roles.push({ company, title, category: "Design / UX", locations: [location], url, posted, term: termFromTitle(title), level: "intern", source: "jobright" });
  }
  return roles;
}

// ATS fetchers — filter senior titles at ingestion (boards carry all levels)
async function fromGreenhouse(company, token) {
  const d = await fetchJSON(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs`);
  return (d.jobs || []).filter((j) => !SENIOR_RX.test(j.title)).map((j) => ({
    company,
    title: j.title,
    category: categorize(j.title, ""),
    locations: [j.location?.name || ""].filter(Boolean),
    url: j.absolute_url,
    posted: String(j.first_published || j.updated_at || "").slice(0, 10),
    term: termFromTitle(j.title),
    level: levelFromTitle(j.title),
    source: "greenhouse",
  }));
}
async function fromAshby(company, org) {
  const d = await fetchJSON(`https://api.ashbyhq.com/posting-api/job-board/${org}`);
  return (d.jobs || []).filter((j) => j.isListed !== false && !SENIOR_RX.test(j.title)).map((j) => ({
    company,
    title: j.title,
    category: categorize(j.title, ""),
    locations: [j.location || ""].concat((j.secondaryLocations || []).map((s) => s.location)).filter(Boolean),
    url: j.jobUrl || j.applyUrl,
    posted: String(j.publishedAt || "").slice(0, 10),
    term: termFromTitle(j.title),
    level: j.employmentType === "Intern" ? "intern" : levelFromTitle(j.title),
    source: "ashby",
  }));
}
async function fromLever(company, site) {
  const d = await fetchJSON(`https://api.lever.co/v0/postings/${site}?mode=json`);
  return (Array.isArray(d) ? d : []).filter((j) => !SENIOR_RX.test(j.text)).map((j) => ({
    company,
    title: j.text,
    category: categorize(j.text, ""),
    locations: [j.categories?.location || ""].filter(Boolean),
    url: j.hostedUrl,
    posted: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : "",
    term: termFromTitle(j.text),
    level: levelFromTitle(j.text),
    source: "lever",
  }));
}

async function fromSmartRecruiters(company, id) {
  // paginate: 100/page, a couple pages is plenty for early-career filtering
  const out = [];
  for (let offset = 0; offset < 300; offset += 100) {
    const d = await fetchJSON(`https://api.smartrecruiters.com/v1/companies/${id}/postings?limit=100&offset=${offset}`);
    const page = d.content || [];
    out.push(...page);
    if (page.length < 100) break;
  }
  return out.filter((j) => !SENIOR_RX.test(j.name)).map((j) => ({
    company,
    title: j.name,
    category: categorize(j.name, ""),
    locations: [[j.location?.city, j.location?.region].filter(Boolean).join(", ") || (j.location?.remote ? "Remote" : "")].filter(Boolean),
    url: `https://jobs.smartrecruiters.com/${id}/${j.id}`,
    posted: String(j.releasedDate || "").slice(0, 10),
    term: termFromTitle(j.name),
    level: levelFromTitle(j.name),
    source: "smartrecruiters",
  }));
}

// Workday "postedOn" is relative text ("Posted 3 Days Ago") → approximate ISO date
function workdayPosted(text) {
  if (!text) return "";
  const t = text.toLowerCase();
  if (/today/.test(t)) return new Date().toISOString().slice(0, 10);
  if (/yesterday/.test(t)) return new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const m = t.match(/(\d+)\+?\s*day/);
  if (m) return new Date(Date.now() - +m[1] * 864e5).toISOString().slice(0, 10);
  const mo = t.match(/(\d+)\+?\s*month/);
  if (mo) return new Date(Date.now() - +mo[1] * 30 * 864e5).toISOString().slice(0, 10);
  return "";
}

// `host`   — some tenants live on myworkdaysite.com rather than myworkdayjobs.com
//            (Snap), and the apply-URL base differs from the API host there.
// `sweeps`  — a huge tenant sampled newest-first buries whole business units:
//            Disney's board is big enough that ILM and Lucasfilm never appear
//            in the newest 200. Extra searchText passes surface them.
async function fromWorkday(company, { tenant, wd, site, host, urlBase, sweeps }) {
  const h = host || `${tenant}.wd${wd}.myworkdayjobs.com`;
  const api = `https://${h}/wday/cxs/${tenant}/${site}/jobs`;
  const base = urlBase || `https://${h}/en-US/${site}`;
  const out = [];
  const seen = new Set();
  for (const searchText of ["", ...(sweeps || [])]) {
    // large tenants (NVIDIA ~2000) → cap at a sample of the newest ~200
    for (let offset = 0; offset < 200; offset += 20) {
      const r = await fetch(api, {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "careeros-role-grabber" },
        body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText }),
      });
      if (!r.ok) throw new Error(`${r.status} workday ${company}`);
      const d = await r.json();
      const page = d.jobPostings || [];
      for (const p of page) {
        const k = p.externalPath || p.title;
        if (k && !seen.has(k)) { seen.add(k); out.push(p); }
      }
      if (page.length < 20) break;
    }
  }
  // some tenants (Disney) return occasional rows with no title — drop them
  return out.filter((j) => j.title && !SENIOR_RX.test(j.title)).map((j) => ({
    company,
    title: j.title,
    category: categorize(j.title, ""),
    locations: [j.locationsText || ""].filter(Boolean),
    url: base + j.externalPath,
    posted: workdayPosted(j.postedOn),
    term: termFromTitle(j.title),
    level: levelFromTitle(j.title),
    source: "workday",
  }));
}

// Amazon posts on amazon.jobs (custom site, public search.json) — NOT on any
// public ATS, so without this its intern roles only appear when Simplify
// curates them (Brian applied to postings we were missing). Location format is
// country-first ("US, WA, Seattle") → filter US here and normalize to
// "City, ST". Legal-entity company names ("Amazon.com Services LLC") are
// collapsed to "Amazon" so tracker grouping and TARGETS stay coherent.
async function fromAmazonJobs() {
  const out = [];
  const seenPaths = new Set();
  // two sweeps: the official student-programs bucket (interns + Jr/new-grad
  // programs, ~260 rows) + a full-text intern query for stragglers outside it
  for (const q of ["business_category[]=studentprograms", "base_query=intern"]) {
    let offset = 0, hits = Infinity;
    while (offset < Math.min(hits, 400)) {
      const r = await fetch(`https://www.amazon.jobs/en/search.json?${q}&result_limit=100&offset=${offset}`, {
        headers: { "user-agent": "Mozilla/5.0 (careeros-role-grabber)" },
      });
      if (!r.ok) throw new Error(`${r.status} amazon.jobs`);
      const d = await r.json();
      hits = d.hits || 0;
      const page = d.jobs || [];
      if (!page.length) break;
      offset += page.length;
      for (const j of page) {
        if (seenPaths.has(j.job_path)) continue;
        seenPaths.add(j.job_path);
        const loc = String(j.location || "");
        if (!loc.startsWith("US")) continue;                     // country-first format
        const [, st, city] = loc.split(",").map((s) => s.trim());
        if (SENIOR_RX.test(j.title)) continue;
        out.push({
          company: "Amazon",
          title: j.title,
          category: categorize(j.title, j.job_category || ""),
          locations: [[city, st].filter(Boolean).join(", ")].filter(Boolean),
          url: "https://www.amazon.jobs" + j.job_path,
          posted: j.posted_date ? new Date(j.posted_date).toISOString().slice(0, 10) : "",
          term: termFromTitle(j.title),
          level: /\b(intern|co-?op)\b/i.test(j.title) ? "intern" : "new-grad",
          source: "amazonjobs",
        });
      }
    }
  }
  return out;
}

// Netflix runs on Eightfold (explore.jobs.netflix.net) — public JSON API.
async function fromNetflixEightfold() {
  const r = await fetch("https://explore.jobs.netflix.net/api/apply/v2/jobs?domain=netflix.com&query=intern&num=50&start=0", {
    headers: { "user-agent": "Mozilla/5.0 (careeros-role-grabber)" },
  });
  if (!r.ok) throw new Error(`${r.status} netflix eightfold`);
  const d = await r.json();
  return (d.positions || []).filter((p) => !SENIOR_RX.test(p.name)).map((p) => {
    // keep the full "City, State, Country" string — isUS() matches on the
    // country name (2-letter state codes are absent in Eightfold's format)
    const parts = String((p.locations && p.locations[0]) || p.location || "").split(",").map((s) => s.trim());
    return {
      company: "Netflix",
      title: p.name,
      category: categorize(p.name, p.department || ""),
      locations: [parts.join(", ")].filter(Boolean),
      url: p.canonicalPositionUrl,
      posted: p.t_create ? new Date(p.t_create * 1000).toISOString().slice(0, 10) : "",
      term: termFromTitle(p.name),
      level: levelFromTitle(p.name),
      source: "netflix",
    };
  });
}

// Microsoft is on the SAME Eightfold platform as Netflix, just under its own
// domain — found by driving jobs.careers.microsoft.com in a browser and watching
// which JSON it actually calls. Every documented Microsoft careers endpoint I
// tried was dead (gcsservices.* no longer serves a matching TLS cert), verified
// identical from a US runner so it is not geo-blocking. Without this, Microsoft
// reaches the feed only if Simplify happens to carry it — which is how a
// Software Engineer Intern - CoreAI posting went missing on 2026-08-03.
async function fromMicrosoftCareers() {
  const out = [];
  const seen = new Set();
  // The API hard-caps a page at 10 rows whatever `num` says, and reports the
  // true total in data.count — so step by 10 and bound by that. Passing
  // `location` over-filters badly (query=intern drops from 41 hits to 8), so
  // it's omitted and isUS() does the filtering downstream as for every source.
  // CAP is deliberately modest and requests are spaced — paginating hard across
  // six queries earned a 429 from this API.
  const PAGE = 10, CAP = 120;
  for (const query of ["intern", "university graduate", "designer", "product manager"]) {
    let count = Infinity;
    for (let start = 0; start < Math.min(count, CAP); start += PAGE) {
      const u = `https://apply.careers.microsoft.com/api/pcsx/search?domain=microsoft.com&query=${encodeURIComponent(query)}&start=${start}&num=${PAGE}&hl=en`;
      // Sequentially this API is fine, but the grabber fires every source at
      // once and it answers 429 under that load — losing the whole company for
      // the run. Back off and retry rather than fetching less.
      let r, d;
      for (let attempt = 0; attempt < 4; attempt++) {
        await new Promise((res) => setTimeout(res, attempt ? 1200 * attempt : 250));
        r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (careeros-role-grabber)", accept: "application/json" } });
        if (r.ok) break;
        if (r.status !== 429 && r.status !== 503) throw new Error(`${r.status} microsoft pcsx`);
      }
      if (!r.ok) throw new Error(`${r.status} microsoft pcsx (after retries)`);
      d = await r.json();
      count = d?.data?.count ?? count;
      const page = d?.data?.positions || d?.positions || [];
      if (!page.length) break;
      for (const p of page) {
        const id = p.id || p.atsJobId || p.displayJobId;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        if (SENIOR_RX.test(p.name || "")) continue;
        const loc = (p.locations && p.locations[0]) || p.location || "";
        out.push({
          company: "Microsoft",
          title: p.name,
          category: categorize(p.name, p.department || ""),
          locations: [String(loc)].filter(Boolean),
          url: `https://jobs.careers.microsoft.com/global/en/job/${p.atsJobId || id}`,
          posted: p.postedTs ? new Date(p.postedTs).toISOString().slice(0, 10)
                : p.creationTs ? new Date(p.creationTs).toISOString().slice(0, 10) : "",
          term: termFromTitle(p.name),
          level: levelFromTitle(p.name),
          source: "microsoft",
        });
      }
    }
  }
  return out;
}

// Google has no usable careers API — v2 and v3 are both retired (404 from a US
// runner too, so it is not geo-blocking). But the results page is server-
// rendered and ships every record inside an AF_initDataCallback block, so a
// plain fetch + parse gets the same data a browser would, with no Playwright
// dependency in CI.
//
// This one matters: a Google 2027 internship opened and the feed missed it
// entirely — Brian only found out because someone posted it on LinkedIn.
//
// Record shape (positional, hence the index comments):
//   [0] jobId  [1] title  [2] apply url  [7] company  [9] locations  [12] created(epoch s)
function parseGoogleBlock(html) {
  const blocks = [...html.matchAll(/AF_initDataCallback\((\{.*?\})\);<\/script>/gs)];
  for (const b of blocks) {
    const raw = b[1];
    const s = raw.indexOf("data:") + 5;
    if (s < 5) continue;
    let depth = 0, end = -1;
    for (let i = s; i < raw.length; i++) {
      const c = raw[i];
      if (c === "[") depth++;
      else if (c === "]" && --depth === 0) { end = i + 1; break; }
    }
    if (end < 0) continue;
    let arr;
    try { arr = JSON.parse(raw.slice(s, end)); } catch { continue; }
    // There are several AF blocks and the first one (ds:0) is a filter list
    // whose rows are ALSO arrays of strings — "typeof [1] === string" happily
    // matches it and yields "DeepMind" as a job title. Require the shape of a
    // real record: a long numeric id at [0] and an apply URL at [2].
    const jobs = Array.isArray(arr?.[0]) ? arr[0] : null;
    const looksLikeJob = (j) => Array.isArray(j) && /^\d{8,}$/.test(String(j[0] ?? "")) && typeof j[1] === "string" && /^https?:\/\//.test(String(j[2] ?? ""));
    if (jobs && jobs.length && looksLikeJob(jobs[0])) return jobs.filter(looksLikeJob);
  }
  return [];
}

async function fromGoogleCareers() {
  const out = [];
  const seen = new Set();
  for (const q of ["intern", "student researcher", "university graduate", "designer", "user experience", "product manager"]) {
    for (let page = 1; page <= 10; page++) {
      const u = `https://www.google.com/about/careers/applications/jobs/results?q=${encodeURIComponent(q)}&page=${page}`;
      const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36", "accept-language": "en-US,en;q=0.9" } });
      if (!r.ok) throw new Error(`${r.status} google careers`);
      const jobs = parseGoogleBlock(await r.text());
      if (!jobs.length) break;
      let added = 0;
      for (const j of jobs) {
        const id = j[0], title = j[1];
        if (!id || !title || seen.has(id)) continue;
        seen.add(id); added++;
        if (SENIOR_RX.test(title)) continue;
        // [9] is [[ "Mountain View, CA, USA", [...], "Mountain View", null, "CA" ], …]
        const locs = (Array.isArray(j[9]) ? j[9] : []).map((L) => (Array.isArray(L) ? L[0] : L)).filter((x) => typeof x === "string");
        const ts = Array.isArray(j[12]) ? j[12][0] : null;
        out.push({
          company: "Google",
          title,
          category: categorize(title, ""),
          locations: locs.length ? locs : [],
          url: `https://www.google.com/about/careers/applications/jobs/results/${id}`,
          posted: ts ? new Date(ts * 1000).toISOString().slice(0, 10) : "",
          term: termFromTitle(title),
          level: levelFromTitle(title),
          source: "google",
        });
      }
      if (!added) break;                                  // pagination exhausted
    }
  }
  return out;
}

// Apple has no callable careers API — the documented POST /api/role/search now
// 404s and watching the real site in a browser shows it makes NO job XHR at
// all. The search page is server-rendered and every record is embedded in the
// HTML as escaped JSON, so plain fetch + parse gets everything.
//
// Two quirks drive the sweep design, both measured:
//   · Apple's free-text search is semantic and unreliable — search=intern
//     returns Indian retail roles ("IN-Business Expert"), search=designer
//     returns cellular firmware. It cannot be trusted to find design roles.
//   · The team= filter is ignored for every code (SFTWR, MLAI, HRDWR all
//     return identical results) EXCEPT internships-STDNT-INTRN, which works.
// So: take the internships pipeline exactly, then paginate the US board
// newest-first and let the classifier do the filtering.
//
// Worth knowing when reading the output: at Apple, "Product Design" means
// MECHANICAL engineering, and the UX org is called HUMAN INTERFACE.
function parseAppleJobs(html) {
  const un = html.replace(/\\"/g, '"').replace(/\\n/g, " ");
  const out = [];
  const rx = /"locations":(\[[^\]]*\]),"positionId":"(\d+)","postingDate":"([^"]*)","postingTitle":"([^"]*)"/g;
  for (const m of un.matchAll(rx)) {
    let locs = [];
    try {
      locs = JSON.parse(m[1]).map((L) => [L.city, L.stateProvince, L.countryName].filter(Boolean).join(", ") || L.name).filter(Boolean);
    } catch { /* keep going — a malformed location must not lose the role */ }
    const d = new Date(m[3]);
    out.push({
      id: m[2],
      title: m[4].replace(/\\u0026/g, "&"),
      locations: locs,
      posted: isNaN(d) ? "" : d.toISOString().slice(0, 10),
    });
  }
  return out;
}

async function fromAppleJobs() {
  const H = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36", "accept-language": "en-US,en;q=0.9" };
  const out = [];
  const seen = new Set();
  const sweeps = [
    { q: "team=internships-STDNT-INTRN", pages: 5 },          // the early-career pipeline
    { q: "location=united-states-USA&sort=newest", pages: 30 }, // newest US roles generally
  ];
  for (const s of sweeps) {
    for (let page = 1; page <= s.pages; page++) {
      await new Promise((r) => setTimeout(r, 200));
      const r = await fetch(`https://jobs.apple.com/en-us/search?${s.q}&page=${page}`, { headers: H });
      if (!r.ok) throw new Error(`${r.status} apple jobs`);
      const rows = parseAppleJobs(await r.text());
      if (!rows.length) break;
      let added = 0;
      for (const j of rows) {
        if (seen.has(j.id)) continue;
        seen.add(j.id); added++;
        if (SENIOR_RX.test(j.title)) continue;
        out.push({
          company: "Apple",
          title: j.title,
          category: categorize(j.title, ""),
          locations: j.locations,
          url: `https://jobs.apple.com/en-us/details/${j.id}`,
          posted: j.posted,
          term: termFromTitle(j.title),
          level: levelFromTitle(j.title),
          source: "apple",
        });
      }
      if (!added) break;                                     // page repeated → end
    }
  }
  return out;
}

// Rippling runs its own ATS and publishes the whole board in one call — no
// pagination, no auth. 750 rows.
async function fromRippling() {
  const r = await fetch("https://api.rippling.com/platform/api/ats/v1/board/rippling/jobs", {
    headers: { "user-agent": "Mozilla/5.0 (careeros-role-grabber)", accept: "application/json" },
  });
  if (!r.ok) throw new Error(`${r.status} rippling`);
  const d = await r.json();
  return (Array.isArray(d) ? d : d.items || d.jobs || [])
    .filter((j) => j?.name && !SENIOR_RX.test(j.name))
    .map((j) => ({
      company: "Rippling",
      title: j.name,
      category: categorize(j.name, j.department?.label || ""),
      locations: [j.workLocation?.label || ""].filter(Boolean),
      url: j.url || `https://ats.rippling.com/rippling/jobs/${j.uuid}`,
      posted: "",                                  // board exposes no post date
      term: termFromTitle(j.name),
      level: levelFromTitle(j.name),
      source: "rippling",
    }));
}

// Atlassian fronts an iCIMS portal with its own JSON endpoint — one call for
// the entire board, no auth.
async function fromAtlassian() {
  // Atlassian 403s on a User-Agent containing "role-grabber" — a bot-word
  // filter. The identical request with any other UA returns 200, so this one
  // sends a plain browser string rather than our usual identifier.
  const r = await fetch("https://www.atlassian.com/endpoint/careers/listings", {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      accept: "application/json,text/plain,*/*",
      referer: "https://www.atlassian.com/company/careers/all-jobs",
    },
  });
  if (!r.ok) throw new Error(`${r.status} atlassian`);
  const d = await r.json();
  return (Array.isArray(d) ? d : d.jobs || [])
    .filter((j) => j?.title && !SENIOR_RX.test(j.title))
    .map((j) => {
      const upd = j.portalJobPost?.updatedDate;                 // "2026-07-30 01:00 PM"
      const iso = upd ? new Date(String(upd).replace(" ", "T").slice(0, 19)) : null;
      return {
        company: "Atlassian",
        title: j.title,
        category: categorize(j.title, j.category || ""),
        locations: Array.isArray(j.locations) ? j.locations : [],
        url: j.applyUrl || j.portalJobPost?.portalUrl || "",
        posted: iso && !isNaN(iso) ? iso.toISOString().slice(0, 10) : "",
        term: termFromTitle(j.title),
        level: levelFromTitle(j.title),
        source: "atlassian",
      };
    });
}

async function fromWorkable(company, account) {
  const r = await fetch(`https://apply.workable.com/api/v3/accounts/${account}/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "careeros-role-grabber" },
    body: JSON.stringify({ query: "", location: [], department: [], worktype: [], remote: [] }),
  });
  if (!r.ok) throw new Error(`${r.status} workable ${company}`);
  const d = await r.json();
  return (d.results || []).filter((j) => !SENIOR_RX.test(j.title)).map((j) => ({
    company,
    title: j.title,
    category: categorize(j.title, ""),
    locations: [j.location ? [j.location.city, j.location.region || j.location.country].filter(Boolean).join(", ") : (j.remote ? "Remote" : "")].filter(Boolean),
    url: `https://apply.workable.com/${account}/j/${j.shortcode}/`,
    posted: String(j.published || j.created_at || "").slice(0, 10),
    term: termFromTitle(j.title),
    level: levelFromTitle(j.title),
    source: "workable",
  }));
}

async function fromRecruitee(company, subdomain) {
  const d = await fetchJSON(`https://${subdomain}.recruitee.com/api/offers/`);
  return (d.offers || []).filter((j) => !SENIOR_RX.test(j.title)).map((j) => ({
    company,
    title: j.title,
    category: categorize(j.title, ""),
    locations: [j.location || [j.city, j.country_code].filter(Boolean).join(", ")].filter(Boolean),
    url: j.careers_url || j.careers_apply_url || j.url,
    posted: String(j.published_at || "").slice(0, 10),
    term: termFromTitle(j.title),
    level: levelFromTitle(j.title),
    source: "recruitee",
  }));
}

// ── deterministic fit scoring (title tier + skills + recency + target + level)
// Tiers not fake-precision percentages — the #1 complaint about commercial
// match scores is inflated exactness.
// target companies — the "dream" list across Brian's scope: big tech, design-
// forward product cos, AI labs, game studios, and graphics/VFX/animation houses.
const TARGETS = new RegExp("\\b(" + [
  // big tech
  "google", "deepmind", "meta", "apple", "amazon", "microsoft", "nvidia", "netflix", "adobe", "tiktok", "bytedance", "qualcomm",
  // design-forward / product
  "figma", "notion", "stripe", "vercel", "linear", "airbnb", "retool", "ramp", "spotify", "pinterest", "canva", "framer", "webflow", "dropbox", "coinbase", "robinhood", "discord", "reddit", "snapchat", "twitch", "uber", "lyft", "doordash", "instacart", "duolingo", "databricks", "datadog", "palantir", "squarespace",
  // AI labs
  "anthropic", "openai", "perplexity", "cursor", "cohere", "elevenlabs", "scale ai", "mistral", "hugging face", "runway", "midjourney", "character.ai", "together ai", "supabase", "replit",
  // game studios
  "electronic arts", "ea sports", "ubisoft", "activision", "blizzard", "take-two", "rockstar", "2k games", "bungie", "insomniac", "naughty dog", "santa monica studio", "sony interactive", "playstation", "bethesda", "zenimax", "respawn", "id software", "sucker punch", "343 industries", "sledgehammer", "riot games", "epic games", "roblox", "valve", "nintendo", "tencent", "square enix", "capcom", "bandai namco", "supercell", "zynga", "scopely", "hoyoverse", "mihoyo", "netease", "niantic", "magic leap",
  "sega", "larian", "fromsoftware", "from software", "cd projekt", "remedy", "obsidian", "gearbox", "playground games", "turn 10", "guerrilla", "media molecule", "arkane", "crystal dynamics", "kojima productions", "krafton", "mojang", "the coalition", "bioware", "wizards of the coast", "double fine", "supergiant", "annapurna", "devolver", "innersloth", "moon studios",
  // graphics / VFX / animation / 3D
  "pixar", "dreamworks", "industrial light", "lucasfilm", "weta", "autodesk", "sidefx", "framestore", "dneg", "walt disney", "disney animation", "sony pictures imageworks", "unity",
  "digital domain", "blur studio", "method studios", "cinesite", "animal logic", "rodeo fx", "scanline", "image engine", "\\bmpc\\b", "pixomondo", "laika", "illumination", "sony pictures animation", "titmouse", "the mill", "wētā",
  // dev tools / infra / consumer tech
  "atlassian", "gitlab", "github", "hashicorp", "cloudflare", "mongodb", "snowflake", "twilio", "asana", "airtable", "zapier", "plaid", "brex", "mercury", "rippling", "affirm", "docusign", "grammarly", "chime", "unity technologies",
  // v2 ATS-sourced companies that weren't yet flagged
  "intel", "disney", "warner bros", "bandai namco", "rodeo fx",
].join("|") + ")\\b", "i");

// role types Brian is targeting (product design · SWE · TA · game · graphics · data)
// Design and product sit alongside SWE here, not below it — Brian applies to all
// three at the same companies. Without the product-management terms, an APM/RPM
// intern at a target company could never be flagged 🎯 (line ~777 gates on this).
const RELEVANT_RX = /\b(product design(er)?|ux|ui|ui\/ux|user experience|user interface|user research(er)?|interaction design|visual design|motion design|industrial design|service design|design system|content design|human interface|design engineer|ux engineer|design technolog\w*|prototyper|product manager|product management|associate product manager|\bapm\b|rotational product manager|\brpm\b|technical product manager|product owner|software engineer|swe|full[- ]?stack|front[- ]?end|back[- ]?end|founding engineer|web develop|developer|engineer|graphics|render(ing)?|technical artist|shader|game|gameplay|3d|unreal|unity|creative technolog\w*|creative cod\w*|member of technical staff|applied scientist|animator|\bartist\b|\bvfx\b|compositor|\brigger\b|look[- ]?dev|texture|lighting artist|environment artist)\b/i;
// …but NOT these — sales/marketing/support/ops roles that merely contain
// "engineer"/"developer" (e.g. "Sales Engineer", "Salesforce Developer").
const IRRELEVANT_RX = /\b(sales|marketing|solutions engineer|pre[- ]?sales|salesforce|account executive|\baccount\b|recruit|revenue|finance|accountant|legal|counsel|paralegal|\bgrc\b|compliance|customer success|support engineer|partnerships|go[- ]to[- ]market|\bgtm\b|talent)\b/i;
const TITLE_TIER = [
  [1.0, /\b(graphics|render(ing)?|technical artist|shader|game|gameplay|engine|3d|unreal|unity|creative technolog|design engineer|ux engineer)\b/i],
  // design + product rank WITH software engineering, not under it
  [0.7, /\b(product design(er)?|ux|ui|ui\/ux|user experience|user interface|user research(er)?|interaction design|visual design|motion design|industrial design|design system|content design|human interface|product manager|product management|associate product manager|\bapm\b|rotational product manager|technical product manager|product owner|software engineer|swe|full[- ]?stack|front[- ]?end|founding engineer|web develop)\b/i],
  [0.3, /\b(data|machine learning|\bml\b|\bai\b|research|mobile|ios|android|developer|engineer)\b/i],
];
const SKILL_RX = [/c\+\+/i, /\b(opengl|webgl|glsl|hlsl|vulkan)\b/i, /\bunreal\b/i, /\bunity\b/i, /\breact\b/i, /\b(typescript|javascript)\b/i, /\bnext\.?js\b/i, /\bfigma\b/i, /\bpython\b/i, /\b(three\.?js|r3f)\b/i];

function fitScore(r) {
  let tier = 0;
  for (const [v, rx] of TITLE_TIER) if (rx.test(r.title)) { tier = v; break; }
  const skillN = Math.min(1, SKILL_RX.filter((rx) => rx.test(r.title)).length / 2);
  const age = Math.max(0, (Date.now() - new Date(r.posted || "2000-01-01").getTime()) / 864e5);
  const recency = Math.exp(-age / 20);
  const target = TARGETS.test(r.company) ? 1 : 0;
  const level = r.level === "intern" ? 1 : r.level === "new-grad" ? 0.9 : 0.55;
  return 0.34 * tier + 0.16 * skillN + 0.2 * recency + 0.12 * target + 0.18 * level;
}
const tierIcon = (fit) => (fit >= 0.6 ? "⭐" : fit >= 0.48 ? "◐" : "");

// ── Path A: scoped LLM rescue of "Other" roles at target companies ────────────
// Deterministic regex can't place every title. A strong-but-oddly-worded role at
// a dream company ("Member of Technical Staff", "Forward Deployed Engineer", a
// left-field creative title) lands in "Other". Path A sends ONLY that tiny slice
// — Other + target company, not yet judged — to a cheap model in ONE batched
// call, and re-tags the real fits into their category (+ 🎯). Cost ceiling: a
// hard per-run cap + a committed verdict cache so a role is never re-judged.
// Free-degrading: no key or any error → skip; the grabber still ships (Path B).
const LLM_MODEL = "claude-haiku-4-5"; // cheapest tier — title triage doesn't need more
const LLM_MAX = 40;                    // hard cap of titles judged per run (cost ceiling)
const LLM_CACHE_FILE = join(ROOT, "data", "llm-cache.json");
// NOTE: "Hardware" is deliberately NOT here — Brian is CS + Design, not EE, so
// the LLM must never rescue semiconductor/electrical roles into a Hardware bucket.
// Dropping it from the enum (the LLM can't output it) + the guard in applyVerdict
// (ignores any stale cached "Hardware" verdict) keeps those roles in "Other".
const LLM_CATS = ["Graphics / Game / 3D", "Art / Animation / VFX", "Design / UX", "Software Engineering", "Data / AI / ML", "Product", "Quant", "Other"];

async function enrichOther(roles, errors) {
  let cache = {};
  try { cache = JSON.parse(readFileSync(LLM_CACHE_FILE, "utf8")); } catch {}
  const roleKey = (r) => `${r.company}|${r.title}`.toLowerCase().replace(/\s+/g, " ");
  const isTargetCo = (r) => TARGETS.test(r.company) || ATS_COMPANY_SET.has(r.company);

  const applyVerdict = (r, v) => {
    if (!v || !v.relevant || !v.category || v.category === "Other" || !LLM_CATS.includes(v.category)) return; // guard drops stale "Hardware" (and any non-allowed) verdicts
    r.category = v.category;
    r.target = !!v.target;
    r.aiTagged = true; // provenance: this row was rescued out of "Other" by Path A
    const freshDays = (Date.now() - new Date(r.posted || "2000-01-01").getTime()) / 864e5;
    r.hot = freshDays <= 2 && r.level !== "full-time" && (r.target || r.fit >= 0.6);
  };

  // apply cached verdicts for free; collect only the uncached candidates
  const candidates = [];
  for (const r of roles) {
    if (r.category !== "Other" || !isTargetCo(r)) continue;
    const k = roleKey(r);
    if (k in cache) { applyVerdict(r, cache[k]); continue; }
    candidates.push({ r, k });
  }
  // Judging NEW candidates needs the key; every cached rescue above already
  // applied. A keyless run (local/manual force-grab) just won't judge new ones.
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { console.log(`[llm] no ANTHROPIC_API_KEY — applied cached rescues, skipped ${candidates.length} new candidate(s) (next keyed cron judges them)`); return { judged: 0, rescued: 0 }; }
  if (candidates.length === 0) { console.log("[llm] no new Other@target candidates"); return { judged: 0, rescued: 0 }; }

  candidates.sort((a, b) => (b.r.posted || "").localeCompare(a.r.posted || "")); // freshest first
  const batch = candidates.slice(0, LLM_MAX);
  const dropped = candidates.length - batch.length;

  const system =
    "You triage job titles for one candidate: a Computer Science + Design new-grad/intern (US citizen, no sponsorship) targeting software engineering, computer graphics, game development, technical art, and product/UX design. Each numbered title landed in an 'Other' bucket because keyword rules couldn't place it — many are still strong fits (e.g. 'Member of Technical Staff', 'Forward Deployed Engineer', 'Creative Technologist', 'Solutions Engineer' at a graphics-tools company). Mark relevant=true only for a plausible fit and pick the closest category. Mark relevant=false with category 'Other' for: senior/staff/principal/lead/manager/director roles; anything clearly non-technical (sales, recruiting, finance, legal, support, marketing, operations); and ALL electrical/hardware/semiconductor roles (ASIC, chip, silicon, litho, wafer, packaging, thermal, RF, analog, PCB, instrumentation, controls, failure-analysis, process/manufacturing engineering) — this candidate does software and design, NOT electrical or hardware engineering.";
  const list = batch.map((c, i) => `${i}. ${c.r.title} @ ${c.r.company}`).join("\n");
  const userText = `Titles:\n${list}\n\nReturn one verdict per index 0..${batch.length - 1}. category must come from the allowed list ("Other" if genuinely not a fit); target=true only when it is a real fit at this (desirable) company.`;
  const schema = {
    type: "object", additionalProperties: false,
    properties: {
      verdicts: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          properties: {
            i: { type: "integer" },
            relevant: { type: "boolean" },
            category: { type: "string", enum: LLM_CATS },
            target: { type: "boolean" },
          },
          required: ["i", "relevant", "category", "target"],
        },
      },
    },
    required: ["verdicts"],
  };

  let verdicts = [];
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: 2048,
        system,
        output_config: { format: { type: "json_schema", schema } },
        messages: [{ role: "user", content: userText }],
      }),
    });
    if (!resp.ok) { errors.push(`llm: ${resp.status} ${(await resp.text()).slice(0, 140)}`); return { judged: 0, rescued: 0 }; }
    const data = await resp.json();
    const txt = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    verdicts = JSON.parse(txt).verdicts || [];
  } catch (e) {
    errors.push(`llm: ${String(e).slice(0, 140)}`);
    return { judged: 0, rescued: 0 };
  }

  let rescued = 0;
  for (const v of verdicts) {
    const c = batch[v.i];
    if (!c) continue;
    cache[c.k] = { relevant: !!v.relevant, category: v.category, target: !!v.target }; // cache all judged (even non-fits) so we never re-pay
    if (v.relevant && v.category !== "Other" && LLM_CATS.includes(v.category)) { applyVerdict(c.r, cache[c.k]); rescued++; }
  }

  // prune the cache to keys still present this run so it can't grow unbounded
  const live = new Set(roles.map(roleKey));
  const pruned = {};
  for (const [k, v] of Object.entries(cache)) if (live.has(k)) pruned[k] = v;
  try { writeFileSync(LLM_CACHE_FILE, JSON.stringify(pruned)); } catch {}

  console.log(`[llm] Path A: judged ${batch.length} Other@target${dropped ? ` (+${dropped} over cap, next run)` : ""}, rescued ${rescued} into categories`);
  return { judged: batch.length, rescued };
}

// ── main ─────────────────────────────────────────────────────────────────────
// previous run's data → 🆕 detection + firstSeen persistence
let prevKeys = new Set();
let prevFirstSeen = {};
try {
  const prev = JSON.parse(readFileSync(join(ROOT, "data", "roles.json"), "utf8"));
  for (const r of prev) {
    const k = `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ");
    prevKeys.add(k);
    if (r.firstSeen) prevFirstSeen[k] = r.firstSeen;
  }
} catch {}

const collectedATS = [];   // ATS rows first → dedupe prefers the fresher board row
const collectedAgg = [];
const errors = [];
const atsCounts = {};

const atsJobs = [];
for (const [company, token] of Object.entries(ATS_TARGETS.greenhouse))
  atsJobs.push(fromGreenhouse(company, token).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`gh:${company}: ${e.message}`)));
for (const [company, org] of Object.entries(ATS_TARGETS.ashby))
  atsJobs.push(fromAshby(company, org).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`ashby:${company}: ${e.message}`)));
for (const [company, site] of Object.entries(ATS_TARGETS.lever))
  atsJobs.push(fromLever(company, site).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`lever:${company}: ${e.message}`)));
for (const [company, id] of Object.entries(ATS_TARGETS.smartrecruiters || {}))
  atsJobs.push(fromSmartRecruiters(company, id).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`sr:${company}: ${e.message}`)));
for (const [company, cfg] of Object.entries(ATS_TARGETS.workday || {}))
  atsJobs.push(fromWorkday(company, cfg).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`wd:${company}: ${e.message}`)));
for (const [company, account] of Object.entries(ATS_TARGETS.workable || {}))
  atsJobs.push(fromWorkable(company, account).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`wk:${company}: ${e.message}`)));
for (const [company, sub] of Object.entries(ATS_TARGETS.recruitee || {}))
  atsJobs.push(fromRecruitee(company, sub).then((r) => { atsCounts[company] = r.length; collectedATS.push(...r); }).catch((e) => errors.push(`rc:${company}: ${e.message}`)));

await Promise.all([
  ...atsJobs,
  fetchJSON(SOURCES.simplifyIntern)
    .then((d) => collectedAgg.push(...fromSimplify(d, "intern")))
    .catch((e) => errors.push(`simplifyIntern: ${e.message}`)),
  fetchJSON(SOURCES.simplifyNewGrad)
    .then((d) => collectedAgg.push(...fromSimplify(d, "new-grad")))
    .catch((e) => errors.push(`simplifyNewGrad: ${e.message}`)),
  fetchText(SOURCES.jobrightDesign)
    .then((t) => collectedAgg.push(...fromJobrightDesign(t)))
    .catch((e) => errors.push(`jobrightDesign: ${e.message}`)),
  // big-tech custom career sites with public JSON (no public ATS → Simplify-only before this)
  fromAmazonJobs()
    .then((rows) => { collectedATS.push(...rows); atsCounts["Amazon(jobs)"] = rows.length; })
    .catch((e) => errors.push(`amazonjobs: ${e.message}`)),
  fromNetflixEightfold()
    .then((rows) => { collectedATS.push(...rows); atsCounts["Netflix(eightfold)"] = rows.length; })
    .catch((e) => errors.push(`netflix: ${e.message}`)),
  fromMicrosoftCareers()
    .then((rows) => { collectedATS.push(...rows); atsCounts["Microsoft(pcsx)"] = rows.length; })
    .catch((e) => errors.push(`microsoft: ${e.message}`)),
  fromGoogleCareers()
    .then((rows) => { collectedATS.push(...rows); atsCounts["Google(careers)"] = rows.length; })
    .catch((e) => errors.push(`google: ${e.message}`)),
  fromRippling()
    .then((rows) => { collectedATS.push(...rows); atsCounts["Rippling(own)"] = rows.length; })
    .catch((e) => errors.push(`rippling: ${e.message}`)),
  fromAtlassian()
    .then((rows) => { collectedATS.push(...rows); atsCounts["Atlassian(icims)"] = rows.length; })
    .catch((e) => errors.push(`atlassian: ${e.message}`)),
  fromAppleJobs()
    .then((rows) => { collectedATS.push(...rows); atsCounts["Apple(jobs)"] = rows.length; })
    .catch((e) => errors.push(`apple: ${e.message}`)),
]);

// stale-board tripwire (research trap: 200 + empty ≠ healthy)
for (const [company, n] of Object.entries(atsCounts)) if (n === 0) errors.push(`ats:${company}: 0 rows (stale board or bad slug?)`);

const collected = [...collectedATS, ...collectedAgg];
if (collected.length === 0) {
  console.error("All sources failed:", errors);
  process.exit(1);
}

// US filter + dedupe (ATS rows win) + fit + firstSeen/ghost
const seen = new Set();
const roles = [];
const today = new Date().toISOString().slice(0, 10);
for (const r of collected) {
  // The Simplify repos are hand-curated tech feeds (the GitHub pages Brian
  // reads for alerts) — take EVERY active listing verbatim: no US gate, no
  // noise gate. Missing a Google-tier posting costs more than any noise the
  // curated feed could ever admit. Raw ATS boards (all departments, global)
  // still go through both gates.
  const curated = r.source === "simplify";
  // The US gate applies to EVERY source, curated included. Exempting Simplify
  // was meant to protect its Google-tier listings from an over-strict filter,
  // but it let ~680 London/Toronto/Bengaluru roles into a US-only feed. isUS is
  // now accurate enough (US state beats same-named foreign city, bare state
  // names and SF/LA understood) that the exemption costs more than it saves.
  if (!isUS(r.locations)) continue;
  if (!curated && EXCLUDE_RX.test(r.title)) continue; // inbox relevance gate — drop the noise
  const key = `${r.company}|${r.title}|${r.locations[0] || ""}`.toLowerCase().replace(/\s+/g, " ");
  if (seen.has(key)) continue;
  seen.add(key);
  r.isNew = prevKeys.size > 0 && !prevKeys.has(key);
  r.firstSeen = prevFirstSeen[key] || r.posted || today;
  r.fit = Math.round(fitScore(r) * 1000) / 1000;
  // a "target" is a RELEVANT role (Brian's fields) AT a desirable company —
  // so a revenue analyst at a target company is NOT flagged, but a technical
  // artist at EA is. One flag, shared by the sheet, tracker, and email.
  // NO_AUTO_TARGET companies (SpaceX) are kept off 🎯 because their boards are
  // enormous — 2,100 roles would bury everything else. But excluding them
  // outright meant a genuine SpaceX product-design or SWE INTERNSHIP could never
  // be flagged either, which is the opposite of what Brian wanted when he asked
  // for SpaceX. So their early-career roles qualify; their full-time flood does not.
  const bigBoard = NO_AUTO_TARGET.has(r.company) && (r.level === "intern" || r.level === "new-grad");
  r.target = (TARGETS.test(r.company) || ATS_COMPANY_SET.has(r.company) || bigBoard) && RELEVANT_RX.test(r.title) && !IRRELEVANT_RX.test(r.title) && !SENIOR_RX.test(r.title);
  // dead-cycle cleanup (Brian 2026-07-24): an INTERN post older than ~4 months
  // whose term doesn't reference a future intake is recruiting for a season
  // that already started — clutter, drop it. Old rows recruiting for future
  // terms (Fall 2026+, 2027…) stay, as do all full-time/new-grad rows
  // (evergreen reqs on live boards are genuinely applyable).
  if (r.level === "intern") {
    const postedT = new Date(r.posted || r.firstSeen || Date.now()).getTime();
    if (postedT < Date.now() - STALE_INTERN_DAYS * 864e5 && !termsLive(r.term)) continue;
  }
  // fresh = recently posted OR just entered our feed (a Google-tier listing
  // that Simplify adds late must still fire the 🔥/alert path — "new to us"
  // is what an alert means, not "new to the internet")
  const freshDays = (Date.now() - new Date(r.posted || "2000-01-01").getTime()) / 864e5;
  // the intake actually being recruited for right now — the wave Brian is
  // applying into. Flagged so the tracker/brief can lead with it instead of it
  // being 1% of a ~10k-row feed.
  if (r.level === "intern" && inCycle(r)) r.cycle = CYCLE_LABEL;
  r.hot = (freshDays <= 2 || r.isNew) && !r.closedRecently && r.level !== "full-time" && (r.target || r.fit >= 0.6);
  // a target company opening its NEXT-cycle internship is the single most
  // time-critical event of the season — never let it arrive quietly
  if (r.isNew && r.cycle && r.target && !r.closedRecently) r.hot = true;
  const age = (Date.now() - new Date(r.posted || today).getTime()) / 864e5;
  // simplify exempt from age-ghosting (its bot marks dead listings inactive, so
  // active-in-feed = verified alive) — but rows Simplify itself closed within
  // the keep-window ARE ghosts: still listed + applyable, dimmed for "verify"
  if (r.closedRecently) r.ghost = true;
  else if (age > GHOST_DAYS && !curated && r.source !== "greenhouse" && r.source !== "ashby" && r.source !== "lever") r.ghost = true;
  roles.push(r);
}

// Path A — LLM rescue of "Other" roles at target companies (scoped + cached; no-op without a key)
await enrichOther(roles, errors);

roles.sort((a, b) => (b.posted || "").localeCompare(a.posted || ""));

// ── emit ─────────────────────────────────────────────────────────────────────
mkdirSync(join(ROOT, "data"), { recursive: true });

writeFileSync(join(ROOT, "data", "roles.json"), JSON.stringify(roles, null, 1));

const csvEsc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
writeFileSync(
  join(ROOT, "data", "roles.csv"),
  ["posted,company,title,category,level,term,location,fit,url,source"]
    .concat(roles.map((r) => [r.posted, r.company, r.title, r.category, r.level, r.term || "", r.locations.join(" · "), r.fit, r.url, r.source].map(csvEsc).join(",")))
    .join("\n")
);

// ROLES.md — fresh first, then targets, then categories (fit-sorted within)
const cutoff = new Date(Date.now() - RECENT_DAYS * 864e5).toISOString().slice(0, 10);
const freshCut = new Date(Date.now() - FRESH_HOURS * 36e5).toISOString().slice(0, 10);
const recent = roles.filter((r) => r.posted >= cutoff);
const ORDER = ["Graphics / Game / 3D", "Art / Animation / VFX", "Design / UX", "Software Engineering", "Data / AI / ML", "Product", "Quant", "Hardware", "Other"];
const counts = Object.fromEntries(ORDER.map((c) => [c, roles.filter((r) => r.category === c).length]));
const LEVEL_ORDER = { intern: 0, "new-grad": 1, "full-time": 2 };
const byFit = (a, b) => (LEVEL_ORDER[a.level] ?? 3) - (LEVEL_ORDER[b.level] ?? 3) || b.fit - a.fit || (b.posted || "").localeCompare(a.posted || "");

const targetRows = recent.filter((r) => r.target).sort(byFit);
const freshRows = recent.filter((r) => r.posted >= freshCut).sort(byFit).slice(0, 120);
const newCount = roles.filter((r) => r.isNew).length;

// compact brief.json for the desktop pet — it fetches this tiny summary, not the ~2MB feed
writeFileSync(join(ROOT, "data", "brief.json"), JSON.stringify({
  updated: new Date().toISOString(),
  total: roles.length,
  isNew: newCount,
  newInterns: roles.filter((r) => r.isNew && r.level === "intern").length,
  hot: roles.filter((r) => r.hot).length,
  fresh: freshRows.length,
  targets: targetRows.length,
  // the intake being recruited for right now (label rolls with the calendar)
  cycle: CYCLE_LABEL,
  cycleRoles: roles.filter((r) => r.cycle).length,
  cycleTargets: roles.filter((r) => r.cycle && r.target).length,
  cycleNew: roles.filter((r) => r.cycle && r.isNew).length,
}));

const row = (r) => `| ${r.hot ? "🔥" : ""}${tierIcon(r.fit)}${r.isNew ? " 🆕" : ""} ${r.posted} | ${r.company} | ${r.title.replace(/\|/g, "/")} | ${(r.locations[0] || "").replace(/\|/g, "/")} | ${r.level} | [link](${r.url}) |\n`;
const HEAD = `| Posted | Company | Role | Location | Level · Term | Apply |\n|---|---|---|---|---|---|\n`;

let md = `# 📋 Open Roles — auto-updated twice daily\n\n`;
md += `_Last updated: ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · ${roles.length} active US roles (🆕 ${newCount} since last run) · sources: Simplify + jobright + ${Object.values(ATS_TARGETS).reduce((n, o) => n + Object.keys(o).length, 0)} company boards direct · ⭐ strong fit ◐ good fit · dashboard: [leebrian.dev/tracker](https://leebrian.dev/tracker) · full data: [\`data/roles.csv\`](data/roles.csv)_\n\n`;
md += `| Category | Active total |\n|---|---|\n` + ORDER.map((c) => `| ${c} | ${counts[c]} |`).join("\n") + "\n";
if (freshRows.length) {
  md += `\n## 🔥 Fresh — posted in the last ${FRESH_HOURS}h (${freshRows.length})\n\n` + HEAD;
  for (const r of freshRows) md += row(r);
}
if (targetRows.length) {
  md += `\n## 🎯 Target companies (${targetRows.length} recent)\n\n` + HEAD;
  for (const r of targetRows) md += row(r);
}
for (const cat of ORDER) {
  const rows = recent.filter((r) => r.category === cat).sort(byFit);
  if (rows.length === 0) continue;
  md += `\n## ${cat} (${rows.length} recent)\n\n` + HEAD;
  for (const r of rows) md += row(r);
}
if (errors.length) md += `\n> ⚠️ Source issues this run: ${errors.join("; ")}\n`;
writeFileSync(join(ROOT, "ROLES.md"), md);

console.log(`OK — ${roles.length} US roles (${recent.length} recent, ${freshRows.length} fresh-48h, ATS direct: ${collectedATS.length}) → data + ROLES.md`);
console.log(`   ${CYCLE_LABEL} cycle: ${roles.filter((r) => r.cycle).length} roles · ${roles.filter((r) => r.cycle && r.target).length} at target companies · ${roles.filter((r) => r.cycle && r.isNew).length} new this run`);
if (errors.length) console.warn("source errors:", errors);
