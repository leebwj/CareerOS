// The Roblox view of the portfolio (/roblox): the same case studies the rest
// of the site renders, in the order and framing for one reader. Kept out of
// projects.ts so the shared data stays audience-neutral.
import type { ImageMetadata } from "astro";
import alephThumb from "../assets/work/aleph-lab.png";

export const ROBLOX_RESUME = "/Brian_Lee_Resume_Roblox.pdf";

export interface RobloxStudy {
  slug: string;
  outcome: string; // what exists at the end, in a recruiter's terms
  blurb: string; // the story in three beats: the problem, what I did, what came out
  thumb?: ImageMetadata; // for an entry whose project has no card image
  role?: string; // for an experience, whose title is the job title
  team?: string; // for an experience, which carries no team field
  line?: string; // replaces the card one-liner where the project's own is engineering-first
}

export const studies: RobloxStudy[] = [
  {
    slug: "dewey",
    outcome: "Working iOS build, in beta with the client",
    blurb: "Dewey came to Penn Spark with a live web MVP, real early users, and one ask: turn it into an iOS app. I led design for a team of eight. We audited the site, kept the client's brand, settled the big calls in grayscale with the developers, and handed off specs they built from. The app now runs on Dewey's backend with the founders and beta testers on it.",
  },
  {
    slug: "wikipedia",
    outcome: "Hi-fi prototype, 5 sections, usability tested",
    blurb: "People scan Wikipedia and Ctrl+F their way through it, but the mobile app assumes they read. Three interviews and a survey became three reader personas and a five-section scope. Four usability sessions then changed four parts of the design before the final prototype, and the page lists each change and why.",
  },
  {
    slug: "path-at-penn",
    outcome: "Hi-fi prototype, 4 surfaces, usability tested",
    blurb: "Students plan their semester in four other apps and come to Path@Penn only to click enroll. Walkthroughs, interviews, and an audit of the live portal turned that into four connected surfaces that follow how students actually plan, tested mid-fi with think-aloud sessions that simplified the navigation and made the enrollment result explicit.",
  },
  {
    slug: "penn-spark-redesign",
    outcome: "Live at pennspark.org",
    blurb: "The club's site did not match the quality of the club's work. I led ten-plus designers and developers from wireframes and a Figma component system to a Next.js rebuild, with content stored as data so the team updates the site without an engineer. It has been live at pennspark.org since December 2025.",
  },
  {
    slug: "capsule",
    outcome: "Working MVP, 6 weeks",
    blurb: "Camera rolls bury the memories that matter most. Our team of eight designed a time capsule that seals photos and messages until a chosen date, then opens them in a 3D gallery. I made the 3D visual language in Blender and Spline and kept the creation flow deliberately quiet so the reveal is the loud part.",
  },
  {
    slug: "aleph-lab",
    outcome: "Redesign live to 100% of users",
    thumb: alephThumb,
    role: "Engineering & design intern",
    team: "Y Combinator startup (F25), remote",
    line: "The app around a set of Roblox-style game modes for children, redesigned end to end and shipped to every user.",
    blurb: "A Y Combinator startup whose game modes for kids were designed to feel like Roblox games. On the design side I shipped an app-wide redesign that landed its information architecture first, so no family had to relearn the app, then rolled a 33-section visual system out in stages. I also built the Figma-to-React-Native pipeline the team hands off through, and wrote the AI character's voice in the interface in English and Korean for a reader who is a child.",
  },
];

export interface Step {
  title: string;
  body: string;
  link: { text: string; slug: string };
}

export const steps: Step[] = [
  {
    title: "Find the problem in what people do",
    body: "Path@Penn started with walkthroughs and interviews, and the finding that mattered was that students did not plan in the portal at all. They planned in four other apps and came back to click enroll.",
    link: { text: "Path@Penn", slug: "path-at-penn" },
  },
  {
    title: "Let research set the scope",
    body: "For Wikipedia, three interviews and a survey became three reader personas and a set of How-Might-We questions. Those fixed the redesign at five sections before any screen was drawn.",
    link: { text: "Wikipedia Redesign", slug: "wikipedia" },
  },
  {
    title: "Decide in lo-fi, with the people who build it",
    body: "On Dewey we drew both versions of the feed, benchmarked where other apps put search, and checked with the developers that a merged book-and-user search was feasible before choosing.",
    link: { text: "Dewey", slug: "dewey" },
  },
  {
    title: "Test, then change the design",
    body: "Four think-aloud sessions on the Wikipedia mid-fi changed four things: section previews, search snippets, the AI Chat framing, and the language toggle. Each change and its reason is on the page.",
    link: { text: "Wikipedia Redesign", slug: "wikipedia" },
  },
  {
    title: "Ship in stages and read the data",
    body: "At Aleph the new information architecture went live to everyone first, the visual system followed at 25, 50, then 100 percent, and segmenting trial data by platform afterwards surfaced a mobile onboarding drop-off nobody had seen.",
    link: { text: "Aleph Lab", slug: "aleph-lab" },
  },
];

export const why: string[] = [
  "This summer at Aleph Lab we built game modes for children inside a sandbox world, with an AI character who plays alongside them. The reference that settled our design arguments was to make it feel like a Roblox game. The app around those modes was mine to redesign, and the people on the other side were children and their parents.",
  "That is where I learned to treat optimism and civility as design constraints rather than policy. The crash recovery and error states are written in warm English and Korean because the reader is a child. The character's fight-refusal fix was a decision about what a kid's afternoon feels like. Shipping the information architecture before the visual system was a decision about not making families relearn something they used every day.",
  "I came to Roblox as a player late. I have played enough to find my way around and I have not opened Studio yet. The fluency I do have is designing for the kids who are already there, and Roblox is where I would like to learn the rest.",
];

