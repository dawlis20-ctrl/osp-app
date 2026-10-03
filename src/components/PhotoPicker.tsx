"use client";

import { useEffect, useRef, useState } from "react";

type Picked = { file: File; url: string };

const MAX_SIDE = 1600;

async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob) return file;
    return new File([blob], `zdjecie-${Date.now()}.jpg`, { type: "image/jpeg" });
  } catch {
    // Browser could not decode it (rare format) — the server will try with sharp.
    return file;
  }
}

export function PhotoPicker({
  name,
  max,
  title,
  hint,
}: {
  name: string;
  max: number;
  title: string;
  hint?: string;
}) {
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [busy, setBusy] = useState(false);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Keep the real (named) file input in sync with what the user kept.
  useEffect(() => {
    if (!hiddenRef.current) return;
    const transfer = new DataTransfer();
    photos.forEach((p) => transfer.items.add(p.file));
    hiddenRef.current.files = transfer.files;
  }, [photos]);

  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (chosen.length === 0) return;

    setBusy(true);
    const room = max - photos.length;
    const shrunk = await Promise.all(chosen.slice(0, room).map(shrink));
    setPhotos((prev) => [...prev, ...shrunk.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    setBusy(false);
  }

  function remove(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  const full = photos.length >= max;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold text-brand-navy">{title}</p>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>

      <input ref={hiddenRef} type="file" name={name} multiple className="hidden" tabIndex={-1} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={max > 1}
        onChange={onPick}
        className="hidden"
      />

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.map((p, i) => (
            <li key={p.url} className="relative overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Zdjęcie ${i + 1}`} className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Usuń zdjęcie ${i + 1}`}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-sm leading-6 text-white"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={full || busy}
          onClick={() => cameraRef.current?.click()}
          className="rounded-lg border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Przetwarzanie…" : "📷 Zrób / dodaj zdjęcie"}
        </button>
        <span className="text-xs text-gray-500">
          {photos.length} / {max}
        </span>
      </div>
    </div>
  );
}
