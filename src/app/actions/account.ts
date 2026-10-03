"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MIN_PASSWORD = 8;

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) redirect("/profile?pw=wrong");
  if (next.length < MIN_PASSWORD) redirect("/profile?pw=short");
  if (next !== confirm) redirect("/profile?pw=mismatch");

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 10) },
  });
  redirect("/profile?pw=ok");
}

export async function createAccount(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "DRUH");
  const password = String(formData.get("password") ?? "");

  if (!name || !email) redirect("/settings?account=missing");
  if (!["DRUH", "NACZELNIK", "ADMIN"].includes(role)) redirect("/settings?account=missing");
  if (password.length < MIN_PASSWORD) redirect("/settings?account=short");
  if (await prisma.user.findUnique({ where: { email } })) redirect("/settings?account=exists");

  await prisma.user.create({
    data: {
      name,
      email,
      role: role as "DRUH" | "NACZELNIK" | "ADMIN",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  redirect("/settings?account=ok");
}
