"use client";

import { signOut } from "next-auth/react";

export function SignOutButtonSolid() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-brand-red px-4 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red hover:text-white"
    >
      Wyloguj się
    </button>
  );
}
