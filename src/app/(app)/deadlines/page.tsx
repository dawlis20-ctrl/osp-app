import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { daysUntil, urgencyOf, urgencyStyles, type Urgency } from "@/lib/deadlines";
import { deadlineCategoryLabels } from "@/lib/labels";

const CATEGORY_ORDER = ["SPRZET_MEDYCZNY", "SPRZET_RATOWNICZY", "SPRZET_ODO", "SAMOCHOD"] as const;

type Item = {
  id: string;
  label: string;
  serialNumber: string | null;
  kind: string;
  dueDate: Date;
};

function remainingText(date: Date): string {
  const days = daysUntil(date);
  if (days < 0) return `przeterminowane od ${-days} dni`;
  if (days === 0) return "wygasa dziś";
  if (days === 1) return "zostaje 1 dzień";
  return `zostaje ${days} dni`;
}

// Count of items needing attention (overdue or due within 30 days) and the worst urgency among them.
function attention(items: { dueDate: Date }[]) {
  const needing = items.filter((d) => urgencyOf(d.dueDate) !== "ok");
  const worst: Urgency | null = needing.length
    ? urgencyOf(needing.reduce((a, b) => (a.dueDate <= b.dueDate ? a : b)).dueDate)
    : null;
  return { count: needing.length, worst };
}

function AttentionBadge({ items }: { items: { dueDate: Date }[] }) {
  const { count, worst } = attention(items);
  if (!count || !worst) return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgencyStyles[worst].badge}`}>
      {count} do uwagi
    </span>
  );
}

function Chevron({ level }: { level: "cat" | "veh" }) {
  return (
    <span
      aria-hidden
      className={`text-gray-400 transition-transform ${
        level === "cat" ? "group-open/cat:rotate-90" : "group-open/veh:rotate-90"
      }`}
    >
      ▸
    </span>
  );
}

function ItemRow({ item, extra }: { item: Item; extra?: ReactNode }) {
  const urgency = urgencyOf(item.dueDate);
  const style = urgencyStyles[urgency];
  return (
    <li className="flex items-center justify-between gap-3 py-2 text-sm">
      <div className="flex min-w-0 items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
        <div className="min-w-0">
          <p className="font-medium text-brand-navy">
            {item.label}
            {item.serialNumber && <span className="font-normal text-gray-400"> · {item.serialNumber}</span>}
          </p>
          <p className="text-xs text-gray-500">
            {item.kind}
            {extra}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-medium text-gray-700">{item.dueDate.toLocaleDateString("pl-PL")}</p>
        <p className={`text-xs ${urgency === "ok" ? "text-gray-400" : "font-medium text-red-600"}`}>
          {remainingText(item.dueDate)}
        </p>
      </div>
    </li>
  );
}

export default async function DeadlinesPage() {
  const [deadlines, vehicles] = await Promise.all([
    prisma.deadline.findMany({ orderBy: { dueDate: "asc" } }),
    prisma.vehicle.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const vehicleName = new Map(vehicles.map((v) => [v.id, v.name]));
  const needsAttention = deadlines.filter((d) => urgencyOf(d.dueDate) !== "ok");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">Terminy ważności</h1>
          <p className="text-sm text-gray-500">
            Kliknij kategorię, a potem samochód, żeby zobaczyć listę sprzętu z terminami.
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
        <>
          {needsAttention.length > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h2 className="mb-1 font-semibold text-red-700">
                Wymagają uwagi ({needsAttention.length})
              </h2>
              <p className="mb-2 text-xs text-red-600">
                Przeterminowane lub wygasające w ciągu 30 dni — najpilniejsze na górze.
              </p>
              <ul className="divide-y divide-red-100">
                {needsAttention.map((d) => (
                  <ItemRow
                    key={d.id}
                    item={d}
                    extra={
                      <>
                        {" · "}
                        {deadlineCategoryLabels[d.category]} · {vehicleName.get(d.vehicleId) ?? "—"}
                      </>
                    }
                  />
                ))}
              </ul>
            </section>
          )}

          {CATEGORY_ORDER.map((category) => {
            const categoryItems = deadlines.filter((d) => d.category === category);

            // Vehicles with the most pressing deadlines first; vehicles with nothing at the bottom.
            const vehicleGroups = vehicles
              .map((vehicle) => ({
                vehicle,
                items: categoryItems.filter((d) => d.vehicleId === vehicle.id),
              }))
              .sort((a, b) => {
                const aFirst = a.items[0]?.dueDate.getTime() ?? Infinity;
                const bFirst = b.items[0]?.dueDate.getTime() ?? Infinity;
                return aFirst - bFirst;
              });

            return (
              <details
                key={category}
                className="group/cat rounded-xl border border-border bg-surface open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2 font-semibold text-brand-navy">
                    <Chevron level="cat" />
                    {deadlineCategoryLabels[category]}
                  </span>
                  <span className="flex items-center gap-2">
                    <AttentionBadge items={categoryItems} />
                    <span className="text-xs text-gray-400">{categoryItems.length} poz.</span>
                  </span>
                </summary>

                <div className="flex flex-col gap-2 border-t border-border p-3">
                  {vehicleGroups.map(({ vehicle, items }) => (
                    <details
                      key={vehicle.id}
                      className="group/veh rounded-lg border border-border bg-background"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2 text-sm font-medium text-brand-navy">
                          <Chevron level="veh" />
                          {vehicle.name}
                        </span>
                        <span className="flex items-center gap-2">
                          <AttentionBadge items={items} />
                          <span className="text-xs text-gray-400">{items.length} poz.</span>
                        </span>
                      </summary>
                      <div className="border-t border-border px-3">
                        {items.length === 0 ? (
                          <p className="py-3 text-xs text-gray-400">Brak terminów</p>
                        ) : (
                          <ul className="divide-y divide-border">
                            {items.map((d) => (
                              <ItemRow key={d.id} item={d} />
                            ))}
                          </ul>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            );
          })}
        </>
      )}
    </div>
  );
}
