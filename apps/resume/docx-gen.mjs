// Minimal clean .docx generator — purpose-built for one-page résumés.
// Real right-tab stops for dates, bullet numbering, hyperlinks, tight spacing.
// Usage: buildDocx(spec) → writes an extracted package dir; zip it afterwards.
//
// spec = {
//   out: "dir",
//   font: "Calibri", sizePt: { body, name, heading },
//   marginIn: 0.6, pageWidthIn: 8.5,
//   paras: [ ...paragraph descriptors... ]
// }
// paragraph descriptors:
//  { kind:"name",    text }
//  { kind:"contact", runs:[{t,link?}] }                       — centered
//  { kind:"heading", text }                                   — bold caps + bottom rule
//  { kind:"twocol",  left:[{t,b?,i?}], right:[{t,b?,i?}] }    — left runs + right-tab + right runs
//  { kind:"bullet",  runs:[{t,b?,i?,link?}] }
//  { kind:"plain",   runs:[{t,b?,i?,link?}], spaceBefore?, spaceAfter? }
//  { kind:"gap",     pts }                                    — vertical spacer

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildDocx(spec) {
  const F = spec.font || "Calibri";
  const half = (pt) => Math.round(pt * 2); // half-points
  const twip = (inch) => Math.round(inch * 1440);
  const margin = twip(spec.marginIn ?? 0.6);
  const contentWidth = twip(8.5) - margin * 2; // right tab position
  const links = []; // [id, url]
  let linkN = 0;

  const rpr = (o = {}) =>
    `<w:rPr><w:rFonts w:ascii="${F}" w:hAnsi="${F}" w:cs="${F}"/>` +
    (o.b ? '<w:b/><w:bCs/>' : "") +
    (o.i ? '<w:i/><w:iCs/>' : "") +
    (o.link ? '<w:color w:val="1155cc"/><w:u w:val="single"/>' : "") +
    (o.color ? `<w:color w:val="${o.color}"/>` : "") +
    (o.caps ? "<w:smallCaps/>" : "") +
    (o.spacing ? `<w:spacing w:val="${o.spacing}"/>` : "") +
    `<w:sz w:val="${half(o.pt)}"/><w:szCs w:val="${half(o.pt)}"/></w:rPr>`;

  const run = (r, pt) => {
    let inner = `<w:r>${rpr({ ...r, pt: r.pt || pt })}${r.tab ? "<w:tab/>" : ""}<w:t xml:space="preserve">${esc(r.t)}</w:t></w:r>`;
    if (r.link) {
      const id = `rH${++linkN}`;
      links.push([id, r.link]);
      inner = `<w:hyperlink r:id="${id}">${inner}</w:hyperlink>`;
    }
    return inner;
  };

  // paragraph props: spacing in points before/after, tabs, numbering, border
  const ppr = (o = {}) =>
    "<w:pPr>" +
    (o.bullet ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : "") +
    (o.rule ? '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="000000"/></w:pBdr>' : "") +
    (o.rightTab ? `<w:tabs><w:tab w:val="right" w:pos="${contentWidth}"/></w:tabs>` : "") +
    `<w:spacing w:before="${Math.round((o.before ?? 0) * 20)}" w:after="${Math.round((o.after ?? 0) * 20)}" w:line="240" w:lineRule="auto"/>` +
    (o.ind ? `<w:ind w:left="${o.ind}" w:hanging="216"/>` : "") +
    (o.center ? '<w:jc w:val="center"/>' : "") +
    "</w:pPr>";

  const B = spec.sizePt?.body ?? 10.5;
  const bodyParas = spec.paras
    .map((p) => {
      switch (p.kind) {
        case "name":
          return `<w:p>${ppr({ center: true, after: 2 })}${run({ t: p.text, b: true, pt: spec.sizePt?.name ?? 22 }, B)}</w:p>`;
        case "contact":
          return `<w:p>${ppr({ center: true, after: 3 })}${p.runs.map((r) => run(r, spec.sizePt?.contact ?? 9.5)).join("")}</w:p>`;
        case "heading":
          return `<w:p>${ppr({ rule: true, before: p.before ?? 4, after: 2 })}${run({ t: p.text, b: true, caps: true, pt: spec.sizePt?.heading ?? 11, spacing: 6 }, B)}</w:p>`;
        case "twocol":
          return `<w:p>${ppr({ rightTab: true, before: p.before ?? 4, after: 0 })}${p.left.map((r) => run(r, B)).join("")}${run({ ...p.right[0], tab: true }, B)}${p.right.slice(1).map((r) => run(r, B)).join("")}</w:p>`;
        case "bullet":
          return `<w:p>${ppr({ bullet: true, after: 0, ind: 360 })}${p.runs.map((r) => run(r, B)).join("")}</w:p>`;
        case "plain":
          return `<w:p>${ppr({ before: p.before ?? 0, after: p.after ?? 0 })}${p.runs.map((r) => run(r, B)).join("")}</w:p>`;
        case "gap":
          return `<w:p>${ppr({ after: p.pts ?? 2 })}</w:p>`;
      }
    })
    .join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${bodyParas}
<w:sectPr><w:pgSz w:w="${twip(8.5)}" w:h="${twip(11)}"/><w:pgMar w:top="${margin}" w:right="${margin}" w:bottom="${margin}" w:left="${margin}" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>
</w:body></w:document>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rNum" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
${links.map(([id, url]) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${esc(url)}" TargetMode="External"/>`).join("\n")}
</Relationships>`;

  const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="216"/></w:pPr><w:rPr><w:rFonts w:ascii="${F}" w:hAnsi="${F}"/></w:rPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;

  const pkgRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  mkdirSync(join(spec.out, "word", "_rels"), { recursive: true });
  mkdirSync(join(spec.out, "_rels"), { recursive: true });
  writeFileSync(join(spec.out, "[Content_Types].xml"), contentTypes);
  writeFileSync(join(spec.out, "_rels", ".rels"), pkgRels);
  writeFileSync(join(spec.out, "word", "document.xml"), documentXml);
  writeFileSync(join(spec.out, "word", "_rels", "document.xml.rels"), relsXml);
  writeFileSync(join(spec.out, "word", "numbering.xml"), numberingXml);
  return spec.out;
}
