import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MeldunkiPage() {
  const meldunki = await prisma.meldunek.findMany({ orderBy: { data: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">Meldunki</h1>
          <p className="text-sm text-gray-500">Karty zdarzeń jednostki.</p>
        </div>
        <Link
          href="/meldunki/new"
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          + Nowy meldunek
        </Link>
      </div>

      {meldunki.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-gray-500">
          Brak zapisanych meldunków.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {meldunki.map((m) => (
            <li key={m.id}>
              <Link
                href={`/meldunki/${m.id}`}
                className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 hover:border-brand-red sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-brand-navy">{m.rodzajZdarzenia}</p>
                  <p className="text-sm text-gray-500">{m.adresZdarzenia}</p>
                </div>
                <span className="text-sm text-gray-600">{m.data.toLocaleDateString("pl-PL")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
