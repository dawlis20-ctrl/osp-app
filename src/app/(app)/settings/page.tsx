import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleLabels } from "@/lib/labels";
import { createAccount } from "@/app/actions/account";

async function createVehicle(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();
  if (!name || !plate) return;

  await prisma.vehicle.create({ data: { name, label: label || name, plate } });
}

const accountMessages: Record<string, { text: string; ok: boolean }> = {
  ok: { text: "Konto zostało dodane.", ok: true },
  missing: { text: "Uzupełnij imię i nazwisko oraz e-mail.", ok: false },
  short: { text: "Hasło startowe musi mieć co najmniej 8 znaków.", ok: false },
  exists: { text: "Konto z takim adresem e-mail już istnieje.", ok: false },
};

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }
  const query = await searchParams;
  const accountKey = Array.isArray(query.account) ? query.account[0] : query.account;
  const accountMessage = accountKey ? accountMessages[accountKey] : undefined;

  const [vehicles, users] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  const inputClass =
    "rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-navy">Ustawienia</h1>
        <p className="text-sm text-gray-500">
          Listy pojazdów i druhów używane w formularzach — widoczne tylko dla administratora.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold text-brand-navy">Pojazdy jednostki</h2>
        <ul className="mb-4 flex flex-col gap-1 text-sm">
          {vehicles.map((v) => (
            <li key={v.id} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{v.name}</span>
              <span className="text-gray-500">{v.plate}</span>
            </li>
          ))}
          {vehicles.length === 0 && <li className="text-gray-500">Brak pojazdów.</li>}
        </ul>
        <form action={createVehicle} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <input name="name" placeholder="Nazwa (np. GBA 2,3/16 Mercedes-Benz)" required className={inputClass} />
          <input name="label" placeholder="Skrót (np. GBA)" className={inputClass} />
          <input name="plate" placeholder="Nr rejestracyjny" required className={inputClass} />
          <button
            type="submit"
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            Dodaj
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold text-brand-navy">Druhowie i konta</h2>
        {accountMessage && (
          <p
            className={`mb-3 rounded-lg px-3 py-2 text-sm ${
              accountMessage.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {accountMessage.text}
          </p>
        )}
        <form action={createAccount} className="mb-4 grid gap-2 sm:grid-cols-2">
          <input name="name" placeholder="Imię i nazwisko" required className={inputClass} />
          <input name="email" type="email" placeholder="E-mail (login)" required className={inputClass} />
          <select name="role" defaultValue="DRUH" className={inputClass}>
            <option value="DRUH">Druh</option>
            <option value="NACZELNIK">Naczelnik / zarząd</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <input
            name="password"
            type="password"
            minLength={8}
            placeholder="Hasło startowe (min. 8 znaków)"
            required
            autoComplete="new-password"
            className={inputClass}
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark sm:col-span-2 sm:justify-self-start"
          >
            Dodaj konto
          </button>
        </form>
        <ul className="flex flex-col gap-1 text-sm">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{u.name}</span>
              <span className="text-gray-500">
                {u.email} · {roleLabels[u.role]}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
