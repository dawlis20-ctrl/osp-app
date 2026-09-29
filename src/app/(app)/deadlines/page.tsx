import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { urgencyOf, urgencyStyles } from "@/lib/deadlines";
import { deadlineCategoryLabels } from "@/lib/labels";

const CATEGORY_ORDER = ["SPRZET_MEDYCZNY", "SPRZET_RATOWNICZY", "SPRZET_ODO", "SAMOCHOD"] as const;

export default async function DeadlinesPage() {
  const [deadlines, vehicles] = await Promise.all([
    prisma.deadline.findMany({ orderBy: { dueDate: "asc" } }),
    prisma.vehicle.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">Terminy ważności</h1>
          <p className="text-sm text-gray-500">
            Sprzęt medyczny, ratowniczy, ODO i samochody — podzielone wg pojazdu, na którym jeżdżą.
          </p>
        </div>
        <Link
          href="/deadlines/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          + Dodaj termin
        </Link>
      </div>

      {deadlines.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-gray-500">
          Brak zapisanych terminów. Dodaj pierwszy, żeby zacząć dostawać przypomnienia e-mail.
        </p>
      ) : (
        CATEGORY_ORDER.map((category) => {
          const categoryItems = deadlines.filter((d) => d.category === category);

          return (
            <section key={category} className="flex flex-col gap-3">
              <h2 className="font-semibold text-brand-navy">{deadlineCategoryLabels[category]}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {vehicles.map((vehicle) => {
                  const items = categoryItems.filter((d) => d.vehicleId === vehicle.id);
                  return (
                    <div key={vehicle.id} className="rounded-xl border border-border bg-surface p-4">
                      <p className="mb-2 text-sm font-semibold text-brand-navy">{vehicle.name}</p>
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-400">Brak terminów</p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {items.map((d) => {
                            const urgency = urgencyOf(d.dueDate);
                            const style = urgencyStyles[urgency];
                            return (
                              <li key={d.id} className="flex items-start gap-2 text-sm">
                                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-brand-navy">{d.label}</p>
                                  <p className="text-xs text-gray-500">
                                    {d.kind} · {d.dueDate.toLocaleDateString("pl-PL")}
                                  </p>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
