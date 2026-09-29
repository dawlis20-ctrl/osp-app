import fs from "node:fs";
import PizZip from "pizzip";

const target = process.argv[2];
const zip = new PizZip(fs.readFileSync(target));
const xml = zip.file("word/document.xml").asText();

// crude paragraph split (fine for a document with no nested w:p, which is standard)
const parts = xml.split(/<w:p\b/);
parts.slice(1).forEach((p, i) => {
  const body = p.split("</w:p>")[0];
  const texts = [...body.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("¦");
  if (texts.trim().length > 0 || texts.includes("¦")) {
    console.log(`[P${i}] ${JSON.stringify(texts)}`);
  }
});
