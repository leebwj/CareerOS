// In-memory .docx builder — emits the same OOXML parts as the résumé
// pipeline's generator, packed with a store-only zip so it runs in the
// browser (Word and ATS parsers accept uncompressed packages).

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildDocxBytes(spec) {
  const F = spec.font || "Calibri";
  const half = (pt) => Math.round(pt * 2);
  const twip = (inch) => Math.round(inch * 1440);
  const margin = twip(spec.marginIn ?? 0.6);
  const contentWidth = twip(8.5) - margin * 2;
  const links = [];
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

  const ppr = (o = {}) =>
    "<w:pPr>" +
    (o.bullet ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : "") +
    (o.rule ? '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="000000"/></w:pBdr>' : "") +
    (o.rightTab ? `<w:tabs><w:tab w:val="right" w:pos="${contentWidth}"/></w:tabs>` : "") +
    `<w:spacing w:before="${Math.round((o.before ?? 0) * 20)}" w:after="${Math.round((o.after ?? 0) * 20)}" w:line="214" w:lineRule="auto"/>` +
    (o.ind ? `<w:ind w:left="${o.ind}" w:hanging="216"/>` : "") +
    (o.center ? '<w:jc w:val="center"/>' : "") +
    "</w:pPr>";

  const B = spec.sizePt?.body ?? 10.5;
  const bodyParas = spec.paras
    .map((p) => {
      switch (p.kind) {
        case "name":
          return `<w:p>${ppr({ center: true, after: 1 })}${run({ t: p.text, b: true, pt: spec.sizePt?.name ?? 22 }, B)}</w:p>`;
        case "contact":
          return `<w:p>${ppr({ center: true, after: 2 })}${p.runs.map((r) => run(r, spec.sizePt?.contact ?? 9.5)).join("")}</w:p>`;
        case "heading":
          return `<w:p>${ppr({ rule: true, before: p.before ?? 3, after: 2 })}${run({ t: p.text, b: true, caps: true, pt: spec.sizePt?.heading ?? 11, spacing: 6 }, B)}</w:p>`;
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

  return zipStore([
    ["[Content_Types].xml", contentTypes],
    ["_rels/.rels", pkgRels],
    ["word/document.xml", documentXml],
    ["word/_rels/document.xml.rels", relsXml],
    ["word/numbering.xml", numberingXml],
  ]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function zipStore(entries) {
  const enc = new TextEncoder();
  const u16 = (v) => [v & 255, (v >> 8) & 255];
  const u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const [name, text] of entries) {
    const nameB = enc.encode(name);
    const data = enc.encode(text);
    const crc = crc32(data);
    const head = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(dosTime), ...u16(dosDate),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameB.length), ...u16(0),
    ]);
    central.push(new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(dosTime), ...u16(dosDate),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameB.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(offset),
    ]), nameB);
    chunks.push(head, nameB, data);
    offset += head.length + nameB.length + data.length;
  }
  const centralSize = central.reduce((a, c) => a + c.length, 0);
  const eocd = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length),
    ...u32(centralSize), ...u32(offset), ...u16(0),
  ]);
  const out = new Uint8Array(offset + centralSize + eocd.length);
  let p = 0;
  for (const c of [...chunks, ...central, eocd]) { out.set(c, p); p += c.length; }
  return out;
}
