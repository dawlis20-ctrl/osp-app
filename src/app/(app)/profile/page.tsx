import { auth } from "@/auth";
import { roleLabels } from "@/lib/labels";
import { SignOutButtonSolid } from "@/components/SignOutButtonSolid";
import { changePassword } from "@/app/actions/account";

const passwordMessages: Record<string, { text: string; ok: boolean }> = {
  ok: { text: "Hasło zostało zmienione.", ok: true },
  wrong: { text: "Obecne hasło jest nieprawidłowe.", ok: false },
  short: { text: "Nowe hasło musi mieć co najmniej 8 znaków.", ok: false },
  mismatch: { text: "Nowe hasła nie są takie same.", ok: false },
};

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const session = await auth();
  const query = await searchParams;
  const pw = Array.isArray(query.pw) ? query.pw[0] : query.pw;
  const message = pw ? passwordMessages[pw] : undefined;

  const inputClass =
    "rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Mój profil</h1>
        <p className="text-sm text-gray-500">Twoje dane i ustawienia konta.</p>
      </div>

      <section className="max-w-md rounded-xl border border-border bg-surface p-4">
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Imię i nazwisko</dt>
            <dd className="font-medium text-brand-navy">{session?.user?.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">E-mail</dt>
            <dd className="font-medium text-brand-navy">{session?.user?.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Rola</dt>
            <dd className="font-medium text-brand-navy">
              {session?.user?.role ? roleLabels[session.user.role] : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <SignOutButtonSolid />
        </div>
      </section>

      <section className="max-w-md rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold text-brand-navy">Zmiana hasła</h2>
        {message && (
          <p
            className={`mb-3 rounded-lg px-3 py-2 text-sm ${
              message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}
        <form action={changePassword} className="flex flex-col gap-3">
          <input
            name="current"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Obecne hasło"
            className={inputClass}
          />
          <input
            name="next"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Nowe hasło (min. 8 znaków)"
            className={inputClass}
          />
          <input
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Powtórz nowe hasło"
            className={inputClass}
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            Zmień hasło
          </button>
        </form>
      </section>
    </div>
  );
}
