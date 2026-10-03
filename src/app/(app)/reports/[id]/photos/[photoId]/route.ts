import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readPhoto } from "@/lib/photos";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/reports/[id]/photos/[photoId]">
) {
  const { id, photoId } = await params;

  const photo = await prisma.reportPhoto.findFirst({ where: { id: photoId, reportId: id } });
  if (!photo) return new NextResponse("Nie znaleziono zdjęcia", { status: 404 });

  try {
    const bytes = await readPhoto(photo.path);
    return new NextResponse(new Uint8Array(bytes), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return new NextResponse("Plik zdjęcia nie istnieje na serwerze", { status: 404 });
  }
}
