"use server";

import { requireBeheer } from "@/lib/auth";
import { safeName, uploadUrl, type Bucket } from "@/lib/r2";

export type UploadSoort =
  | { soort: "nieuws" }
  | { soort: "album"; albumId: string }
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
      key = `albums/${doel.albumId}/${naam}`;
      break;
    case "bestand":
      bucket = "prive";
      key = `bestanden/${safeName(doel.categorie)}/${naam}`;
      break;
  }

  return { key, url: await uploadUrl(bucket, key, contentType) };
}
