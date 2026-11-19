// The DoorDash view of the portfolio (/doordash): AI work first, because the
// posting asks for a case study of it, then the other design case studies.
import alephThumb from "../assets/work/aleph-lab.png";
import { applyOverride, type PageOverride, type Step, type Study, type TailoredView } from "./tailored";
import { alephDesign } from "./design";
import { overrides as robloxOverrides, studies as robloxStudies } from "./roblox";
import type { Project } from "./projects";

export const DOORDASH_RESUME = "/Brian_Lee_Resume_DoorDash.pdf";

const shared = (slug: string): Study => robloxStudies.find((s) => s.slug === slug)!;

const aiStudies: Study[] = [
  {
    slug: "aleph-lab",
    outcome: "Redesign live to 100% of users",
    thumb: alephThumb,
    role: "Engineering & design intern",
    team: "Y Combinator startup (F25), remote",
    line: "The app around Annie, an AI character who plays alongside kids, redesigned and rebuilt in React Native.",
    blurb: "Aleph's app was getting a new structure and a new visual system, and families open it every day. Our designer and I worked out a 33-section Figma system, and I built it into the React Native app with Claude Code and the Figma MCP doing most of the typing and me deciding what stayed. The new structure went live to every user first, behind a kill switch I proposed, and the visual system followed. I also gave Annie her voice in the interface: one message at a time on the home screen, and crash and error states a child can read, in English and Korean.",
  },
  {
    slug: "wikipedia",
    outcome: "Hi-fi prototype, 5 sections, usability tested",
    blurb: "People scan Wikipedia, but the mobile app assumes they read. One of my five redesigned sections was an AI Chat tab, a quick-summary layer over the article. All four usability testers expected it to give full answers, so I rewrote its framing as summaries that link back into the article. Testing changed three other sections too, and the case study lists each change and why.",
  },
  {
    slug: "art-of-web",
    outcome: "Live, 8 course projects in one scene",
    role: "Solo designer & developer",
    team: "Solo",
    blurb: "A course portfolio I wanted people to explore, not scroll. I built it as one Three.js scene, with Claude and Codex writing most of the scene, physics, and modal code from my descriptions. My part was how it should feel: hand-set scale for the objects that looked wrong next to the others, a bounce tuned until the drift read as calm, and a last day spent only on the title. It is live as one scene holding eight projects.",
  },
  {
    slug: "road-rogue",
    outcome: "Playable in the browser",
    role: "Solo developer & game designer",
    team: "Solo",
    blurb: "A design course asked how far AI tools could carry an interactive piece. I built a 3D car-chase game with Meshy generating the assets and Codex scaffolding the logic, then found where the tools stopped. They got me to a first playable fast. The driving feel, the part that makes it fun, still came down to tuning by hand.",
  },
];

const designStudies: Study[] = ["dewey", "penn-spark-redesign", "path-at-penn", "capsule"].map(shared);

const steps: Step[] = [
  {
    title: "Find the problem in what people do",
    body: "Path@Penn started with walkthroughs and interviews, and the finding that mattered was that students did not plan in the portal at all. They planned in four other apps and came back to click enroll.",
    link: { text: "Path@Penn", slug: "path-at-penn" },
  },
  {
    title: "Decide in lo-fi, with the people who build it",
    body: "On Dewey we drew both versions of the feed, benchmarked where other apps put search, and checked with the developers that a merged book-and-user search was feasible before choosing.",
    link: { text: "Dewey", slug: "dewey" },
  },
  {
    title: "Prototype in the medium it ships in",
    body: "At Aleph the redesign went from Figma straight into the React Native app. Testing on a real phone changed the system: the light accents measured 1.9:1 and 1.6:1, and the brand green was tried at five strengths before 55% stayed.",
    link: { text: "Aleph Lab", slug: "aleph-lab" },
  },
  {
    title: "Test, then change the design",
    body: "Four think-aloud sessions on the Wikipedia mid-fi changed four things: section previews, search snippets, the AI Chat framing, and the language toggle. Each change and its reason is on the page.",
    link: { text: "Wikipedia Redesign", slug: "wikipedia" },
  },
  {
    title: "Use AI for speed, keep the judgment",
    body: "The tools write most of the code now. What I check is what they decide on their own: stand-in icons in place of the designer's, colors changed that nobody asked to change, a divider a pixel too thick. Those get reverted.",
    link: { text: "Aleph Lab", slug: "aleph-lab" },
  },
];

const why: string[] = [
  "I order from DoorDash regularly, mostly restaurant delivery around campus. What brought me to the design team is what it has been writing. How Designers at DoorDash Are Becoming Builders describes how I worked this summer: I worked out a Figma system with our designer and then built it into the production React Native app myself, instead of handing it off.",
  "Dream Big, Start Small is also how that redesign shipped. The new structure went to every user first, behind a kill switch I proposed, and the visual system came after it. Each release could be turned off on its own, so neither was a bet on the whole redesign at once.",
  "Two Teams, One Shift says that when building is fast, direction becomes the bottleneck. That matched what I saw. The AI tools I used wrote most of the code, and my job was deciding what to keep. The Aleph case study lists the calls I made against the tools, because that part does not show up in a screenshot.",
  "Your evals post asks who gets to decide what is good. My closest experience is small: four readers overruled the wording of my Wikipedia AI Chat because they expected full answers, and they were right. I would like to work on that question at DoorDash's scale.",
];

const overrides: Record<string, PageOverride> = {
  ...robloxOverrides,
  "aleph-lab": alephDesign,
  "art-of-web": {
    insert: [
      { after: "Overview", block: { type: "prose", label: "AI workflow", heading: "Directing the build", body: [
        "I built the scene with Claude and Codex writing most of the Three.js, physics, and modal code from my descriptions, and spent my own time on how it should feel.",
        "Every object is scaled from its bounding box, which made the clock, the tape, and the cube look out of scale next to the rest, so they carry hand-set multipliers. The bounce settled at 0.9 restitution with 0.998 friction per frame, slow enough to read each object as it passes. The last day before submission went to the title alone: a run of changes to its size and to the buttons around it.",
      ] } },
    ],
  },
  "road-rogue": { role: "Solo developer & game designer" },
};

export const forDoorDash = (p: Project): Project => applyOverride(p, overrides[p.slug]);

export const doordashView: TailoredView = {
  base: "/doordash",
  company: "DoorDash",
  description: "Product design portfolio: designing and building the app around an AI character, AI in my own process, and research-led design work.",
  resume: DOORDASH_RESUME,
  heroSub: "Product designer who ships what he designs, in code. CS + Design at Penn, hoping to spend Summer 2027 designing at DoorDash.",
  groups: [
    { kicker: "AI in my work", heading: "Designing with AI, and for it.", studies: aiStudies },
    { kicker: "Design work", heading: "From research to shipped code.", studies: designStudies },
  ],
  steps,
  why: { kicker: "Why DoorDash", heading: "Designers who build.", paras: why },
  contactLine: "I'd like to spend Summer 2027 designing at DoorDash, in San Francisco or New York. Happy to walk through any of this work on a call. The full site, with the graphics and engineering projects, is at leebrian.dev.",
  footLine: "I'd like to spend Summer 2027 designing at DoorDash. Happy to walk through this work on a call.",
  apply: forDoorDash,
};
