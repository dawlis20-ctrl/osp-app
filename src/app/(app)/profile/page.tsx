import { auth } from "@/auth";
import { roleLabels } from "@/lib/labels";
import { SignOutButtonSolid } from "@/components/SignOutButtonSolid";

export default async function ProfilePage() {
  const session = await auth();

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
    </div>
  );
}
