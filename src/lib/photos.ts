import sharp from "sharp";

export { MAX_CONFIRMATION_PHOTOS, MAX_OTHER_PHOTOS } from "@/lib/report-form";

const MAX_INPUT_BYTES = 12 * 1024 * 1024;

// Photos only live in memory for the length of one request: normalised to an upright JPEG of at
// most 1600 px (the browser already shrank them, this also covers a browser that couldn't) and
// attached to the e-mail.
export async function processPhoto(file: File): Promise<Buffer> {
  if (file.size === 0) throw new Error("Pusty plik zdjęcia");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Zdjęcie jest za duże (maks. 12 MB)");

  return sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export function filesFrom(form: FormData, field: string, max: number): File[] {
  return form
    .getAll(field)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, max);
}
