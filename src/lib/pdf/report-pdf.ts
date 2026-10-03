import fs from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { renderDocxTemplate } from "@/lib/docx/render";
import { loadReportDocxData } from "@/lib/docx/report-data";
import { docxToPdf } from "@/lib/pdf/convert";
import { readPhoto } from "@/lib/photos";

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 40;

async function font(file: string) {
  return fs.readFile(path.join(process.cwd(), "src/lib/pdf/fonts", file));
}

// One PDF: the filled report template followed by one page per photo.
export async function buildReportPdf(reportId: string): Promise<{ pdf: Buffer; number: string } | null> {
  const loaded = await loadReportDocxData(reportId);
  if (!loaded) return null;

  const reportPdf = await docxToPdf(renderDocxTemplate("raport-template.docx", loaded.data));

  const photos = await prisma.reportPhoto.findMany({
    where: { reportId },
    orderBy: [{ kind: "asc" }, { position: "asc" }],
  });

  if (photos.length === 0) return { pdf: reportPdf, number: loaded.report.number };

  const doc = await PDFDocument.load(reportPdf);
  doc.registerFontkit(fontkit);
  // Subsetting garbles Noto Sans glyph mapping in pdf-lib's fontkit, so embed it whole (one weight only).
  const regular = await doc.embedFont(await font("NotoSans-Regular.ttf"), { subset: false });

  const confirmation = photos.filter((p) => p.kind === "POTWIERDZENIE");
  const other = photos.filter((p) => p.kind === "INNE");

  const groups = [
    { title: "Potwierdzenie udziału w działaniach", list: confirmation },
    { title: "Dokumentacja zdjęciowa", list: other },
  ];

  for (const { title, list } of groups) {
    for (const [index, photo] of list.entries()) {
      const page = doc.addPage([A4.width, A4.height]);
      page.drawText(`Raport nr ${loaded.report.number}`, {
        x: MARGIN,
        y: A4.height - MARGIN - 6,
        size: 9,
        font: regular,
        color: rgb(0.4, 0.4, 0.4),
      });
      page.drawText(title, { x: MARGIN, y: A4.height - MARGIN - 28, size: 15, font: regular });
      page.drawText(`Zdjęcie ${index + 1} z ${list.length}`, {
        x: MARGIN,
        y: A4.height - MARGIN - 46,
        size: 10,
        font: regular,
        color: rgb(0.3, 0.3, 0.3),
      });

      const image = await doc.embedJpg(await readPhoto(photo.path));
      const boxWidth = A4.width - MARGIN * 2;
      const boxHeight = A4.height - MARGIN * 2 - 70;
      const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      page.drawImage(image, { x: MARGIN + (boxWidth - w) / 2, y: MARGIN + (boxHeight - h), width: w, height: h });
    }
  }

  return { pdf: Buffer.from(await doc.save()), number: loaded.report.number };
}
