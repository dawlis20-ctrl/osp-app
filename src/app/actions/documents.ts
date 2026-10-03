"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendToOsp } from "@/lib/mail";
import { buildReportPdf } from "@/lib/pdf/report-pdf";
import { buildMeldunekPdf } from "@/lib/pdf/meldunek-pdf";
import { isReportNumberTaken } from "@/lib/report-number";

async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Nieznany błąd";
}

export async function renameReport(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const number = String(formData.get("number") ?? "").trim();

  if (!number) redirect(`/reports/${id}?numberError=empty`);
  if (await isReportNumberTaken(number, id)) redirect(`/reports/${id}?numberError=taken`);

  await prisma.report.update({ where: { id }, data: { number } });
  // A changed number means the e-mail that already went out carries the old one.
  await prisma.report.update({ where: { id }, data: { emailSentAt: null } });
  redirect(`/reports/${id}?numberChanged=1`);
}

export async function sendReportEmail(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");

  let failure: string | null = null;
  try {
    const built = await buildReportPdf(id);
    if (!built) redirect("/reports");
    const report = await prisma.report.findUniqueOrThrow({ where: { id } });
    await sendToOsp({
      subject: `Raport nr ${built.number} — ${report.date.toLocaleDateString("pl-PL")} — ${report.address}`,
      text: `W załączniku raport nr ${built.number} z dnia ${report.date.toLocaleDateString("pl-PL")} (${report.address}).\n\nWiadomość wysłana automatycznie z aplikacji OSP.`,
      attachment: { filename: `raport-${built.number.replace(/[\\/]/g, "-")}.pdf`, content: built.pdf },
    });
    await prisma.report.update({ where: { id }, data: { emailSentAt: new Date() } });
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error("Wysyłka raportu nie powiodła się:", error);
    failure = messageOf(error);
  }

  redirect(failure ? `/reports/${id}?mailError=${encodeURIComponent(failure)}` : `/reports/${id}?sent=1`);
}

export async function sendMeldunekEmail(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");

  let failure: string | null = null;
  try {
    const built = await buildMeldunekPdf(id);
    if (!built) redirect("/meldunki");
    const meldunek = await prisma.meldunek.findUniqueOrThrow({ where: { id } });
    await sendToOsp({
      subject: `Meldunek — ${meldunek.data.toLocaleDateString("pl-PL")} — ${meldunek.adresZdarzenia}`,
      text: `W załączniku meldunek ze zdarzenia z dnia ${meldunek.data.toLocaleDateString("pl-PL")} (${meldunek.adresZdarzenia}).\n\nWiadomość wysłana automatycznie z aplikacji OSP.`,
      attachment: { filename: `meldunek-${meldunek.data.toISOString().slice(0, 10)}.pdf`, content: built.pdf },
    });
    await prisma.meldunek.update({ where: { id }, data: { emailSentAt: new Date() } });
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error("Wysyłka meldunku nie powiodła się:", error);
    failure = messageOf(error);
  }

  redirect(failure ? `/meldunki/${id}?mailError=${encodeURIComponent(failure)}` : `/meldunki/${id}?sent=1`);
}

// next/navigation's redirect() works by throwing; don't swallow it in the catch blocks above.
function isRedirect(error: unknown): boolean {
  return typeof error === "object" && error !== null && "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT");
}
