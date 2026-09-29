import fs from "node:fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const content = fs.readFileSync("src/lib/docx-templates/raport-template.docx", "binary");
const zip = new PizZip(content);
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

doc.render({
  numer: "1/2026",
  data: "25.09.2026",
  godzWyjazdu: "18:05",
  godzPowrotu: "19:55",
  alarmowal: "Jan Kowalski",
  godzDojazdu: "18:12",
  godzOdjazdu: "19:40",
  adres: "ul. Leśna 12, Skawina",
  mzLabel: "MZ",
  pLabel: "[P]",
  afLabel: "AF",
  celOpis: "Pożar stożka siana w stodole",
  crew_1_DOWODCA: "Jan Naczelnik",
  crew_2_DOWODCA: "",
  crew_3_DOWODCA: "",
  crew_1_KIEROWCA: "Adam Kowalski",
  crew_2_KIEROWCA: "",
  crew_3_KIEROWCA: "",
  crew_1_RATOWNIK_1: "Piotr Nowak",
  crew_2_RATOWNIK_1: "",
  crew_3_RATOWNIK_1: "",
  crew_1_RATOWNIK_2: "Marek Wiśniewski",
  crew_2_RATOWNIK_2: "",
  crew_3_RATOWNIK_2: "",
  crew_1_RATOWNIK_3: "",
  crew_2_RATOWNIK_3: "",
  crew_3_RATOWNIK_3: "",
  crew_1_RATOWNIK_4: "",
  crew_2_RATOWNIK_4: "",
  crew_3_RATOWNIK_4: "",
  crew_1_RATOWNIK_5: "",
  crew_1_RATOWNIK_6: "",
  crew_1_RATOWNIK_7: "",
  equip1Name: "Pompa pływająca",
  equip1Time: "45 min",
  equip1Notes: "",
  equip2Name: "",
  equip2Time: "",
  equip2Notes: "",
  equip3Name: "",
  equip3Time: "",
  equip3Notes: "",
  otherUnit1: " PSP Skawina",
  otherUnit2: "",
  otherUnit3: "",
  otherUnit4: "",
  otherUnit5: "",
  otherUnit6: "",
  kpp: "",
  przekazanie: "",
  uwagi: "Brak uwag",
  preparedByName: "Administrator",
  checkedByName: "",
});

const buf = doc.getZip().generate({ type: "nodebuffer" });
fs.writeFileSync("scripts/out-test-raport.docx", buf);
console.log("OK, wrote scripts/out-test-raport.docx", buf.length, "bytes");
