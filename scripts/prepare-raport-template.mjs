import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";

const SRC = "C:\\Users\\Admin\\Desktop\\OSP\\Do aplkacji\\Wzór raportu nowego (1).docx";
const OUT_DIR = path.resolve("src/lib/docx-templates");
const OUT = path.join(OUT_DIR, "raport-template.docx");

const zip = new PizZip(fs.readFileSync(SRC));
let xml = zip.file("word/document.xml").asText();

let step = 0;
function repl(fromInner, toInner) {
  step++;
  const from = `<w:t xml:space="preserve">${fromInner}</w:t>`;
  const to = `<w:t xml:space="preserve">${toInner}</w:t>`;
  if (!xml.includes(from)) {
    throw new Error(`Step ${step}: source text not found: ${JSON.stringify(fromInner)}`);
  }
  xml = xml.replace(from, to);
}
// Consumes one occurrence of a (possibly duplicated) blank run WITHOUT changing it —
// needed because several "spare" lines share the exact same ellipsis text as a
// tagged line earlier/later in the document; repl() only ever replaces the *next*
// remaining occurrence, so skipped spares must still be "consumed" in order.
// A literal no-op (replacing X with X) wouldn't actually advance anything, since
// the resulting string is byte-identical and the next repl() would just find the
// same spot again — so we swap in a unique sentinel now and restore it at the end.
const pendingRestores = [];
function keep(inner) {
  const sentinel = `\u0000KEEP${pendingRestores.length}\u0000`;
  repl(inner, sentinel);
  pendingRestores.push({ sentinel, inner });
}
function restoreKept() {
  for (const { sentinel, inner } of pendingRestores) {
    const from = `<w:t xml:space="preserve">${sentinel}</w:t>`;
    const to = `<w:t xml:space="preserve">${inner}</w:t>`;
    if (!xml.includes(from)) throw new Error(`restoreKept: sentinel not found for ${JSON.stringify(inner)}`);
    xml = xml.replace(from, to);
  }
}

// --- Raport nr .../... ---
repl("………", "{numer}");
repl("/", "");
repl("…………", "");

// --- data akcji ---
repl("…………………", "{data}");

// --- godziny linia 1 ---
repl(
  "godz. wyjazdu ……………… godz. powrotu ……………… alarmował……………………………",
  "godz. wyjazdu {godzWyjazdu} godz. powrotu {godzPowrotu} alarmował {alarmowal}"
);

// --- godziny linia 2 (dojazd / odjazd), rozbite na kilka biegów ---
repl("…", "");
repl("…", "{godzDojazdu}");
repl("………… godz. odjazdu ……………", " godz. odjazdu {godzOdjazdu}");
repl("…", "");

// --- adres zgłoszenia ---
repl(
  " .................................................................................................................................",
  " {adres}"
);

// --- cel wyjazdu (MZ / P / AF) ---
repl(":  MZ       P         AF", ":  {mzLabel}       {pLabel}         {afLabel}");
// Ta sama 88-znakowa linia kropek powtarza się w 7 miejscach w całym dokumencie
// (opis celu x2, KPP x2, przekazanie x2, uwagi-druga-linia x1) — trzeba je
// skonsumować w kolejności występowania, zostawiając "rezerwowe" linie bez zmian.
const BLANK_LINE =
  "…………………………………………………………………………………………………………";
repl(BLANK_LINE, "{celOpis}");
keep(BLANK_LINE); // druga linia opisu celu zostaje pusta (rezerwa)

// --- załoga wg pojazdu: Dowódca ---
repl("1………………………… ", "1{crew_1_DOWODCA}");
repl("1………………………… ", "1{crew_2_DOWODCA}");
repl("1………………………… ", "1{crew_3_DOWODCA}");

// --- Kierowca ---
repl("2………………………… ", "2{crew_1_KIEROWCA}");
repl("2………………………… ", "2{crew_2_KIEROWCA}");
repl("2………………………… ", "2{crew_3_KIEROWCA}");

// --- Ratownik 1..4 (wszystkie 3 pojazdy) ---
repl("3………………………… ", "3{crew_1_RATOWNIK_1}");
repl("3………………………… ", "3{crew_2_RATOWNIK_1}");
repl("3………………………… ", "3{crew_3_RATOWNIK_1}");

repl("4………………………… ", "4{crew_1_RATOWNIK_2}");
repl("4………………………… ", "4{crew_2_RATOWNIK_2}");
repl("4………………………… ", "4{crew_3_RATOWNIK_2}");

repl("5………………………… ", "5{crew_1_RATOWNIK_3}");
repl("5………………………… ", "5{crew_2_RATOWNIK_3}");
repl("5………………………… ", "5{crew_3_RATOWNIK_3}");

repl("6………………………… ", "6{crew_1_RATOWNIK_4}");
repl("6………………………… ", "6{crew_2_RATOWNIK_4}");
repl("6………………………… ", "6{crew_3_RATOWNIK_4}");

// --- Ratownik 5..7 (tylko pierwszy pojazd - GBA) ---
repl("7………………………… ", "7{crew_1_RATOWNIK_5}");
repl("8………………………… ", "8{crew_1_RATOWNIK_6}");
repl("9………………………… ", "9{crew_1_RATOWNIK_7}");

// --- praca sprzętu spalinowego (3 wiersze) ---
repl(
  "…………………………………………….     ………….    …………………………………………",
  "{equip1Name}     {equip1Time}    {equip1Notes}"
);
repl(
  "…………………………………………….     ………….    …………………………………………",
  "{equip2Name}     {equip2Time}    {equip2Notes}"
);
repl(
  "…………………………………………….     ………….    …………………………………………",
  "{equip3Name}     {equip3Time}    {equip3Notes}"
);

// --- inne jednostki (6 pozycji w 2 kolumnach) ---
repl(
  "1………………………………………………    4……………………………………………………",
  "1{otherUnit1}    4{otherUnit4}"
);
repl(
  "2………………………………………………    5……………………………………………………",
  "2{otherUnit2}    5{otherUnit5}"
);
repl(
  "3………………………………………………    6……………………………………………………",
  "3{otherUnit3}    6{otherUnit6}"
);

// --- KPP ---
repl(BLANK_LINE, "{kpp}");
keep(BLANK_LINE); // druga linia zostaje pusta

// --- przekazanie miejsca zdarzenia ---
repl(BLANK_LINE, "{przekazanie}");
keep(BLANK_LINE); // druga linia zostaje pusta

// --- uwagi ---
repl(
  "i:   ……………………………………………………………………………………………….",
  "i:   {uwagi}"
);
keep(BLANK_LINE); // druga linia (ten sam wspólny wzorzec kropek) zostaje pusta

// --- podpisy ---
repl(
  "…………………………….                                                                …………………………….",
  "{preparedByName}                                                                {checkedByName}"
);

restoreKept();

fs.mkdirSync(OUT_DIR, { recursive: true });
zip.file("word/document.xml", xml);
const buf = zip.generate({ type: "nodebuffer" });
fs.writeFileSync(OUT, buf);
console.log(`OK — wrote ${OUT} (${step} replacements applied)`);
