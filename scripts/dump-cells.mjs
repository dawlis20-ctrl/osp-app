import fs from "node:fs";
import PizZip from "pizzip";

const target = process.argv[2];
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
cells.forEach((c, i) => {
  const texts = [...c.xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("¦");
  const isMerge = /<w:vMerge/.test(c.xml);
  console.log(`[${i}]${isMerge ? " (vMerge)" : ""} ${JSON.stringify(texts)}`);
});
console.log("TOTAL CELLS:", cells.length);
