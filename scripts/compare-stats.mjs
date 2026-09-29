import fs from "node:fs";
import PizZip from "pizzip";

function stats(p) {
  const zip = new PizZip(fs.readFileSync(p));
  const xml = zip.file("word/document.xml").asText();
  const runs = (xml.match(/<w:t[^>]*>[^<]*<\/w:t>/g) || []).length;
  const tbl = (xml.match(/<w:tbl>/g) || []).length;
  const tr = (xml.match(/<w:tr[ >]/g) || []).length;
  const tc = (xml.match(/<w:tc>/g) || []).length;
  const sentinel = (xml.match(/\u0000KEEP/g) || []).length;
  const dots = (xml.match(/…/g) || []).length;
  return { runs, tbl, tr, tc, sentinel, dots };
}

console.log("ORIGINAL:", stats(process.argv[2]));
console.log("PREPARED:", stats(process.argv[3]));
