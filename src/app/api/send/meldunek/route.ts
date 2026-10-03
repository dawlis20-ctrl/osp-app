import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderDocxTemplate, DOCX_CONTENT_TYPE } from "@/lib/docx/render";
import { buildMeldunekData } from "@/lib/docx/meldunek-data";
import { sendToOsp } from "@/lib/mail";

export const runtime = "nodejs";

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Sesja wygasła — zaloguj się ponownie.", 401);

  try {
    const form = await request.formData();
    const { data, dateLabel, address } = buildMeldunekData(form);

    await sendToOsp({
      subject: `Meldunek — ${dateLabel} — ${address}`,
      text: `W załączniku meldunek ze zdarzenia z dnia ${dateLabel} (${address}).\n\nWiadomość wysłana automatycznie z aplikacji OSP przez ${session.user.name}.`,
      attachments: [
        {
          filename: `meldunek-${dateLabel.replace(/\./g, "-")}.docx`,
          content: renderDocxTemplate("meldunek-template.docx", data),
          contentType: DOCX_CONTENT_TYPE,
        },
      ],
    });

    return NextResponse.json({ ok: true, message: `Meldunek z dnia ${dateLabel} wysłano na e-mail OSP.` });
  } catch (error) {
    console.error("Wysyłka meldunku nie powiodła się:", error);
    return fail(error instanceof Error ? error.message : "Nieznany błąd.", 500);
  }
}
