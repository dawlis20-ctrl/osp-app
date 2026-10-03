import PizZip from "pizzip";
import { renderDocxTemplate } from "@/lib/docx/render";
import { loadMeldunekDocxData } from "@/lib/docx/meldunek-data";
import { docxToPdf } from "@/lib/pdf/convert";

// The Meldunek template is one big *floating* table with zero page margins. Word lays that out
// fine, but LibreOffice pushes it to page 2 and leaves page 1 empty. For the PDF only, we make a
// copy where the table is placed inline (same -225 twip shift, expressed as an indent). The
// downloadable .docx keeps the original template untouched.
function unfloatFirstTable(docx: Buffer): Buffer {
  const zip = new PizZip(docx);
  let xml = zip.file("word/document.xml")!.asText();

  const start = xml.indexOf("<w:tbl>");
  const end = xml.indexOf("</w:tblPr>", start);
  if (start === -1 || end === -1) return docx;

  const head = xml
    .slice(start, end)
    .replace(/<w:tblpPr [^>]*\/>/, "")
    .replace('<w:tblInd w:w="0" w:type="dxa"/>', '<w:tblInd w:w="-225" w:type="dxa"/>');
  xml = xml.slice(0, start) + head + xml.slice(end);

  zip.file("word/document.xml", xml);
  return zip.generate({ type: "nodebuffer" });
}

export async function buildMeldunekPdf(id: string): Promise<{ pdf: Buffer; id: string } | null> {
  const loaded = await loadMeldunekDocxData(id);
  if (!loaded) return null;
  const docx = renderDocxTemplate("meldunek-template.docx", loaded.data);
  const pdf = await docxToPdf(unfloatFirstTable(docx));
  return { pdf, id: loaded.meldunek.id };
}
