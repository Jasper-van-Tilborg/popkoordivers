"use client";

import { vraagUploadAan, type UploadSoort } from "../_actions/upload";

const MAX_ZIJDE = 2400;

// Grote foto's (telefoons maken al snel 4000px+) verkleinen voor het uploaden.
// Lukt het niet (bijv. HEIC in Chrome), dan gaat het origineel.
async function verklein(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const schaal = Math.min(1, MAX_ZIJDE / Math.max(bitmap.width, bitmap.height));
    if (schaal === 1 && file.size < 2_000_000) { bitmap.close(); return file; }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * schaal);
    canvas.height = Math.round(bitmap.height * schaal);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// Uploadt rechtstreeks van de browser naar R2 en geeft de key terug.
export async function uploadNaarR2(file: File, doel: UploadSoort, onProgress?: (fractie: number) => void): Promise<string> {
  const bestand = doel.soort === "bestand" ? file : await verklein(file);
  const type = bestand.type || "application/octet-stream";
  const { key, url } = await vraagUploadAan(doel, bestand.name, type);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload mislukt (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload mislukt: geen verbinding met de opslag"));
    xhr.send(bestand);
  });

  return key;
}
