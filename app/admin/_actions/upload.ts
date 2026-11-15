"use server";

import { requireBeheer } from "@/lib/auth";
import { safeName, uploadUrl, type Bucket } from "@/lib/r2";

export type UploadSoort =
  | { soort: "nieuws" }
  | { soort: "album"; albumId: string; klein?: boolean }
  | { soort: "video" }
  | { soort: "bestand"; categorie: string };

// De server bepaalt bucket en key; de browser krijgt alleen een tijdelijke uploadlink.
export async function vraagUploadAan(doel: UploadSoort, bestandsnaam: string, contentType: string) {
  await requireBeheer();

  const naam = `${Date.now()}-${safeName(bestandsnaam)}`;
  let bucket: Bucket;
  let key: string;

  switch (doel.soort) {
    case "nieuws":
      bucket = "openbaar";
      key = `nieuws/${naam}`;
      break;
    case "album":
      if (!/^[0-9a-f-]{36}$/.test(doel.albumId)) throw new Error("Ongeldig album");
      bucket = "prive";
      // De kleine versie (voor rasters) naast de grote, in een eigen map
      key = `albums/${doel.albumId}/${doel.klein ? "klein/" : ""}${naam}`;
      break;
    case "video":
      bucket = "prive";
      key = `videos/${naam}`;
      break;
    case "bestand":
      bucket = "prive";
      key = `bestanden/${safeName(doel.categorie)}/${naam}`;
      break;
  }

  return { key, url: await uploadUrl(bucket, key, contentType) };
}
