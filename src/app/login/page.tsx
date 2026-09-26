import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

async function authenticate(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-red text-2xl text-white">
            🚒
          </div>
          <h1 className="text-lg font-semibold text-brand-navy">System OSP</h1>
          <p className="text-sm text-gray-500">Zaloguj się, aby kontynuować</p>
        </div>

        <form action={authenticate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              placeholder="naczelnik@osp.local"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Hasło
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              placeholder="••••••••"
            />
          </div>

          {hasError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Nieprawidłowy e-mail lub hasło.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
          >
            Zaloguj się
          </button>
        </form>
      </div>
    </main>
  );
}
