// The Roblox view of the portfolio (/roblox): what the assessment asks for,
// mapped onto the same case studies the rest of the site renders. Kept out of
// projects.ts so the shared data stays audience-neutral.

export const ROBLOX_RESUME = "/Brian_Lee_Resume_Roblox.pdf";

export interface Ledger {
  problem: string;
  research: string;
  decisions: string;
  changed: string; // what testing, the client, or the data changed
  shipped: string;
}

export interface RobloxStudy {
  slug: string;
  line?: string; // replaces the project's card one-liner where that one is engineering-first
  reason: string; // why it is in this portfolio, in one sentence
  ledger: Ledger;
  minutes: number; // reading time of the case study
}

export const studies: RobloxStudy[] = [
  {
    slug: "dewey",
    reason: "Client work that shipped to real users, with me leading the design side of an eight-person team. The closest thing here to a product team.",
    minutes: 6,
    ledger: {
      problem: "A live web MVP had to become an iOS app without losing a feature or the client's brand, and the one new surface (recommendations) had no web version to copy.",
      research: "A web audit of joindewey.com, a brand review, benchmarks of how Instagram and Spotify structure their home surfaces, and the client's own list of open questions.",
      decisions: "Search as its own tab, recommendations as a swipe deck, navigation collapsed to four tabs, the trending row recomposed as a horizontal shelf.",
      changed: "Hi-fis were adjusted weekly against what the developers could build on the existing backend and what the founders asked for after each review.",
      shipped: "A React Native build on Dewey's Supabase backend, distributed through Expo Go, with the founding team and beta testers on it.",
    },
  },
  {
    slug: "wikipedia",
    reason: "The clearest example of testing overruling me: four usability sessions changed four parts of the design before it shipped.",
    minutes: 7,
    ledger: {
      problem: "Readers scan and Ctrl+F, but the mobile app is built for reading an encyclopedia front to back.",
      research: "3 structured interviews across three Penn schools and a survey, synthesized into 3 reader personas and How-Might-We questions that fixed the scope to 5 sections.",
      decisions: "A search-first home, a persistent section strip instead of the buried table of contents, and Article Language split out of Settings.",
      changed: "Section previews, search snippets, the AI Chat reframed as summaries, and the language toggle relabeled, all from 4 think-aloud sessions.",
      shipped: "A hi-fi Figma prototype across Home, Article, Search, Language, and AI Chat, embedded live on the case study.",
    },
  },
  {
    slug: "path-at-penn",
    reason: "A complex workflow, course registration, restructured around how students actually plan a semester.",
    minutes: 6,
    ledger: {
      problem: "Adding one course spans several pages, the result of enrolling is ambiguous, and students plan in four other apps before touching the portal.",
      research: "Observational walkthroughs, informal interviews, and a heuristic audit of the live portal, which surfaced a browse, plan, register, track mental model the portal maps to nowhere.",
      decisions: "Four connected surfaces (Dashboard, Course, Schedule, Degree) that follow that model, with registration feedback moved to the point of action.",
      changed: "Think-aloud sessions on the mid-fi simplified the navigation and made the confirmation state after enrolling explicit.",
      shipped: "A hi-fi Figma prototype of all four surfaces on one shared component system, embedded live on the case study.",
    },
  },
  {
    slug: "aleph-lab",
    line: "The app around a set of Roblox-style game modes for children, redesigned end to end and shipped to every user.",
    reason: "The design half of my summer at a startup building game modes for children inside a sandbox world. The reference the team designed against was Roblox.",
    minutes: 4,
    ledger: {
      problem: "An app-wide rebrand of a product families used every day had to land without anyone having to relearn where things were.",
      research: "Trial data segmented by platform for the first time showed mobile onboarding activating at roughly half the desktop rate, which redirected the team's priorities.",
      decisions: "Information architecture first, live to every user; the 33-section visual system second, staged 25, 50, then 100 percent across real usage cycles.",
      changed: "The character's voice was kept through the redesign: message bubbles, shared error states, and a crash recovery written in warm English and Korean because the reader is a child.",
      shipped: "The redesign reached 100 percent of users, and a Figma-to-React-Native pipeline made handoff a build step any engineer could run.",
    },
  },
];

export const alsoSlugs = ["capsule", "penn-spark-redesign"];

export interface Step {
  title: string;
  body: string;
  evidence: { text: string; slug: string }[];
}

export const steps: Step[] = [
  {
    title: "Start from what people do, not what the brief says",
    body: "The problem statement comes from watching people work. On Path@Penn the finding that mattered was that students did not use the portal to plan at all; they planned elsewhere and came back to click enroll.",
    evidence: [
      { text: "Path@Penn: four pain points from walkthroughs and interviews", slug: "path-at-penn" },
      { text: "Dewey: a web audit before any screen was drawn", slug: "dewey" },
    ],
  },
  {
    title: "Research fixes the scope before Figma opens",
    body: "Interviews and a survey collapse into personas and How-Might-We questions, and those decide what gets designed. Wikipedia ended up as five sections because five documented needs came out of the research, not because five looked like a good number.",
    evidence: [
      { text: "Wikipedia: 3 interviews, a survey, 3 personas, 5 sections", slug: "wikipedia" },
    ],
  },
  {
    title: "Settle arguments in grayscale, with the people who build it",
    body: "Lo-fi is where the expensive disagreements get cheap. On Dewey we drew both versions of the feed, benchmarked how other apps place search, and asked the developers whether a merged book-and-user search was feasible before choosing.",
    evidence: [
      { text: "Dewey: Feed A versus Feed B, the swipe deck over a scroll", slug: "dewey" },
    ],
  },
  {
    title: "Let testing change the design",
    body: "Think-aloud sessions on a mid-fi prototype, and the changes get written down as a list of finding and fix. Wikipedia's home page tested well immediately; the other four changes are on the page, with the reason for each.",
    evidence: [
      { text: "Wikipedia: what four sessions changed", slug: "wikipedia" },
      { text: "Path@Penn: navigation simplified, confirmation made explicit", slug: "path-at-penn" },
    ],
  },
  {
    title: "Ship in stages and read the data afterwards",
    body: "Shipping is not the end of the process. At Aleph the new information architecture went live first so nobody lost their bearings, the visual system followed in stages, and segmenting trial data by platform afterwards surfaced a mobile onboarding drop-off nobody had seen.",
    evidence: [
      { text: "Aleph Lab: IA first, then 25, 50, 100 percent", slug: "aleph-lab" },
      { text: "Dewey: a working build on the client's backend", slug: "dewey" },
    ],
  },
];

export interface Value {
  name: string;
  quote: string; // Roblox's own wording, from about.roblox.com/values
  mine: string;
}

export const values: Value[] = [
  {
    name: "Respect the community",
    quote: "consider our impact on the world",
    mine: "At Aleph the users were children and their parents, so the crash recovery and error states are written in warm English and Korean, and the character's fight-refusal fix was a design decision about what a child's afternoon feels like, not a policy line.",
  },
  {
    name: "Take the long view",
    quote: "setting a long-term vision first, even when making short term decisions",
    mine: "Shipping the information architecture before the visual system meant a slower-looking launch and a redesign nobody had to relearn. On Dewey, keeping the client's brand instead of restyling it left them something they could keep building on after handoff.",
  },
  {
    name: "Get stuff done",
    quote: "relentlessly iterating towards long-term goals",
    mine: "Dewey went from kickoff to a working build in 14 weeks. pennspark.org shipped as a Next.js rebuild the club updates without an engineer. The Aleph redesign reached 100 percent of users in one summer.",
  },
];
