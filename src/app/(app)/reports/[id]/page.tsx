import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { reportTypeLabels, reportPurposeLabels, crewRoleLabels } from "@/lib/labels";
import { renameReport, sendReportEmail } from "@/app/actions/documents";
import { SendEmailCard } from "@/components/SendEmailCard";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReportDetailPage({
  params,
  searchParams,
}: PageProps<"/reports/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const numberTaken = first(query.numberTaken);
  const numberError = first(query.numberError);
  const mailError = first(query.mailError);

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      crew: { include: { vehicle: true, member: true }, orderBy: [{ vehicleId: "asc" }, { position: "asc" }] },
      equipment: true,
      otherUnits: true,
      preparedBy: true,
      checkedBy: true,
      photos: { orderBy: [{ kind: "asc" }, { position: "asc" }] },
    },
  });

  if (!report) notFound();

  const crewByVehicle = new Map<string, typeof report.crew>();
  for (const entry of report.crew) {
    const list = crewByVehicle.get(entry.vehicleId) ?? [];
    list.push(entry);
    crewByVehicle.set(entry.vehicleId, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">Raport nr {report.number}</h1>
          <p className="text-sm text-gray-500">
            {reportTypeLabels[report.type]} · {report.date.toLocaleDateString("pl-PL")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/reports/${report.id}/pdf`}
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            Pobierz PDF
          </a>
          <a
            href={`/reports/${report.id}/docx`}
            className="rounded-lg border border-brand-red px-4 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red/5"
          >
            Pobierz DOCX
          </a>
          <Link
            href="/reports"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Wróć do listy
          </Link>
        </div>
      </div>

      {numberTaken !== undefined && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Numer „{numberTaken}” był już zajęty — raport dostał kolejny wolny numer {report.number}. Możesz go
          zmienić poniżej.
        </p>
      )}
      {first(query.photosFailed) && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Nie wszystkie zdjęcia udało się zapisać — sprawdź poniżej, których brakuje.
        </p>
      )}
      {first(query.numberChanged) && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Zmieniono numer raportu.</p>
      )}
      {numberError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {numberError === "taken" ? "Taki numer raportu już istnieje." : "Numer raportu nie może być pusty."}
        </p>
      )}

      <form
        action={renameReport}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4"
      >
        <input type="hidden" name="id" value={report.id} />
        <div className="flex flex-col gap-1">
          <label htmlFor="number" className="text-sm font-medium text-gray-700">
            Numer raportu
          </label>
          <input
            id="number"
            name="number"
            defaultValue={report.number}
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
        >
          Zmień numer
        </button>
      </form>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold text-brand-navy">Dane podstawowe</h2>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Godz. wyjazdu / dojazdu</dt>
            <dd>{report.alarmTime} / {report.arrivalTime}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Godz. odjazdu / powrotu</dt>
            <dd>{report.departureTime} / {report.returnTime}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Kto alarmował</dt>
            <dd>{report.alarmedBy || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Adres zgłoszenia</dt>
            <dd>{report.address}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Cel wyjazdu</dt>
            <dd>
              {reportPurposeLabels[report.purpose]}
              {report.purposeDescription ? ` — ${report.purposeDescription}` : ""}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold text-brand-navy">Załoga wg pojazdu</h2>
        {crewByVehicle.size === 0 ? (
          <p className="text-sm text-gray-500">Brak przypisanej załogi.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {[...crewByVehicle.entries()].map(([vehicleId, entries]) => (
              <div key={vehicleId}>
                <p className="mb-1 text-sm font-semibold text-brand-navy">
                  {entries[0].vehicle.name} ({entries[0].vehicle.plate})
                </p>
                <ul className="text-sm text-gray-700">
                  {entries.map((e) => (
                    <li key={e.id}>
                      {crewRoleLabels[e.role]}
                      {e.role === "RATOWNIK" ? ` ${e.position}` : ""}: {e.member?.name ?? "—"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {report.equipment.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold text-brand-navy">Praca sprzętu spalinowego</h2>
          <ul className="text-sm text-gray-700">
            {report.equipment.map((e) => (
              <li key={e.id}>
                {e.name} — {e.workTime}
                {e.notes ? ` (${e.notes})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.otherUnits.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold text-brand-navy">Inne jednostki biorące udział</h2>
          <ul className="text-sm text-gray-700">
            {report.otherUnits.map((o) => (
              <li key={o.id}>{o.name}</li>
            ))}
          </ul>
        </section>
      )}

      {(report.kpp || report.handover || report.notes) && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold text-brand-navy">KPP, przekazanie, uwagi</h2>
          <dl className="flex flex-col gap-2 text-sm">
            {report.kpp && (
              <div>
                <dt className="text-gray-500">KPP</dt>
                <dd>{report.kpp}</dd>
              </div>
            )}
            {report.handover && (
              <div>
                <dt className="text-gray-500">Przekazanie miejsca zdarzenia</dt>
                <dd>{report.handover}</dd>
              </div>
            )}
            {report.notes && (
              <div>
                <dt className="text-gray-500">Uwagi</dt>
                <dd>{report.notes}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="rounded-xl border border-border bg-surface p-4 text-sm text-gray-700">
        <p>Raport sporządził: {report.preparedBy?.name ?? "—"}</p>
        <p>Raport sprawdził: {report.checkedBy?.name ?? "—"}</p>
      </section>

      {report.photos.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold text-brand-navy">Zdjęcia</h2>
          {(["POTWIERDZENIE", "INNE"] as const).map((kind) => {
            const list = report.photos.filter((p) => p.kind === kind);
            if (list.length === 0) return null;
            return (
              <div key={kind} className="mb-3 last:mb-0">
                <p className="mb-2 text-sm text-gray-500">
                  {kind === "POTWIERDZENIE" ? "Potwierdzenie udziału w działaniach" : "Pozostałe zdjęcia"}
                </p>
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {list.map((p) => (
                    <li key={p.id}>
                      <a href={`/reports/${report.id}/photos/${p.id}`} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/reports/${report.id}/photos/${p.id}`}
                          alt="Zdjęcie z raportu"
                          className="aspect-square w-full rounded-lg border border-border object-cover"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      <SendEmailCard
        id={report.id}
        action={sendReportEmail}
        sentAt={report.emailSentAt}
        justSent={first(query.sent) === "1"}
        error={mailError}
        what="Raport razem ze zdjęciami"
      />
    </div>
  );
}
