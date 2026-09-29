import fs from "node:fs";
import PizZip from "pizzip";

const target = process.argv[2];
const zip = new PizZip(fs.readFileSync(target));
const xml = zip.file("word/document.xml").asText();

const re = /<w:t[^>]*>[^<]*<\/w:t>/g;
let m;
let i = 0;
while ((m = re.exec(xml)) !== null) {
  console.log(`[${i}] ${JSON.stringify(m[0])}`);
  i++;
}
