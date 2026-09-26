import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SidebarLinks, BottomNav } from "@/components/Nav";
import { SignOutButton } from "@/components/SignOutButton";
import { roleLabels } from "@/lib/labels";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden shrink-0 flex-col justify-between bg-brand-navy p-4 md:flex md:w-60">
        <div>
          <div className="mb-6 flex items-center gap-2 px-2 text-white">
            <span className="text-2xl">🚒</span>
            <span className="font-semibold">System OSP</span>
          </div>
          <SidebarLinks isAdmin={isAdmin} />
        </div>
        <div className="border-t border-white/10 px-2 pt-3">
          <p className="text-sm font-medium text-white">{session.user.name}</p>
          <p className="mb-2 text-xs text-white/60">{roleLabels[session.user.role]}</p>
          <SignOutButton />
        </div>
      </aside>

      <header className="flex items-center justify-between bg-brand-navy px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚒</span>
          <span className="font-semibold">System OSP</span>
        </div>
        <SignOutButton />
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl p-4 md:p-8">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}
