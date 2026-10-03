import { isMailConfigured } from "@/lib/mail";

export function SendEmailCard({
  id,
  action,
  sentAt,
  justSent,
  error,
  what,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  sentAt: Date | null;
  justSent: boolean;
  error?: string;
  what: string;
}) {
  const configured = isMailConfigured();

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-1 font-semibold text-brand-navy">Wyślij na e-mail OSP</h2>
      <p className="mb-3 text-sm text-gray-500">
        {what} jako jeden plik PDF zostanie wysłany na adres jednostki.
      </p>

      {justSent && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Wysłano. Wiadomość jest już w drodze na e-mail OSP.
        </p>
      )}
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Nie wysłano: {error}</p>}
      {!configured && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Poczta nie jest jeszcze skonfigurowana na serwerze (ustawienia SMTP_* i OSP_EMAIL_TO w pliku .env).
        </p>
      )}

      <form action={action} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {sentAt ? "Wyślij ponownie" : "Wyślij na e-mail OSP"}
        </button>
        <span className="text-sm text-gray-500">
          {sentAt ? `Ostatnio wysłano: ${sentAt.toLocaleString("pl-PL")}` : "Jeszcze nie wysłano"}
        </span>
      </form>
    </section>
  );
}
