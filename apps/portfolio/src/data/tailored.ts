// Shared shape of the company views (/roblox, /doordash): the same case
// studies the rest of the site renders, ordered and framed for one reader.
// Case-study additions live in per-view overrides so projects.ts stays
// audience-neutral.
import type { ImageMetadata } from "astro";
import type { Block, Project } from "./projects";

export interface Study {
  slug: string;
  outcome: string; // what exists at the end, in a recruiter's terms
  blurb: string; // the story in three beats: the problem, what I did, what came out
  thumb?: ImageMetadata; // for an entry whose project has no card image
  role?: string; // for an experience, whose title is the job title
  team?: string; // for an experience, which carries no team field
  line?: string; // replaces the card one-liner where the project's own is engineering-first
}

export interface Step {
  title: string;
  body: string;
  link: { text: string; slug: string };
}

export interface StudyGroup {
  kicker: string;
  heading: string;
  studies: Study[];
}

export interface TailoredView {
  base: "/roblox" | "/doordash";
  company: string;
  description: string;
  resume: string;
  heroSub: string;
  groups: StudyGroup[];
  steps: Step[];
  why: { kicker: string; heading: string; paras: string[] };
  contactLine: string; // landing-page CTA
  footLine: string; // case-study CTA
  apply: (p: Project) => Project;
}

export type PageOverride = {
  role?: string;
  tagline?: string;
  dropLinks?: ("deck" | "figma" | "github" | "video" | "live")[];
  relabel?: Record<string, string>;
  drop?: string[]; // block labels to leave out
  metrics?: Project["metrics"];
  insert?: { after: string; block: Block }[];
};

const labelOf = (b: Block) => ("label" in b && b.label) || "";

// blocks are inserted after the block whose label matches; a missing label appends at the end
export const applyOverride = (p: Project, o: PageOverride | undefined): Project => {
  if (!o) return p;
  let blocks = p.blocks.filter((b) => !o.drop?.includes(labelOf(b))).map((b) => {
    const to = o.relabel?.[labelOf(b)];
    return to && "label" in b ? { ...b, label: to } : b;
  });
  for (const { after, block } of o.insert ?? []) {
    const i = blocks.findIndex((b) => labelOf(b) === after);
    blocks = i < 0 ? [...blocks, block] : [...blocks.slice(0, i + 1), block, ...blocks.slice(i + 1)];
  }
  const links = { ...p.links };
  for (const k of o.dropLinks ?? []) delete links[k];
  return { ...p, role: o.role ?? p.role, tagline: o.tagline ?? p.tagline, metrics: o.metrics ?? p.metrics, links, blocks };
};
