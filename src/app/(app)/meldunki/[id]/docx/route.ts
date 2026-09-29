import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderDocxTemplate, DOCX_CONTENT_TYPE } from "@/lib/docx/render";

function n(value: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

function s(value: string | null): string {
  return value ?? "";
}

export async function GET(_request: Request, { params }: RouteContext<"/meldunki/[id]/docx">) {
  const { id } = await params;

  const meldunek = await prisma.meldunek.findUnique({
    where: { id },
    include: {
      jednostki: { orderBy: { position: "asc" } },
      inneSluzby: { orderBy: { position: "asc" } },
    },
  });

  if (!meldunek) {
    return new NextResponse("Nie znaleziono meldunku", { status: 404 });
  }

  const data: Record<string, string> = {
    data: meldunek.data.toLocaleDateString("pl-PL"),
    adresZdarzenia: meldunek.adresZdarzenia,
    km: s(meldunek.km),
    obiekt: s(meldunek.obiekt),
    rodzajZdarzenia: meldunek.rodzajZdarzenia,
    wlasciciel: s(meldunek.wlasciciel),
    sposobZadysponowania: s(meldunek.sposobZadysponowania),

    czasZadysponowanie: meldunek.czasZadysponowanie,
    czasWyjazd: meldunek.czasWyjazd,
    czasNaMiejscu: meldunek.czasNaMiejscu,
    czasLokalizacjaZagrozenia: s(meldunek.czasLokalizacjaZagrozenia),
    czasZakonczenieDzialan: meldunek.czasZakonczenieDzialan,
    czasWKoszarach: meldunek.czasWKoszarach,

    przyczyna: s(meldunek.przyczyna),
    rodzajDzialan: s(meldunek.rodzajDzialan),
    sprzetUzyty: s(meldunek.sprzetUzyty),
    miejsceDzialan: s(meldunek.miejsceDzialan),

    pradowWody: n(meldunek.pradowWody),
    zuzytoWody: n(meldunek.zuzytoWody),
    zuzytoSorbentow: n(meldunek.zuzytoSorbentow),
    pradowProszku: n(meldunek.pradowProszku),
    zuzytoProszku: n(meldunek.zuzytoProszku),
    zuzytoNeutralizatorow: n(meldunek.zuzytoNeutralizatorow),
    pradowPiany: n(meldunek.pradowPiany),
    zuzytoSrPianotworczego: n(meldunek.zuzytoSrPianotworczego),

    ofiara1ImieNazwisko: s(meldunek.ofiaraImieNazwisko),
    ofiara1Wiek: s(meldunek.ofiaraWiek),
    ofiara1Plec: s(meldunek.ofiaraPlec),
    ofiara1Dzialania: s(meldunek.ofiaraDzialania),
    ofiara1Sprzet: s(meldunek.ofiaraSprzet),

    straty: n(meldunek.straty),
    uratowano: n(meldunek.uratowano),
    powierzchnia: n(meldunek.powierzchnia),
    kubatura: n(meldunek.kubatura),
    dlugosc: n(meldunek.dlugosc),
    szerokosc: n(meldunek.szerokosc),
    wysokosc: n(meldunek.wysokosc),

    warunkiAtmosferyczne: s(meldunek.warunkiAtmosferyczne),
    kierujacyNazwisko: s(meldunek.kierujacyNazwisko),
    kierujacyImie: s(meldunek.kierujacyImie),
    kierujacyOd: s(meldunek.kierujacyOd),
    kierujacyDo: s(meldunek.kierujacyDo),
    kierujacyJednostka: s(meldunek.kierujacyJednostka),

    opisPrzebiegu: s(meldunek.opisPrzebiegu),
    przekazanieMiejsca: s(meldunek.przekazanieMiejsca),
    uleglaZniszczeniu: s(meldunek.uleglaZniszczeniu),

    dataPrzeslania: meldunek.dataPrzeslania ? meldunek.dataPrzeslania.toLocaleDateString("pl-PL") : "",
    zglaszajacy: s(meldunek.zglaszajacy),
  };

  for (let i = 1; i <= 4; i++) {
    const j = meldunek.jednostki.find((x) => x.position === i);
    data[`jedn${i}Jednostka`] = j?.jednostka ?? "";
    data[`jedn${i}Samochod`] = j?.samochod ?? "";
    data[`jedn${i}LiczbaOsob`] = j?.liczbaOsob ?? "";
  }

  for (let i = 1; i <= 3; i++) {
    const svc = meldunek.inneSluzby.find((x) => x.position === i);
    data[`sluzba${i}Nazwa`] = svc?.nazwa ?? "";
    data[`sluzba${i}Pojazdy`] = svc?.liczbaPojazdow ?? "";
    data[`sluzba${i}Osoby`] = svc?.liczbaOsob ?? "";
  }

  const buffer = renderDocxTemplate("meldunek-template.docx", data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="meldunek-${meldunek.id}.docx"`,
    },
  });
}
