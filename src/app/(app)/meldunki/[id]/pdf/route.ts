import { NextResponse } from "next/server";
import { buildMeldunekPdf } from "@/lib/pdf/meldunek-pdf";

export async function GET(_request: Request, { params }: RouteContext<"/meldunki/[id]/pdf">) {
  const { id } = await params;

  try {
    const built = await buildMeldunekPdf(id);
    if (!built) return new NextResponse("Nie znaleziono meldunku", { status: 404 });

    return new NextResponse(new Uint8Array(built.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="meldunek-${built.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF meldunku nie powstał:", error);
    return new NextResponse("Nie udało się wygenerować PDF (czy LibreOffice jest zainstalowany?).", {
      status: 500,
    });
  }
}
