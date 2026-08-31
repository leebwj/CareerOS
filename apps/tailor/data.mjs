// Builds the data object lib.js works over from the private resume data.
// education() is a function in resume-data, so both coursework variants are
// precomputed here to keep the serialized form plain JSON.

import { variants, blocks } from "../resume/resume-data.mjs";

const lastHeadingIndex = (paras) => paras.reduce((a, p, i) => (p.kind === "heading" ? i : a), -1);

export function buildData() {
  const skills = {};
  for (const v of Object.keys(variants)) {
    const paras = variants[v].paras;
    const idx = lastHeadingIndex(paras);
    skills[v] = { heading: paras[idx].text, lines: paras.slice(idx + 1) };
  }
  return {
    variants: Object.keys(variants),
    aleph: blocks.ALEPH,
    shared: blocks.SHARED,
    projects: blocks.PROJECTS,
    courses: blocks.COURSES,
    education: { ENG: blocks.education(blocks.COURSES.ENG), DES: blocks.education(blocks.COURSES.DES) },
    nameContact: blocks.NAME_CONTACT,
    sizes: blocks.SIZES,
    skills,
  };
}
