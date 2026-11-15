"use client";

import { vraagUploadAan, type UploadSoort } from "../_actions/upload";

const MAX_ZIJDE = 2400;
const KLEIN = 800;

// Een foto als jpeg van hooguit `max` px aan de lange kant (null als de browser hem niet kan lezen)
async function alsJpeg(file: File, max: number, kwaliteit: number): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const schaal = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * schaal);
    canvas.height = Math.round(bitmap.height * schaal);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", kwaliteit));
    return blob && new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return null;
  }
}

// Grote foto's (telefoons maken al snel 4000px+) verkleinen voor het uploaden.
// Lukt het niet (bijv. HEIC in Chrome), dan gaat het origineel.
async function verklein(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const groot = Math.max(bitmap.width, bitmap.height) > MAX_ZIJDE;
    bitmap.close();
    if (!groot && file.size < 2_000_000) return file;
  } catch {
    return file;
  }
  return (await alsJpeg(file, MAX_ZIJDE, 0.85)) ?? file;
}

// De kleine versie van een albumfoto (voor rasters) uploaden; null als dat niet lukt,
// dan tonen de rasters gewoon de grote.
export async function uploadKlein(file: File, albumId: string): Promise<string | null> {
  const klein = await alsJpeg(file, KLEIN, 0.8);
  if (!klein) return null;
  return uploadNaarR2(klein, { soort: "album", albumId, klein: true }).catch(() => null);
}

// Uploadt rechtstreeks van de browser naar R2 en geeft de key terug.
export async function uploadNaarR2(file: File, doel: UploadSoort, onProgress?: (fractie: number) => void): Promise<string> {
  const bestand = doel.soort === "bestand" || doel.soort === "video" || (doel.soort === "album" && doel.klein) ? file : await verklein(file);
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
