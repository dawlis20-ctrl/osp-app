import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const MAX_CONFIRMATION_PHOTOS = 2;
export const MAX_OTHER_PHOTOS = 5;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

export function uploadsDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR || "./data/uploads");
}

function absolutePath(relative: string): string {
  const full = path.resolve(uploadsDir(), relative);
  // Paths come from our own DB, but never let one escape the uploads directory.
  if (!full.startsWith(uploadsDir() + path.sep)) throw new Error("Nieprawidłowa ścieżka pliku");
  return full;
}

// Normalises whatever the phone sent (HEIC aside, which browsers convert on capture)
// into an upright JPEG of at most 1600 px — keeps the final PDF and e-mail small.
export async function saveReportPhoto(reportId: string, file: File): Promise<string> {
  if (file.size === 0) throw new Error("Pusty plik zdjęcia");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Zdjęcie jest za duże (maks. 12 MB)");

  const jpeg = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const relative = path.join(reportId, `${randomUUID()}.jpg`);
  const full = absolutePath(relative);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, jpeg);
  return relative;
}

export async function readPhoto(relative: string): Promise<Buffer> {
  return fs.readFile(/*turbopackIgnore: true*/ absolutePath(relative));
}
