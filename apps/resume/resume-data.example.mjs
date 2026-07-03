// Shape of resume-data.mjs (which is gitignored — it holds real contact info).
// Copy this to resume-data.mjs and fill in your content.

const exp = (title, dates, company, loc, bullets) => [
  { kind: "twocol", before: 4, left: [{ t: title, b: true }], right: [{ t: dates }] },
  { kind: "twocol", before: 0, left: [{ t: company, i: true, pt: 10 }], right: [{ t: loc, i: true, pt: 10 }] },
  ...bullets.map((b) => ({ kind: "bullet", runs: [{ t: b }] })),
];

export const variants = {
  Engineer: {
    font: "Calibri",
    sizePt: { body: 10.5, name: 18, heading: 12, contact: 10 },
    marginIn: 0.5,
    paras: [
      { kind: "name", text: "Ada Lovelace" },
      { kind: "contact", runs: [{ t: "City, ST | 555-000-0000 | ada@example.com | " }, { t: "example.dev", link: "https://example.dev/" }] },
      { kind: "heading", text: "Education", before: 4 },
      { kind: "twocol", before: 2, left: [{ t: "University", b: true }], right: [{ t: "City, ST" }] },
      { kind: "heading", text: "Experience" },
      ...exp("Software Engineer Intern", "June 2026 – Present", "Company", "City, ST", ["Did a concrete thing with a real number"]),
      { kind: "heading", text: "Technical Skills" },
      { kind: "plain", runs: [{ t: "Languages: ", b: true }, { t: "TypeScript, C++" }] },
    ],
  },
};
