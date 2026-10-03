import { SendForm } from "@/components/SendForm";
import { JEDNOSTKA_SLOTS, SLUZBA_SLOTS } from "@/lib/docx/meldunek-data";

export default function NewMeldunekPage() {
  const inputClass =
    "rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";
  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Meldunek</h1>
        <p className="text-sm text-gray-500">
          Wypełnij kartę zdarzenia OSP/PSP i wyślij — meldunek (Word) trafi na e-mail OSP. Nic nie jest zapisywane w aplikacji.
        </p>
      </div>

      <SendForm endpoint="/api/send/meldunek" submitLabel="Wyślij meldunek na e-mail OSP" doneTitle="Meldunek wysłany na e-mail OSP">
        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Dane podstawowe</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Jednostka podająca informację</label>
              <input name="jednostkaZglaszajaca" defaultValue="OSP Skawina II" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Data zdarzenia</label>
              <input type="date" name="data" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelClass}>Adres zdarzenia</label>
              <input name="adresZdarzenia" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Kilometrów od remizy</label>
              <input name="km" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Rodzaj zdarzenia</label>
              <input name="rodzajZdarzenia" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelClass}>Obiekt (dla budynków: piętra/wysokość)</label>
              <input name="obiekt" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelClass}>Właściciel (imię, nazwisko, adres zamieszkania)</label>
              <input name="wlasciciel" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelClass}>Sposób zadysponowania (SKKM / świadkowie)</label>
              <input name="sposobZadysponowania" className={inputClass} />
            </div>
          </div>
        </details>

        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Czasy operacyjne</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Zadysponowanie</label>
              <input type="time" name="czasZadysponowanie" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Wyjazd</label>
              <input type="time" name="czasWyjazd" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Na miejscu</label>
              <input type="time" name="czasNaMiejscu" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Lokalizacja zagrożenia</label>
              <input type="time" name="czasLokalizacjaZagrozenia" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Zakończenie działań</label>
              <input type="time" name="czasZakonczenieDzialan" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>W koszarach</label>
              <input type="time" name="czasWKoszarach" required className={inputClass} />
            </div>
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">
            Jednostki OSP/PSP biorące udział
          </summary>
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: JEDNOSTKA_SLOTS }, (_, i) => i + 1).map((i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <input name={`jedn${i}Jednostka`} placeholder="Jednostka" className={inputClass} />
                <input name={`jedn${i}Samochod`} placeholder="Samochód" className={inputClass} />
                <input name={`jedn${i}LiczbaOsob`} placeholder="Liczba osób" className={inputClass} />
              </div>
            ))}
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Inne służby</summary>
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: SLUZBA_SLOTS }, (_, i) => i + 1).map((i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <input name={`sluzba${i}Nazwa`} placeholder="Nazwa służby" className={inputClass} />
                <input name={`sluzba${i}Pojazdy`} placeholder="Liczba pojazdów" className={inputClass} />
                <input name={`sluzba${i}Osoby`} placeholder="Liczba osób" className={inputClass} />
              </div>
            ))}
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Przebieg działań</summary>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Przypuszczalna przyczyna zdarzenia</label>
              <input name="przyczyna" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Rodzaj prowadzonych działań</label>
              <textarea name="rodzajDzialan" rows={2} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Sprzęt użyty w działaniach</label>
              <input name="sprzetUzyty" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                Miejsce prowadzonych działań (na zewnątrz/wewnątrz, piętro, wysokość)
              </label>
              <input name="miejsceDzialan" className={inputClass} />
            </div>
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">
            Środki gaśnicze i neutralizujące
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Podano prądów wody</label>
              <input name="pradowWody" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Zużyto wody [m³]</label>
              <input name="zuzytoWody" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Zużyto sorbentów [kg]</label>
              <input name="zuzytoSorbentow" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Podano prądów proszku</label>
              <input name="pradowProszku" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Zużyto proszku [kg]</label>
              <input name="zuzytoProszku" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Zużyto neutralizatorów [kg]</label>
              <input name="zuzytoNeutralizatorow" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Podano prądów piany</label>
              <input name="pradowPiany" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Zużyto środka pianotwórczego [dm³]</label>
              <input name="zuzytoSrPianotworczego" inputMode="decimal" className={inputClass} />
            </div>
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">
            Medyczne działania ratownicze
          </summary>
          <p className="mt-2 text-xs text-gray-500">
            Wzór ma miejsce na kilku poszkodowanych — w formularzu obsługujemy pierwszego, dla
            pozostałych zostaw miejsce na karcie do ręcznego uzupełnienia.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="ofiaraImieNazwisko" placeholder="Imię i nazwisko" className={inputClass} />
            <input name="ofiaraWiek" placeholder="Wiek" className={inputClass} />
            <input name="ofiaraPlec" placeholder="Płeć" className={inputClass} />
            <input name="ofiaraDzialania" placeholder="Podjęte działania" className={inputClass} />
            <input name="ofiaraSprzet" placeholder="Użyty sprzęt" className={inputClass} />
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Wielkość zdarzenia</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Szacowane straty ogółem [tys. zł]</label>
              <input name="straty" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>w tym budynki [tys. zł]</label>
              <input name="stratyBudynki" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Uratowano [tys. zł]</label>
              <input name="uratowano" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Powierzchnia [m²]</label>
              <input name="powierzchnia" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Kubatura [m³]</label>
              <input name="kubatura" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Długość [m]</label>
              <input name="dlugosc" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Szerokość [m]</label>
              <input name="szerokosc" inputMode="decimal" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Wysokość [m]</label>
              <input name="wysokosc" inputMode="decimal" className={inputClass} />
            </div>
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">
            Kierujący działaniem ratowniczym i warunki atmosferyczne
          </summary>
          <div className="mt-4 flex flex-col gap-5">
            {[
              { title: "Kierujący 1", prefix: "kierujacy" },
              { title: "Kierujący 2 (jeśli była zmiana)", prefix: "kierujacy2" },
            ].map(({ title, prefix }) => (
              <div key={prefix} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-600">{title}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input name={`${prefix}Nazwisko`} placeholder="Nazwisko" className={inputClass} />
                  <input name={`${prefix}Imie`} placeholder="Imię" className={inputClass} />
                  <input name={`${prefix}Od`} placeholder="Od (godzina, data)" className={inputClass} />
                  <input name={`${prefix}Do`} placeholder="Do (godzina, data)" className={inputClass} />
                  <input name={`${prefix}Jednostka`} placeholder="Jednostka" className={inputClass} />
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Warunki atmosferyczne</label>
              <input name="warunkiAtmosferyczne" className={inputClass} />
            </div>
          </div>
        </details>

        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">
            Opis, przekazanie, zniszczenia
          </summary>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Opis przebiegu działań ratowniczych</label>
              <textarea name="opisPrzebiegu" rows={3} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                Przekazanie miejsca zdarzenia — komu co przekazano / zalecenia
              </label>
              <textarea name="przekazanieMiejsca" rows={2} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Uległo zniszczeniu / spaleniu</label>
              <textarea name="uleglaZniszczeniu" rows={2} className={inputClass} />
            </div>
          </div>
        </details>

        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Stopka</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Data przesłania karty</label>
              <input type="date" name="dataPrzeslania" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Imię i nazwisko, nr tel. przesyłającego kartę</label>
              <input name="zglaszajacy" className={inputClass} />
            </div>
          </div>
        </details>

</SendForm>
    </div>
  );
}
