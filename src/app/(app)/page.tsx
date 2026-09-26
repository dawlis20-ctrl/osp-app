import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { urgencyOf, urgencyStyles } from "@/lib/deadlines";
import { reportTypeLabels } from "@/lib/labels";

export default async function DashboardPage() {
  const [upcomingDeadlines, recentReports] = await Promise.all([
    prisma.deadline.findMany({ orderBy: { dueDate: "asc" }, take: 5 }),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const urgentCount = upcomingDeadlines.filter((d) => {
    const u = urgencyOf(d.dueDate);
    return u === "overdue" || u === "soon";
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Pulpit</h1>
        <p className="text-sm text-gray-500">Najważniejsze informacje jednostki na dziś.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/reports/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          + Nowy raport
        </Link>
        <Link
          href="/deadlines/new"
          className="rounded-lg border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
        >
          + Dodaj termin
        </Link>
      </div>

      {urgentCount > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {urgentCount}{" "}
          {urgentCount === 1 ? "termin wymaga" : "terminów wymaga"} uwagi (przeterminowane lub
          poniżej 7 dni).
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-brand-navy">Najbliższe terminy</h2>
            <Link href="/deadlines" className="text-sm text-brand-red hover:underline">
              zobacz wszystkie
            </Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-gray-500">Brak zapisanych terminów.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingDeadlines.map((d) => {
                const u = urgencyOf(d.dueDate);
                const style = urgencyStyles[u];
                return (
                  <li key={d.id} className="flex items-center gap-3 text-sm">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                    <span className="flex-1 truncate">{d.label}</span>
                    <span className="shrink-0 text-gray-500">
                      {d.dueDate.toLocaleDateString("pl-PL")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-brand-navy">Ostatnie raporty</h2>
            <Link href="/reports" className="text-sm text-brand-red hover:underline">
              zobacz wszystkie
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="text-sm text-gray-500">Brak zapisanych raportów.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentReports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/reports/${r.id}`}
                    className="flex items-center gap-3 text-sm hover:text-brand-red"
                  >
                    <span className="flex-1 truncate">
                      {r.number} — {reportTypeLabels[r.type]}
                    </span>
                    <span className="shrink-0 text-gray-500">
                      {r.date.toLocaleDateString("pl-PL")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
