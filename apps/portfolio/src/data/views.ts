// Role-targeted views of the landing page. Same page, four data-driven
// differences: the headline + status line, the project order, which résumé
// is linked, and the experience order. The URL is the state, so a link can be
// pasted straight into an application: leebrian.dev/graphics for a studio,
// leebrian.dev/design for a design team.
import { projectsOnly, experiences, type Project } from "./projects";

export type ViewId = "all" | "graphics" | "engineering" | "design";

export interface View {
  id: ViewId;
  path: string;
  label: string;        // audience switch label
  h1: string;
  status: string;
  order: string[];      // project slugs, in the order this audience should see them
  featured: string[];   // the ones this audience gets as full cards; the rest become a compact list
  expOrder: string[];   // experience slugs
  resume: string;       // which PDF the header/footer link to
  title: string;        // <title>
  description: string;  // meta description
}

const BASE = "Graphics and software engineer. CS + Design at Penn, BA '27, then the Computer Graphics & Game Technology master's, '28.";

export const views: View[] = [
  {
    id: "all",
    path: "/",
    label: "All",
    h1: "I write shaders, build engines, and design the product on top.",
    status: `${BASE} Looking for Summer 2027 internships in graphics, engine, or product work.`,
    order: ["mini-minecraft", "wikipedia", "passenger", "mini-maya", "dewey", "path-at-penn", "penn-spark-redesign", "art-of-web", "road-rogue", "capsule", "playground"],
    featured: ["mini-minecraft", "wikipedia", "passenger", "mini-maya"],
    expOrder: ["aleph-lab", "bitmango", "penn-spark", "it-farm"],
    resume: "/Brian_Lee_Resume.pdf",
    title: "Brian Wonjun Lee",
    description: "Graphics and software engineer at Penn (CS + Design, then the Computer Graphics & Game Technology master's). Shaders, engines, and product design; looking for Summer 2027 internships.",
  },
  {
    id: "graphics",
    path: "/graphics",
    label: "Graphics & games",
    h1: "I write shaders and build engines.",
    status: `${BASE} Looking for Summer 2027 graphics, rendering, engine, or tech-art internships.`,
    order: ["mini-minecraft", "art-of-web", "passenger", "mini-maya", "road-rogue", "capsule", "playground"],
    featured: ["mini-minecraft", "art-of-web", "passenger", "mini-maya"],
    expOrder: ["bitmango", "aleph-lab", "penn-spark", "it-farm"],
    resume: "/Brian_Lee_Resume_Engineer.pdf",
    title: "Brian Lee · graphics & games",
    description: "Graphics programming and engine work: Unreal shaders, a C++/OpenGL voxel engine, Maya rigs, Three.js. Penn CS + Design, then the CGGT master's.",
  },
  {
    id: "engineering",
    path: "/engineering",
    label: "Software",
    h1: "I build systems end to end, from C++ engines to TypeScript products.",
    status: `${BASE} Looking for Summer 2027 software engineering internships.`,
    order: ["mini-minecraft", "penn-spark-redesign", "passenger", "mini-maya", "art-of-web", "road-rogue", "capsule"],
    featured: ["mini-minecraft", "penn-spark-redesign", "passenger", "mini-maya"],
    expOrder: ["aleph-lab", "bitmango", "it-farm", "penn-spark"],
    resume: "/Brian_Lee_Resume_Engineer.pdf",
    title: "Brian Lee · software",
    description: "Software engineering: a C++ voxel engine, full-stack web apps, a production React Native redesign and an agent SDK at a YC startup.",
  },
  {
    id: "design",
    path: "/design",
    label: "Product design",
    h1: "I design products and then build them.",
    status: `${BASE} Looking for Summer 2027 product design internships.`,
    order: ["dewey", "wikipedia", "path-at-penn", "penn-spark-redesign", "art-of-web", "capsule", "playground"],
    featured: ["dewey", "wikipedia", "path-at-penn", "penn-spark-redesign"],
    expOrder: ["penn-spark", "aleph-lab", "bitmango", "it-farm"],
    resume: "/Brian_Lee_Resume_Design.pdf",
    title: "Brian Lee · product design",
    description: "Product and UX design with the engineering to ship it: a client iOS app led end to end, research-led redesigns, a club site from Figma to Next.js.",
  },
];

export const getView = (id: ViewId): View => views.find((v) => v.id === id)!;

const bySlugs = (pool: Project[], order: string[], appendRest: boolean): Project[] => {
  const out = order.map((s) => pool.find((p) => p.slug === s)).filter(Boolean) as Project[];
  if (appendRest) for (const p of pool) if (!out.includes(p)) out.push(p);
  return out;
};

/** Projects for a view: the ones it lists first, in its order, then everything else (lower in the grid, behind "Show more"). */
export const projectsForView = (id: ViewId): Project[] => bySlugs(projectsOnly, getView(id).order, true);
export const experiencesForView = (id: ViewId): Project[] => bySlugs(experiences, getView(id).expOrder, true);
/** Full cards for this audience, then everything else as a compact list, in view order. */
export const splitForView = (id: ViewId): { featured: Project[]; rest: Project[] } => {
  const all = projectsForView(id);
  const f = new Set(getView(id).featured);
  return { featured: all.filter((p) => f.has(p.slug)), rest: all.filter((p) => !f.has(p.slug)) };
};
