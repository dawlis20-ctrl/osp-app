import { NextResponse } from "next/server";
import { renderDocxTemplate, DOCX_CONTENT_TYPE } from "@/lib/docx/render";
import { loadMeldunekDocxData } from "@/lib/docx/meldunek-data";

export async function GET(_request: Request, { params }: RouteContext<"/meldunki/[id]/docx">) {
  const { id } = await params;
  const loaded = await loadMeldunekDocxData(id);

  if (!loaded) {
    return new NextResponse("Nie znaleziono meldunku", { status: 404 });
  }

  const buffer = renderDocxTemplate("meldunek-template.docx", loaded.data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="meldunek-${loaded.meldunek.id}.docx"`,
    },
  });
}
