import { plDate, text } from "@/lib/docx/report-data";

// Form fields whose name is identical to the tag in meldunek-template.docx.
const SAME_NAME_FIELDS = [
  "adresZdarzenia", "km", "obiekt", "rodzajZdarzenia", "wlasciciel", "sposobZadysponowania",
  "czasZadysponowanie", "czasWyjazd", "czasNaMiejscu", "czasLokalizacjaZagrozenia",
  "czasZakonczenieDzialan", "czasWKoszarach",
  "przyczyna", "rodzajDzialan", "sprzetUzyty", "miejsceDzialan",
  "pradowWody", "zuzytoWody", "zuzytoSorbentow", "pradowProszku", "zuzytoProszku",
  "zuzytoNeutralizatorow", "pradowPiany", "zuzytoSrPianotworczego",
  "straty", "stratyBudynki", "uratowano", "powierzchnia", "kubatura", "dlugosc", "szerokosc", "wysokosc",
  "warunkiAtmosferyczne",
  "kierujacyNazwisko", "kierujacyImie", "kierujacyOd", "kierujacyDo", "kierujacyJednostka",
  "kierujacy2Nazwisko", "kierujacy2Imie", "kierujacy2Od", "kierujacy2Do", "kierujacy2Jednostka",
  "opisPrzebiegu", "przekazanieMiejsca", "uleglaZniszczeniu", "zglaszajacy",
] as const;

export const JEDNOSTKA_SLOTS = 4;
export const SLUZBA_SLOTS = 3;

export function buildMeldunekData(form: FormData) {
  const data: Record<string, string> = {};

  for (const field of SAME_NAME_FIELDS) data[field] = text(form, field);

  const eventDate = text(form, "data");
  data.data = plDate(eventDate);
  // The sign-off date cell in the template is narrow, so it gets a two-digit year.
  data.dataPrzeslania = plDate(text(form, "dataPrzeslania"), true);

  data.ofiara1ImieNazwisko = text(form, "ofiaraImieNazwisko");
  data.ofiara1Wiek = text(form, "ofiaraWiek");
  data.ofiara1Plec = text(form, "ofiaraPlec");
  data.ofiara1Dzialania = text(form, "ofiaraDzialania");
  data.ofiara1Sprzet = text(form, "ofiaraSprzet");

  for (let i = 1; i <= JEDNOSTKA_SLOTS; i++) {
    data[`jedn${i}Jednostka`] = text(form, `jedn${i}Jednostka`);
    data[`jedn${i}Samochod`] = text(form, `jedn${i}Samochod`);
    data[`jedn${i}LiczbaOsob`] = text(form, `jedn${i}LiczbaOsob`);
  }

  for (let i = 1; i <= SLUZBA_SLOTS; i++) {
    data[`sluzba${i}Nazwa`] = text(form, `sluzba${i}Nazwa`);
    data[`sluzba${i}Pojazdy`] = text(form, `sluzba${i}Pojazdy`);
    data[`sluzba${i}Osoby`] = text(form, `sluzba${i}Osoby`);
  }

  return { data, dateLabel: plDate(eventDate), address: text(form, "adresZdarzenia") };
}
