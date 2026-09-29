import fs from "node:fs";
import PizZip from "pizzip";

const target = process.argv[2];
const fromIdx = Number(process.argv[3] ?? 0);
const toIdx = Number(process.argv[4] ?? 20);

const zip = new PizZip(fs.readFileSync(target));
const xml = zip.file("word/document.xml").asText();

function splitCells(x) {
  const cells = [];
  let idx = 0;
  while (true) {
    const start = x.indexOf("<w:tc>", idx);
    if (start === -1) break;
    const end = x.indexOf("</w:tc>", start);
    const endFull = end + "</w:tc>".length;
    cells.push({ start, end: endFull, xml: x.slice(start, endFull) });
    idx = endFull;
  }
  return cells;
}

const cells = splitCells(xml);
for (let i = fromIdx; i <= toIdx && i < cells.length; i++) {
  const tcPrMatch = cells[i].xml.match(/<w:tcPr>[\s\S]*?<\/w:tcPr>/);
  const tcPr = tcPrMatch ? tcPrMatch[0] : "(no tcPr)";
  const gridSpan = tcPr.match(/<w:gridSpan w:val="(\d+)"/);
  const vMerge = tcPr.match(/<w:vMerge(?:\s+w:val="(\w+)")?\s*\/>/);
  const texts = [...cells[i].xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("¦");
  console.log(
    `[${i}] gridSpan=${gridSpan ? gridSpan[1] : "-"} vMerge=${vMerge ? vMerge[1] || "continue" : "-"} text=${JSON.stringify(texts)}`
  );
}
