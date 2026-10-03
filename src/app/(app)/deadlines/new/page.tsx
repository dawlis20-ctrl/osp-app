import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deadlineCategoryLabels } from "@/lib/labels";
import { CategorySubgroupFields } from "@/components/CategorySubgroupFields";

async function createDeadline(formData: FormData) {
  "use server";

  const category = formData.get("category") as
    | "SPRZET_MEDYCZNY"
    | "SPRZET_RATOWNICZY"
    | "SPRZET_ODO"
    | "SAMOCHOD";
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const kind = String(formData.get("kind") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const reminderEmail = String(formData.get("reminderEmail") ?? "").trim();
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const subgroupRaw = String(formData.get("subgroup") ?? "");
  let label = String(formData.get("label") ?? "").trim();

  if (!vehicleId || !kind || !dueDateRaw || !reminderEmail) return;

  if (!label) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    label = vehicle?.name ?? "";
  }

  await prisma.deadline.create({
    data: {
      category,
      vehicleId,
      label,
      serialNumber: serialNumber || null,
      subgroup: category === "SPRZET_MEDYCZNY" && subgroupRaw === "R1" ? "R1" : null,
      kind,
      dueDate: new Date(dueDateRaw),
      reminderEmail,
    },
  });

  redirect("/deadlines");
}

export default async function NewDeadlinePage() {
  const vehicles = await prisma.vehicle.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  const inputClass =
    "rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Nowy termin ważności</h1>
        <p className="text-sm text-gray-500">
          Przypomnienie e-mail zostanie wysłane miesiąc, dwa tygodnie i tydzień przed terminem.
        </p>
      </div>

      <form action={createDeadline} className="flex max-w-xl flex-col gap-4">
        <CategorySubgroupFields
          categories={Object.entries(deadlineCategoryLabels).map(([value, label]) => ({ value, label }))}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="vehicleId" className="text-sm font-medium text-gray-700">
            Samochód <span className="text-gray-400">(na którym jeździ sprzęt)</span>
          </label>
          <select id="vehicleId" name="vehicleId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              — wybierz —
            </option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="label" className="text-sm font-medium text-gray-700">
            Nazwa pozycji <span className="text-gray-400">(opcjonalnie dla kategorii Samochód)</span>
          </label>
          <input
            id="label"
            name="label"
            placeholder="np. Torba R1, Aparat ODO nr 2, Nosze"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="serialNumber" className="text-sm font-medium text-gray-700">
            Numer seryjny <span className="text-gray-400">(opcjonalnie)</span>
          </label>
          <input
            id="serialNumber"
            name="serialNumber"
            placeholder="np. SN-2024-00123"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="kind" className="text-sm font-medium text-gray-700">
            Rodzaj terminu
          </label>
          <input
            id="kind"
            name="kind"
            required
            placeholder="np. Przegląd techniczny, Legalizacja, Badanie okresowe"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
            Data ważności
          </label>
          <input id="dueDate" name="dueDate" type="date" required className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="reminderEmail" className="text-sm font-medium text-gray-700">
            E-mail odbiorcy przypomnienia
          </label>
          <input
            id="reminderEmail"
            name="reminderEmail"
            type="email"
            required
            defaultValue="naczelnik@osp.local"
            className={inputClass}
          />
        </div>

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            Zapisz termin
          </button>
        </div>
      </form>
    </div>
  );
}
