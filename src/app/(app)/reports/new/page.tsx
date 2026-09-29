import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { reportTypeLabels, reportPurposeLabels } from "@/lib/labels";

const RATOWNIK_SLOTS = 4;
const RATOWNIK_EXTRA_SLOTS = 3; // tylko dla pierwszego pojazdu (GBA), pozycje 5-7 wg wzoru
const EQUIPMENT_SLOTS = 3;
const OTHER_UNIT_SLOTS = 6;

async function createReport(formData: FormData) {
  "use server";

  const vehicles = await prisma.vehicle.findMany({ where: { active: true } });

  const year = new Date().getFullYear();
  const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
  const yearEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`);
  const countThisYear = await prisma.report.count({
    where: { createdAt: { gte: yearStart, lt: yearEnd } },
  });
  const number = `${countThisYear + 1}/${year}`;

  const crewData: {
    vehicleId: string;
    role: "DOWODCA" | "KIEROWCA" | "RATOWNIK";
    position: number;
    memberId: string;
  }[] = [];

  vehicles.forEach((vehicle, vehicleIndex) => {
    const dowodca = String(formData.get(`crew_${vehicle.id}_DOWODCA_1`) ?? "");
    if (dowodca) crewData.push({ vehicleId: vehicle.id, role: "DOWODCA", position: 1, memberId: dowodca });

    const kierowca = String(formData.get(`crew_${vehicle.id}_KIEROWCA_1`) ?? "");
    if (kierowca) crewData.push({ vehicleId: vehicle.id, role: "KIEROWCA", position: 1, memberId: kierowca });

    const ratownikSlots = vehicleIndex === 0 ? RATOWNIK_SLOTS + RATOWNIK_EXTRA_SLOTS : RATOWNIK_SLOTS;
    for (let i = 1; i <= ratownikSlots; i++) {
      const ratownik = String(formData.get(`crew_${vehicle.id}_RATOWNIK_${i}`) ?? "");
      if (ratownik) crewData.push({ vehicleId: vehicle.id, role: "RATOWNIK", position: i, memberId: ratownik });
    }
  });

  const equipmentData: { name: string; workTime: string; notes: string | null }[] = [];
  for (let i = 1; i <= EQUIPMENT_SLOTS; i++) {
    const name = String(formData.get(`equipment_name_${i}`) ?? "").trim();
    if (!name) continue;
    const workTime = String(formData.get(`equipment_time_${i}`) ?? "").trim();
    const notes = String(formData.get(`equipment_notes_${i}`) ?? "").trim();
    equipmentData.push({ name, workTime, notes: notes || null });
  }

  const otherUnitsData: { name: string }[] = [];
  for (let i = 1; i <= OTHER_UNIT_SLOTS; i++) {
    const name = String(formData.get(`otherUnit_${i}`) ?? "").trim();
    if (name) otherUnitsData.push({ name });
  }

  const report = await prisma.report.create({
    data: {
      number,
      type: formData.get("type") as never,
      date: new Date(String(formData.get("date"))),
      alarmTime: String(formData.get("alarmTime") ?? ""),
      arrivalTime: String(formData.get("arrivalTime") ?? ""),
      departureTime: String(formData.get("departureTime") ?? ""),
      returnTime: String(formData.get("returnTime") ?? ""),
      alarmedBy: String(formData.get("alarmedBy") ?? ""),
      address: String(formData.get("address") ?? ""),
      purpose: formData.get("purpose") as never,
      purposeDescription: String(formData.get("purposeDescription") ?? "") || null,
      kpp: String(formData.get("kpp") ?? "") || null,
      handover: String(formData.get("handover") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
      preparedById: String(formData.get("preparedById") ?? "") || null,
      checkedById: String(formData.get("checkedById") ?? "") || null,
      crew: { create: crewData },
      equipment: { create: equipmentData },
      otherUnits: { create: otherUnitsData },
    },
  });

  redirect(`/reports/${report.id}`);
}

export default async function NewReportPage() {
  const session = await auth();
  const [vehicles, users] = await Promise.all([
    prisma.vehicle.findMany({ where: { active: true } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  const inputClass =
    "rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";
  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Nowy raport z akcji</h1>
        <p className="text-sm text-gray-500">
          Formularz odwzorowuje układ papierowego wzoru — po zapisaniu wygenerujesz gotowy PDF.
        </p>
      </div>

      <form action={createReport} className="flex flex-col gap-4">
        <details open className="rounded-xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold text-brand-navy">Dane podstawowe</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                          <option key={u.id} value={u.id}>
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
                          <option key={u.id} value={u.id}>
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
                            <option key={u.id} value={u.id}>
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
                name="preparedById"
                className={inputClass}
                defaultValue={session?.user?.id ?? ""}
              >
                <option value="">—</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Raport sprawdził (naczelnik)</label>
              <select name="checkedById" className={inputClass} defaultValue="">
                <option value="">—</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            Zapisz raport
          </button>
        </div>
      </form>
    </div>
  );
}
