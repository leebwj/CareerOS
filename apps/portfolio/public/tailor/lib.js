// Tailoring logic shared by the web page and the local tool. Pure functions
// over a data object (built from the private resume data), so the same code
// runs in the browser and in node.
//
// data = { variants, aleph, shared, projects, courses, education, nameContact,
//          sizes, skills: { [variant]: { heading, lines } } }

export const SYSTEM = `You tailor my job application. You receive a job description and a catalog of my real résumé content: four angles of my most recent internship, four earlier experience entries, eight project blocks (each with its bullets), and the skills lines of five résumé variants.

Your job:
1. Compose the résumé that best fits THIS job by choosing from the catalog only: one base variant, one internship angle, which earlier experience entries to keep (in what order), 2-3 projects (optionally a subset of each project's bullets, reordered), and 4-5 skills lines picked from any variant's set. Choose what aligns; drop what does not. You cannot reword anything, so choose the wording that already fits.
2. Write a cover letter: greeting plus three short paragraphs, 250-340 words total, first person, specific and plain. Ground every claim in the catalog; name the company and role naturally; connect what I have actually done to what the job asks for. No clichés ("passionate", "fast-paced", "excited to apply"), no flattery paragraphs about the company, no invented facts, no numbers that are not in the catalog or the job description.
3. Explain the fit to ME in two sentences (whyFit) — what you emphasized and why.

Everything must stay one page: prefer 3-4 experience entries total and 2-3 projects; drop the least relevant entries rather than keeping everything.

Reply with ONLY a JSON object, no fences, in exactly this shape:
{
  "base": "SWE|Graphics|Game|AI|Design",
  "coursework": "ENG|DES",
  "aleph": "ENG|AI|GAME|DES",
  "experience": ["BITMANGO","PENNSPARK","MILITARY","ITFARM"],
  "projects": [{"id":"MINI_MC","bullets":[0,1]}],
  "skillsHeading": "Technical Skills",
  "skills": [{"variant":"SWE","index":0}],
  "whyFit": "...",
  "cover": {"greeting":"Dear ... team,","paragraphs":["...","...","..."]}
}`;

export const buildUser = ({ jd, company, role, catalogJson }) =>
  `THE JOB\ncompany: ${company || "(not given)"}\nrole: ${role || "(not given)"}\n\nJOB DESCRIPTION:\n${jd}\n\nMY CONTENT CATALOG (choose from this, verbatim blocks only):\n${catalogJson}\n\nCompose the application now. JSON only.`;

const textOf = (runs) => runs.map((r) => r.t).join("");
const entryView = (paras) => ({
  head: textOf(paras[0].left),
  when: textOf(paras[0].right),
  bullets: paras.slice(1).map((p) => textOf(p.runs)),
});

export function catalog(data) {
  const map = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, entryView(v)]));
  return {
    variants: data.variants,
    alephAngles: Object.fromEntries(Object.entries(data.aleph).map(([k, v]) => [k, entryView(v).bullets])),
    experience: map(data.shared),
    projects: map(data.projects),
    skills: Object.fromEntries(data.variants.map((v) => [v, { heading: data.skills[v].heading, lines: data.skills[v].lines.map((p) => textOf(p.runs)) }])),
    coursework: data.courses,
  };
}

// composition → résumé spec: verbatim blocks only, so it cannot lie
export function composeResume(data, c) {
  const errors = [];
  const aleph = data.aleph[c.aleph] || (errors.push(`unknown internship angle "${c.aleph}"`), data.aleph.ENG);
  const eduParas = data.education[c.coursework] || (errors.push(`unknown coursework "${c.coursework}"`), data.education.ENG);
  const seen = new Set();
  const expParas = (Array.isArray(c.experience) ? c.experience : []).flatMap((id) => {
    if (seen.has(id)) return [];
    seen.add(id);
    if (!data.shared[id]) { errors.push(`unknown experience "${id}"`); return []; }
    return data.shared[id];
  });
  const projParas = [];
  for (const p of Array.isArray(c.projects) ? c.projects.slice(0, 4) : []) {
    const B = data.projects[p?.id];
    if (!B) { errors.push(`unknown project "${p?.id}"`); continue; }
    const bullets = B.slice(1);
    const idxs = (Array.isArray(p.bullets) && p.bullets.length ? p.bullets : bullets.map((_, i) => i)).filter((i) => Number.isInteger(i) && bullets[i]);
    projParas.push(B[0], ...idxs.map((i) => bullets[i]));
  }
  if (!projParas.length) errors.push("no valid projects chosen");
  const sLines = (Array.isArray(c.skills) ? c.skills.slice(0, 5) : []).flatMap((s) => {
    const lines = data.skills[s?.variant]?.lines;
    if (!lines || !lines[s.index]) { errors.push(`unknown skills line ${JSON.stringify(s)}`); return []; }
    return [lines[s.index]];
  }).map((p, i) => (i === 0 ? { ...p, before: 2 } : p));
  if (sLines.length < 3) errors.push("fewer than 3 skills lines chosen");
  const spec = {
    font: "Calibri", sizePt: data.sizes, marginIn: 0.45,
    paras: [
      ...data.nameContact,
      ...eduParas,
      { kind: "heading", text: "Experience" },
      ...aleph,
      ...expParas,
      { kind: "heading", text: "Projects" },
      ...projParas,
      { kind: "heading", text: String(c.skillsHeading || "Technical Skills").slice(0, 40) },
      ...sLines,
    ],
  };
  return { spec, errors };
}

// cover letter numbers must come from somewhere real
const digits = (s) => (String(s).match(/\d[\d,.]*/g) || []).map((n) => n.replace(/\D/g, "")).filter(Boolean);
export function coverGuard(data, cover, jd, extra = "") {
  const source = new Set(digits(JSON.stringify(catalog(data)) + " " + jd + " " + extra + " " + new Date().getFullYear()));
  const bad = [];
  for (const p of [cover?.greeting || "", ...(cover?.paragraphs || [])])
    for (const n of digits(p)) if (!source.has(n)) bad.push(n);
  return [...new Set(bad)];
}

export function composeLetter(data, cover) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return {
    font: "Calibri", sizePt: { body: 11, name: 18, heading: 12, contact: 10 }, marginIn: 0.9,
    paras: [
      ...data.nameContact,
      { kind: "gap", pts: 10 },
      { kind: "plain", runs: [{ t: date }] },
      { kind: "plain", runs: [{ t: String(cover.greeting || "Dear Hiring Team,").slice(0, 90) }], before: 10 },
      ...(cover.paragraphs || []).slice(0, 4).map((t) => ({ kind: "plain", runs: [{ t: String(t).slice(0, 1200) }], before: 8 })),
      { kind: "plain", runs: [{ t: "Sincerely," }], before: 12 },
      { kind: "plain", runs: [{ t: "Brian Wonjun Lee", b: true }], before: 2 },
    ],
  };
}
