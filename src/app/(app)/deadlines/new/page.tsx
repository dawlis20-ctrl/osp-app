import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function createDeadline(formData: FormData) {
  "use server";

  const type = formData.get("type") as "EQUIPMENT" | "MEDICAL";
  const label = String(formData.get("label") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const reminderEmail = String(formData.get("reminderEmail") ?? "").trim();
  const subjectUserId = String(formData.get("subjectUserId") ?? "") || null;

  if (!label || !kind || !dueDateRaw || !reminderEmail) return;

  await prisma.deadline.create({
    data: {
      type,
      label,
      kind,
      dueDate: new Date(dueDateRaw),
      reminderEmail,
      subjectUserId: type === "MEDICAL" ? subjectUserId : null,
    },
  });

  redirect("/deadlines");
}

export default async function NewDeadlinePage() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Nowy termin ważności</h1>
        <p className="text-sm text-gray-500">
          Przypomnienie e-mail zostanie wysłane miesiąc, dwa tygodnie i tydzień przed terminem.
        </p>
      </div>

      <form action={createDeadline} className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-sm font-medium text-gray-700">
            Typ terminu
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue="EQUIPMENT"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="EQUIPMENT">Sprzęt / pojazd</option>
            <option value="MEDICAL">Badanie lekarskie druha</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="label" className="text-sm font-medium text-gray-700">
            Nazwa (sprzęt/pojazd albo imię i nazwisko druha)
          </label>
          <input
            id="label"
            name="label"
            required
            placeholder="np. GBA 2,3/16 Mercedes-Benz"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="subjectUserId" className="text-sm font-medium text-gray-700">
            Powiązany druh <span className="text-gray-400">(tylko dla badania lekarskiego)</span>
          </label>
          <select
            id="subjectUserId"
            name="subjectUserId"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="">— brak —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="kind" className="text-sm font-medium text-gray-700">
            Rodzaj terminu
          </label>
          <input
            id="kind"
            name="kind"
            required
            placeholder="np. Przegląd techniczny, Badanie okresowe"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
            Data ważności
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
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
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
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
