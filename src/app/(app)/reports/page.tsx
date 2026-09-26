import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { reportTypeLabels, reportPurposeLabels } from "@/lib/labels";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({ orderBy: { date: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">Raporty z akcji</h1>
          <p className="text-sm text-gray-500">Wszystkie zapisane raporty jednostki.</p>
        </div>
        <Link
          href="/reports/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          + Nowy raport
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-gray-500">
          Brak zapisanych raportów.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {reports.map((r) => (
            <li key={r.id}>
              <Link
                href={`/reports/${r.id}`}
                className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 hover:border-brand-red sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-brand-navy">
                    Raport nr {r.number} — {reportTypeLabels[r.type]}
                  </p>
                  <p className="text-sm text-gray-500">
                    {r.address} · {reportPurposeLabels[r.purpose]}
                  </p>
                </div>
                <span className="text-sm text-gray-600">{r.date.toLocaleDateString("pl-PL")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
