import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";

const SRC = "C:\\Users\\Admin\\Desktop\\OSP\\Do aplkacji\\Meldunek.docx";
const OUT_DIR = path.resolve("src/lib/docx-templates");
const OUT = path.join(OUT_DIR, "meldunek-template.docx");

const zip = new PizZip(fs.readFileSync(SRC));
let xml = zip.file("word/document.xml").asText();

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

// index -> tag name (without braces). Built from a cell-by-cell inspection of
// the original document (scripts/dump-cells-detail.mjs), see the plan notes
// for the section-by-section reasoning.
const TARGETS = {
  3: "data",
  5: "adresZdarzenia", // restart cell, spans 2 rows
  9: "km",
  11: "obiekt",
  13: "rodzajZdarzenia",
  15: "wlasciciel", // restart cell, spans 2 rows (currently pre-filled with "-")
  20: "sposobZadysponowania",
  // czasy operacyjne
  31: "czasZadysponowanie",
  32: "czasWyjazd",
  33: "czasNaMiejscu",
  34: "czasLokalizacjaZagrozenia",
  35: "czasZakonczenieDzialan",
  36: "czasWKoszarach",
  // jednostki OSP/PSP biorące udział (4 sloty x 3 kolumny)
  44: "jedn1Jednostka",
  45: "jedn1Samochod",
  46: "jedn1LiczbaOsob",
  48: "jedn2Jednostka",
  49: "jedn2Samochod",
  50: "jedn2LiczbaOsob",
  52: "jedn3Jednostka",
  53: "jedn3Samochod",
  54: "jedn3LiczbaOsob",
  56: "jedn4Jednostka",
  57: "jedn4Samochod",
  58: "jedn4LiczbaOsob",
  // inne służby (3 sloty x 3 kolumny)
  66: "sluzba1Nazwa",
  67: "sluzba1Pojazdy",
  68: "sluzba1Osoby",
  70: "sluzba2Nazwa",
  71: "sluzba2Pojazdy",
  72: "sluzba2Osoby",
  74: "sluzba3Nazwa",
  75: "sluzba3Pojazdy",
  76: "sluzba3Osoby",
  80: "przyczyna",
  84: "rodzajDzialan",
  90: "sprzetUzyty",
  93: "miejsceDzialan",
  // środki gaśnicze i neutralizujące
  98: "pradowWody",
  101: "zuzytoWody",
  103: "zuzytoSorbentow",
  106: "pradowProszku",
  109: "zuzytoProszku",
  111: "zuzytoNeutralizatorow",
  114: "pradowPiany",
  117: "zuzytoSrPianotworczego",
  // medyczne działania ratownicze — pierwszy poszkodowany (uproszczenie:
  // tabela ma głęboko zagnieżdżone scalenia wierszy dla kolejnych osób,
  // więc wypełniamy tylko pierwszy wiersz, reszta zostaje pusta do ręcznego uzupełnienia)
  130: "ofiara1ImieNazwisko",
  131: "ofiara1Wiek",
  132: "ofiara1Plec",
  133: "ofiara1Dzialania",
  134: "ofiara1Sprzet",
  // wielkość zdarzenia (jeden łączny wiersz, bez podziału Ogółem/Budynki)
  178: "straty",
  179: "uratowano",
  180: "powierzchnia",
  181: "kubatura",
  183: "dlugosc",
  184: "szerokosc",
  185: "wysokosc",
  // kierujący działaniem ratowniczym (uproszczenie: jeden dowódca zmiany)
  // + warunki atmosferyczne
  195: "warunkiAtmosferyczne",
  199: "kierujacyNazwisko",
  200: "kierujacyImie",
  201: "kierujacyOd",
  202: "kierujacyDo",
  204: "kierujacyJednostka",
  213: "opisPrzebiegu",
  222: "przekazanieMiejsca",
  223: "uleglaZniszczeniu",
  229: "dataPrzeslania",
  231: "zglaszajacy",
};

function buildTaggedCell(cellXml, tag) {
  const tcPrMatch = cellXml.match(/<w:tcPr>[\s\S]*?<\/w:tcPr>/);
  const tcPr = tcPrMatch ? tcPrMatch[0] : "";
  const pPrMatch = cellXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const pPr = pPrMatch ? pPrMatch[0] : "";
  return `<w:tc>${tcPr}<w:p>${pPr}<w:r><w:t xml:space="preserve">{${tag}}</w:t></w:r></w:p></w:tc>`;
}

const indices = Object.keys(TARGETS)
  .map(Number)
  .sort((a, b) => b - a); // descending, so earlier offsets stay valid

let cells = splitCells(xml);
if (cells.length !== 234) {
  throw new Error(`Expected 234 <w:tc> cells, found ${cells.length} — source file may have changed.`);
}

for (const idx of indices) {
  const cell = cells[idx];
  const tag = TARGETS[idx];
  const replacement = buildTaggedCell(cell.xml, tag);
  xml = xml.slice(0, cell.start) + replacement + xml.slice(cell.end);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
zip.file("word/document.xml", xml);
const buf = zip.generate({ type: "nodebuffer" });
fs.writeFileSync(OUT, buf);
console.log(`OK — wrote ${OUT} (${indices.length} cells tagged)`);
