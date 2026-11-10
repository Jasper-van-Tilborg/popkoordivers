"use client";

import { uploadNaarR2 } from "../../_components/upload";

export const OPNAME_TYPES = "audio/*,video/mp4,.mp3,.m4a,.wav,.wma,.mp4";
export const foutTekst = (e: unknown) => (e instanceof Error ? e.message : "Dat lukte niet.");

// Uploadt bestanden naar R2, drie tegelijk. Geeft terug wat gelukt is;
// van elk bestand komt de voortgang (0–1) of een foutmelding binnen.
export async function uploadReeks<T extends { file: File }>(
  lijst: T[],
  meld: (x: T, voortgang: number | null, fout?: string) => void,
) {
  const klaar: { x: T; key: string }[] = [];
  const rij = [...lijst];
  await Promise.all(Array.from({ length: 3 }, async () => {
    for (let x; (x = rij.shift()); ) {
      const item = x;
      meld(item, 0);
      try {
        const key = await uploadNaarR2(item.file, { soort: "bestand", categorie: "opnames" }, (p) => meld(item, p));
        meld(item, 1);
        klaar.push({ x: item, key });
      } catch (e) {
        meld(item, null, foutTekst(e));
      }
    }
  }));
  return klaar;
}

// Sleept iemand bestanden (en niet bijv. tekst) over de pagina?
export const sleeptBestanden = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");