// Case-study additions that exist only under /roblox/work: the shared pages
// stay exactly as Brian wrote them. Blocks are inserted after the block whose
// label matches; a missing label appends at the end.
import type { Block, Project } from "./projects";

type PageOverride = { role?: string; tagline?: string; dropLinks?: ("deck" | "figma" | "github" | "video" | "live")[]; relabel?: Record<string, string>; insert?: { after: string; block: Block }[] };

const overrides: Record<string, PageOverride> = {
  dewey: {
    relabel: { "The task": "Problem" },
    insert: [
      { after: "Brand", block: { type: "list", label: "Research", heading: "What we learned before drawing", items: [
        "A web audit of the live MVP, so every existing feature had a place on the phone before anything new was drawn.",
        "A brand review: Margin, Playfair Display, Inter, sage and cream, carried over rather than restyled.",
        "Benchmarks of how Instagram and Spotify structure their home surfaces, used to settle where search lives.",
        "The client's own open questions from their requirements document: whether recommendations should swipe, and whether the brand should change at all.",
      ] } },
      { after: "Lo-fi", block: { type: "list", label: "Decisions", heading: "Each choice, and the reason it won", items: [
        "Search as its own tab, not a bar on the feed: books and users share one search, and the developers confirmed the existing routes could serve it.",
        "Recommendations as a swipe deck, not a scroll: one decision at a time matches Dewey's comparative ranking, and it was the client's own open question.",
        "Four tabs: the web navigation collapsed to what a thumb reaches.",
        "The trending row as a horizontal shelf: the web's trending block recomposed for a phone instead of shrunk to fit.",
        "The brand kept as it was: the client's document asked whether to rebrand, and the answer was no; the identity was theirs, and the app had to read as the same product as the website.",
        "Expo Go instead of TestFlight for the beta: the brief said TestFlight, which needs a paid developer account; Expo Go got the same build onto the founders' phones and the client accepted the change.",
      ] } },
    ],
  },
  wikipedia: { role: "Designer & UX researcher" },
  "path-at-penn": {
    role: "Designer & UX researcher",
    dropLinks: ["deck"], // the deck is not publicly viewable at the time of writing
    insert: [
      { after: "Process", block: { type: "list", label: "Iterations", heading: "What testing changed", items: [
        "Navigation: simplified after the think-aloud sessions with peers doing the three core tasks (find a course, add it, check degree progress).",
        "Registration feedback: the state after enrolling became explicit (succeeded, failed, or waitlisted, and why), because testers could not tell which had happened.",
      ] } },
      { after: "Outcome", block: { type: "prose", label: "Reflection", heading: "The portal was missing structure, not features", body: [
        "Every feature students needed already existed somewhere in Path@Penn. What the research showed was that none of it sat where a student would look for it at the moment they needed it. The redesign's biggest wins came from sequencing and placement, which is a cheaper lesson than adding features and one I now check for first.",
      ] } },
    ],
  },
  "penn-spark-redesign": {
    insert: [
      { after: "Process", block: { type: "list", label: "Decisions", heading: "Each choice, and the reason it won", items: [
        "Figma before code: wireframes settled the structure and hierarchy of five pages with the whole team before anyone wrote a component.",
        "A component system, not page mockups: type, spacing, color tokens, and reusable patterns, so ten-plus people produced one consistent site.",
        "Next.js over Gatsby: faster for a marketing site, and a component model that maps one to one onto the Figma structure.",
        "Content as data: case studies, team members, and events live in data files, so the club updates the site without touching component code.",
        "A case-study section the old site never had: the club's client work was its best argument and was invisible.",
      ] } },
    ],
  },
  "aleph-lab": {
    role: "Engineering & design intern",
    tagline: "Engineering and design at a Y Combinator startup building Annie, an AI character who plays alongside kids while they learn English.",
    insert: [
      { after: "Company", block: { type: "list", label: "Design", heading: "The design half of the summer", items: [
        "Delivered a full rebrand users did not have to relearn: the information architecture shipped first, live to 100% of users, so the layout stayed familiar before the 33-section visual system followed, staged 25, 50, then 100% across real usage cycles",
        "Cut the designer-to-engineer handoff out of the loop with a pipeline that turns Figma designs into React Native components as drawn, packaged so any engineer on the team can run it",
        "Gave the AI character a consistent voice in the interface: her message-bubble system across the home experience, plus a branded crash recovery and shared error states in warm, kid-appropriate English and Korean",
        "Reset onboarding priorities by surfacing a mobile drop-off at roughly half the desktop activation rate in trial data nobody had segmented that way, which redirected where the team looked next",
      ] } },
    ],
  },
};

const labelOf = (b: Block) => ("label" in b && b.label) || "";

export const forRoblox = (p: Project): Project => {
  const o = overrides[p.slug];
  if (!o) return p;
  let blocks = p.blocks.map((b) => {
    const to = o.relabel?.[labelOf(b)];
    return to && "label" in b ? { ...b, label: to } : b;
  });
  for (const { after, block } of o.insert ?? []) {
    const i = blocks.findIndex((b) => labelOf(b) === after);
    blocks = i < 0 ? [...blocks, block] : [...blocks.slice(0, i + 1), block, ...blocks.slice(i + 1)];
  }
  const links = { ...p.links };
  for (const k of o.dropLinks ?? []) delete links[k];
  return { ...p, role: o.role ?? p.role, tagline: o.tagline ?? p.tagline, links, blocks };
};
