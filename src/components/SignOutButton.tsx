"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-white/80 hover:text-white transition-colors"
    >
      Wyloguj
    </button>
  );
}
