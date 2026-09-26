"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Pulpit", icon: "🏠" },
  { href: "/reports", label: "Raporty z akcji", icon: "📄" },
  { href: "/deadlines", label: "Terminy ważności", icon: "⏰" },
  { href: "/profile", label: "Mój profil", icon: "👤" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function SidebarLinks({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const allLinks = isAdmin
    ? [...links, { href: "/settings", label: "Ustawienia", icon: "⚙️" }]
    : links;
  return (
    <nav className="flex flex-col gap-1">
      {allLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive(pathname, link.href)
              ? "bg-white text-brand-navy"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span aria-hidden>{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface md:hidden">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
            isActive(pathname, link.href) ? "text-brand-red font-semibold" : "text-gray-500"
          }`}
        >
          <span aria-hidden className="text-lg leading-none">
            {link.icon}
          </span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
