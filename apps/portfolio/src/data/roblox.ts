// The Roblox view of the portfolio (/roblox): the same case studies the rest
// of the site renders, in the order and framing for one reader. Kept out of
// projects.ts so the shared data stays audience-neutral.

import type { ImageMetadata } from "astro";
import alephThumb from "../assets/work/aleph-lab.png";

export const ROBLOX_RESUME = "/Brian_Lee_Resume_Roblox.pdf";

export interface RobloxStudy {
  slug: string;
  outcome: string; // what exists at the end, in a recruiter's terms
  thumb?: ImageMetadata; // for an entry whose project has no card image
  team?: string; // for an experience, which carries no team field
  line?: string; // replaces the card one-liner where the project's own is engineering-first
  blurb?: string; // replaces the card description for the same reason
}

export const studies: RobloxStudy[] = [
  { slug: "dewey", outcome: "Working iOS build, in beta with the client" },
  { slug: "wikipedia", outcome: "Hi-fi prototype, 5 sections, usability tested" },
  { slug: "path-at-penn", outcome: "Hi-fi prototype, 4 surfaces, usability tested" },
  { slug: "penn-spark-redesign", outcome: "Live at pennspark.org" },
  { slug: "capsule", outcome: "Working MVP, 6 weeks" },
  {
    slug: "aleph-lab",
    outcome: "Redesign live to 100% of users",
    thumb: alephThumb,
    team: "Y Combinator startup (F25), remote",
    line: "The app around a set of Roblox-style game modes for children, redesigned end to end and shipped to every user.",
    blurb: "Software engineering intern at a Y Combinator startup whose game modes for kids were designed to feel like Roblox games. On the design side: an app-wide redesign that shipped its information architecture first so nobody had to relearn the app, then a 33-section visual system rolled out in stages; a Figma-to-React-Native pipeline; and the AI character's voice in the interface, written in English and Korean for a reader who is a child.",
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
  "I came to Roblox as a player late. I have played enough to find my way around and I have not opened Studio yet. The fluency I do have is designing for the kids who are already there.",
];
