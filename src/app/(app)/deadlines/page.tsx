import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { urgencyOf, urgencyStyles } from "@/lib/deadlines";
import { deadlineTypeLabels } from "@/lib/labels";

export default async function DeadlinesPage() {
  const deadlines = await prisma.deadline.findMany({ orderBy: { dueDate: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">Terminy ważności</h1>
          <p className="text-sm text-gray-500">
            Przeglądy sprzętu i pojazdów oraz badania lekarskie druhów.
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
        <ul className="flex flex-col gap-2">
          {deadlines.map((d) => {
            const urgency = urgencyOf(d.dueDate);
            const style = urgencyStyles[urgency];
            return (
              <li
                key={d.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                  <div>
                    <p className="font-medium text-brand-navy">{d.label}</p>
                    <p className="text-sm text-gray-500">
                      {deadlineTypeLabels[d.type]} · {d.kind}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-5 sm:pl-0">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {d.dueDate.toLocaleDateString("pl-PL")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
