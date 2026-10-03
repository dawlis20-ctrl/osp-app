import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { reportTypeLabels, reportPurposeLabels } from "@/lib/labels";
import { PhotoPicker } from "@/components/PhotoPicker";
import { SendForm } from "@/components/SendForm";
import { suggestReportNumber } from "@/lib/report-number";
import {
  EQUIPMENT_SLOTS,
  MAX_CONFIRMATION_PHOTOS,
  MAX_OTHER_PHOTOS,
  OTHER_UNIT_SLOTS,
  RATOWNIK_EXTRA_SLOTS,
  RATOWNIK_SLOTS,
} from "@/lib/report-form";

export default async function NewReportPage() {
  const session = await auth();
  const [vehicles, users, suggestedNumber] = await Promise.all([
    prisma.vehicle.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    suggestReportNumber(),
  ]);

  const inputClass =
    "rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";
  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Raport z akcji</h1>
        <p className="text-sm text-gray-500">
          Wypełnij formularz i wyślij — raport (Word) razem ze zdjęciami trafi na e-mail OSP. Nic nie jest zapisywane w aplikacji.
        </p>
      </div>

      <SendForm endpoint="/api/send/report" submitLabel="Wyślij raport na e-mail OSP" doneTitle="Raport wysłany na e-mail OSP">
        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Dane podstawowe</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelClass}>
                Numer raportu <span className="text-gray-400">(możesz zmienić)</span>
              </label>
              <input name="number" defaultValue={suggestedNumber} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Rodzaj wyjazdu</label>
              <select name="type" required defaultValue="AKCJA_RATOWNICZO_GASNICZA" className={inputClass}>
                {Object.entries(reportTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Data</label>
              <input type="date" name="date" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Godz. wyjazdu (alarmu)</label>
              <input type="time" name="alarmTime" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Godz. dojazdu</label>
              <input type="time" name="arrivalTime" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Godz. odjazdu</label>
              <input type="time" name="departureTime" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Godz. powrotu</label>
              <input type="time" name="returnTime" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Kto alarmował</label>
              <input name="alarmedBy" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Adres zgłoszenia</label>
              <input name="address" required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Cel wyjazdu</label>
              <select name="purpose" required defaultValue="P" className={inputClass}>
                {Object.entries(reportPurposeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelClass}>Opis celu wyjazdu</label>
              <textarea name="purposeDescription" rows={2} className={inputClass} />
            </div>
          </div>
        </details>

        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Załoga wg pojazdu</summary>
          <div className="mt-4 flex flex-col gap-6">
            {vehicles.length === 0 && (
              <p className="text-sm text-gray-500">
                Brak pojazdów w bazie — dodaj je w Ustawieniach.
              </p>
            )}
            {vehicles.map((vehicle, vehicleIndex) => {
              const ratownikSlots =
                vehicleIndex === 0 ? RATOWNIK_SLOTS + RATOWNIK_EXTRA_SLOTS : RATOWNIK_SLOTS;
              return (
                <div key={vehicle.id} className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-sm font-semibold text-brand-navy">
                    {vehicle.name} <span className="text-gray-400">({vehicle.plate})</span>
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>Dowódca</label>
                      <select name={`crew_${vehicle.id}_DOWODCA_1`} className={inputClass} defaultValue="">
                        <option value="">—</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={labelClass}>Kierowca</label>
                      <select name={`crew_${vehicle.id}_KIEROWCA_1`} className={inputClass} defaultValue="">
                        <option value="">—</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {Array.from({ length: ratownikSlots }, (_, i) => i + 1).map((i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <label className={labelClass}>Ratownik {i}</label>
                        <select name={`crew_${vehicle.id}_RATOWNIK_${i}`} className={inputClass} defaultValue="">
                          <option value="">—</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Praca sprzętu spalinowego</summary>
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: EQUIPMENT_SLOTS }, (_, i) => i + 1).map((i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[2fr_1fr_2fr]">
                <input name={`equipment_name_${i}`} placeholder="Rodzaj sprzętu" className={inputClass} />
                <input name={`equipment_time_${i}`} placeholder="Czas pracy" className={inputClass} />
                <input name={`equipment_notes_${i}`} placeholder="Uwagi" className={inputClass} />
              </div>
            ))}
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">
            Inne jednostki biorące udział
          </summary>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: OTHER_UNIT_SLOTS }, (_, i) => i + 1).map((i) => (
              <input
                key={i}
                name={`otherUnit_${i}`}
                placeholder="np. PSP Skawina"
                className={inputClass}
              />
            ))}
          </div>
        </details>

        <details className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">
            KPP, przekazanie miejsca zdarzenia, uwagi
          </summary>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                Udzielono kwalifikowanej pierwszej pomocy (imię i nazwisko)
              </label>
              <textarea name="kpp" rows={2} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Przekazanie miejsca zdarzenia (imię i nazwisko)</label>
              <textarea name="handover" rows={2} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Uwagi</label>
              <textarea name="notes" rows={2} className={inputClass} />
            </div>
          </div>
        </details>

        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Podpisy</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Raport sporządził (dowódca)</label>
              <select
                name="preparedBy"
                className={inputClass}
                defaultValue={session?.user?.name ?? ""}
              >
                <option value="">—</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Raport sprawdził (naczelnik)</label>
              <select name="checkedBy" className={inputClass} defaultValue="">
                <option value="">—</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>

        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Zdjęcia</summary>
          <div className="mt-4 flex flex-col gap-6">
            <PhotoPicker
              name="confirmationPhotos"
              max={MAX_CONFIRMATION_PHOTOS}
              title="Potwierdzenie udziału w działaniach"
              hint={`Zdjęcie listy obecności / potwierdzenia (maks. ${MAX_CONFIRMATION_PHOTOS}).`}
            />
            <PhotoPicker
              name="otherPhotos"
              max={MAX_OTHER_PHOTOS}
              title="Pozostałe zdjęcia"
              hint={`Np. powalone drzewa, uszkodzenia (maks. ${MAX_OTHER_PHOTOS}).`}
            />
          </div>
        </details>

</SendForm>
    </div>
  );
}
