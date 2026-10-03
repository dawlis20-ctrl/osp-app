import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sendMeldunekEmail } from "@/app/actions/documents";
import { SendEmailCard } from "@/components/SendEmailCard";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MeldunekDetailPage({
  params,
  searchParams,
}: PageProps<"/meldunki/[id]">) {
  const { id } = await params;
  const query = await searchParams;

  const meldunek = await prisma.meldunek.findUnique({
    where: { id },
    include: {
      jednostki: { orderBy: { position: "asc" } },
      inneSluzby: { orderBy: { position: "asc" } },
    },
  });

  if (!meldunek) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">{meldunek.rodzajZdarzenia}</h1>
          <p className="text-sm text-gray-500">
            {meldunek.adresZdarzenia} · {meldunek.data.toLocaleDateString("pl-PL")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/meldunki/${meldunek.id}/pdf`}
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            Pobierz PDF
          </a>
          <a
            href={`/meldunki/${meldunek.id}/docx`}
            className="rounded-lg border border-brand-red px-4 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red/5"
          >
            Pobierz DOCX
          </a>
          <Link
            href="/meldunki"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Wróć do listy
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold text-brand-navy">Dane podstawowe</h2>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Jednostka podająca informację</dt>
            <dd>{meldunek.jednostkaZglaszajaca}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Km od remizy</dt>
            <dd>{meldunek.km || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Obiekt</dt>
            <dd>{meldunek.obiekt || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Właściciel</dt>
            <dd>{meldunek.wlasciciel || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Sposób zadysponowania</dt>
            <dd>{meldunek.sposobZadysponowania || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold text-brand-navy">Czasy operacyjne</h2>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Zadysponowanie</dt>
            <dd>{meldunek.czasZadysponowanie}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Wyjazd</dt>
            <dd>{meldunek.czasWyjazd}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Na miejscu</dt>
            <dd>{meldunek.czasNaMiejscu}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Lokalizacja zagrożenia</dt>
            <dd>{meldunek.czasLokalizacjaZagrozenia || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Zakończenie działań</dt>
            <dd>{meldunek.czasZakonczenieDzialan}</dd>
          </div>
          <div>
            <dt className="text-gray-500">W koszarach</dt>
            <dd>{meldunek.czasWKoszarach}</dd>
          </div>
        </dl>
      </section>

      {meldunek.jednostki.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold text-brand-navy">Jednostki biorące udział</h2>
          <ul className="text-sm text-gray-700">
            {meldunek.jednostki.map((j) => (
              <li key={j.id}>
                {j.jednostka} — {j.samochod || "—"} ({j.liczbaOsob || "—"} os.)
              </li>
            ))}
          </ul>
        </section>
      )}

      {meldunek.inneSluzby.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold text-brand-navy">Inne służby</h2>
          <ul className="text-sm text-gray-700">
            {meldunek.inneSluzby.map((s) => (
              <li key={s.id}>
                {s.nazwa} — {s.liczbaPojazdow || "—"} poj. ({s.liczbaOsob || "—"} os.)
              </li>
            ))}
          </ul>
        </section>
      )}

      {meldunek.opisPrzebiegu && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-semibold text-brand-navy">Opis przebiegu działań</h2>
          <p className="text-sm text-gray-700">{meldunek.opisPrzebiegu}</p>
        </section>
      )}

      <SendEmailCard
        id={meldunek.id}
        action={sendMeldunekEmail}
        sentAt={meldunek.emailSentAt}
        justSent={first(query.sent) === "1"}
        error={first(query.mailError)}
        what="Meldunek"
      />
    </div>
  );
}
