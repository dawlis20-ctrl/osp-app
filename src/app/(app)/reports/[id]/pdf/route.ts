import { NextResponse } from "next/server";
import { buildReportPdf } from "@/lib/pdf/report-pdf";

export async function GET(_request: Request, { params }: RouteContext<"/reports/[id]/pdf">) {
  const { id } = await params;

  try {
    const built = await buildReportPdf(id);
    if (!built) return new NextResponse("Nie znaleziono raportu", { status: 404 });

    return new NextResponse(new Uint8Array(built.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="raport-${built.number.replace(/[\\/]/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF raportu nie powstał:", error);
    return new NextResponse("Nie udało się wygenerować PDF (czy LibreOffice jest zainstalowany?).", {
      status: 500,
    });
  }
}
