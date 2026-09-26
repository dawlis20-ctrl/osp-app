import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma / bcrypt here, so it can run inside middleware.
// The Credentials provider (which touches the database) is added in auth.ts,
// used only from route handlers and server components (Node.js runtime).
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
