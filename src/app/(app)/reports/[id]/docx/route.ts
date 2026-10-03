import { NextResponse } from "next/server";
import { renderDocxTemplate, DOCX_CONTENT_TYPE } from "@/lib/docx/render";
import { loadReportDocxData } from "@/lib/docx/report-data";

export async function GET(_request: Request, { params }: RouteContext<"/reports/[id]/docx">) {
  const { id } = await params;
  const loaded = await loadReportDocxData(id);

  if (!loaded) {
    return new NextResponse("Nie znaleziono raportu", { status: 404 });
  }

  const buffer = renderDocxTemplate("raport-template.docx", loaded.data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="raport-${loaded.report.number.replace(/[\\/]/g, "-")}.docx"`,
    },
  });
}
