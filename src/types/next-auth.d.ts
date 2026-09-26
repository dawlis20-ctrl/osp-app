import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "DRUH" | "NACZELNIK" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "DRUH" | "NACZELNIK" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "DRUH" | "NACZELNIK" | "ADMIN";
  }
}
