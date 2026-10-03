import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderDocxTemplate, DOCX_CONTENT_TYPE } from "@/lib/docx/render";
import { buildReportData } from "@/lib/docx/report-data";
import { sendToOsp, type MailAttachment } from "@/lib/mail";
import { MAX_CONFIRMATION_PHOTOS, MAX_OTHER_PHOTOS, filesFrom, processPhoto } from "@/lib/photos";
import { rememberReportNumber } from "@/lib/report-number";

export const runtime = "nodejs";

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Sesja wygasła — zaloguj się ponownie.", 401);

  try {
    const form = await request.formData();
    const vehicles = await prisma.vehicle.findMany({ where: { active: true }, orderBy: { name: "asc" } });
    const { data, number, dateLabel, address } = buildReportData(form, vehicles);

    if (!number) return fail("Podaj numer raportu.", 400);

    const attachments: MailAttachment[] = [
      {
        filename: `raport-${number.replace(/[\\/]/g, "-")}.docx`,
        content: renderDocxTemplate("raport-template.docx", data),
        contentType: DOCX_CONTENT_TYPE,
      },
    ];

    const groups = [
      { prefix: "potwierdzenie-udzialu", files: filesFrom(form, "confirmationPhotos", MAX_CONFIRMATION_PHOTOS) },
      { prefix: "zdjecie", files: filesFrom(form, "otherPhotos", MAX_OTHER_PHOTOS) },
    ];
    for (const { prefix, files } of groups) {
      for (const [index, file] of files.entries()) {
        attachments.push({
          filename: `${prefix}-${index + 1}.jpg`,
          content: await processPhoto(file),
          contentType: "image/jpeg",
        });
      }
    }

    const photoCount = attachments.length - 1;
    await sendToOsp({
      subject: `Raport nr ${number} — ${dateLabel} — ${address}`,
      text:
        `W załączniku raport nr ${number} z dnia ${dateLabel} (${address}).\n` +
        (photoCount > 0 ? `Zdjęcia: ${photoCount} (osobne załączniki).\n` : "") +
        `\nWiadomość wysłana automatycznie z aplikacji OSP przez ${session.user.name}.`,
      attachments,
    });

    await rememberReportNumber(number);

    return NextResponse.json({
      ok: true,
      message: `Raport nr ${number} wysłano razem z ${photoCount} zdjęciami.`,
    });
  } catch (error) {
    console.error("Wysyłka raportu nie powiodła się:", error);
    return fail(error instanceof Error ? error.message : "Nieznany błąd.", 500);
  }
}
