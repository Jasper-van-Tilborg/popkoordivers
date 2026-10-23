"use server";

import { revalidatePath } from "next/cache";
import { requireBeheer } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import { copyToPublic, deleteFile } from "@/lib/r2";

export interface AlbumInput {
  titel: string;
  datum: string;     // "14 januari 2024"
  datumIso: string;  // "2024-01-14", voor het webadres
}

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "album";
}

function vernieuw(albumId?: string) {
  revalidatePath("/admin/albums");
  if (albumId) revalidatePath(`/admin/albums/${albumId}`);
  revalidatePath("/media", "layout");
}

export async function maakAlbum(input: AlbumInput) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  if (!input.titel.trim() || !input.datum) return { error: "Titel en datum zijn verplicht." };

  const basis = slugify(`${input.titel}-${input.datumIso}`);
  const { data: bestaand } = await supabase.from("albums").select("slug").like("slug", `${basis}%`);
  const bezet = new Set((bestaand ?? []).map((a) => a.slug));
  let slug = basis;
  for (let n = 2; bezet.has(slug); n++) slug = `${basis}-${n}`;

  const { data, error } = await supabase
    .from("albums").insert({ titel: input.titel.trim(), datum: input.datum, slug }).select("id").single();
  if (error) return { error: error.message };
  await logActiviteit(sessie, "aangemaakt", "album", { id: data.id, naam: input.titel.trim() });
  vernieuw();
  return { id: data.id };
}

export async function wijzigAlbum(id: string, input: AlbumInput) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  if (!input.titel.trim() || !input.datum) return { error: "Titel en datum zijn verplicht." };
  // Het webadres blijft gelijk, zodat links vanuit de agenda blijven werken.
  const { error } = await supabase.from("albums").update({ titel: input.titel.trim(), datum: input.datum }).eq("id", id);
  if (error) return { error: error.message };
  await logActiviteit(sessie, "gewijzigd", "album", { id, naam: input.titel.trim() });
  vernieuw(id);
  return {};
}

export async function verwijderAlbum(id: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: album } = await supabase.from("albums").select("slug, titel").eq("id", id).single();
  const { data: fotos } = await supabase.from("fotos").select("r2_key, impressies").eq("album_id", id);

  const { error } = await supabase.from("albums").delete().eq("id", id); // foto's gaan mee (cascade)
  if (error) return { error: error.message };

  await Promise.allSettled((fotos ?? []).flatMap((f) => [
    deleteFile("prive", f.r2_key),
    ...(f.impressies ? [deleteFile("openbaar", f.r2_key)] : []),
  ]));
  if (album) await supabase.from("agenda").update({ fotos_url: null }).eq("fotos_url", `/media/${album.slug}`);
  await logActiviteit(sessie, `verwijderd met ${(fotos ?? []).length} foto's`, "album", { id, naam: album?.titel });

  vernieuw();
  revalidatePath("/admin/agenda");
  return {};
}

// Na een upload vanuit de browser: de foto vastleggen in het album.
export async function fotoToevoegen(albumId: string, key: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  if (!key.startsWith(`albums/${albumId}/`)) return { error: "Ongeldige foto." };

  const { data: laatste } = await supabase
    .from("fotos").select("volgorde").eq("album_id", albumId).order("volgorde", { ascending: false }).limit(1);
  const volgorde = (laatste?.[0]?.volgorde ?? -1) + 1;

  const { error } = await supabase.from("fotos").insert({ album_id: albumId, r2_key: key, impressies: false, volgorde });
  if (error) {
    await deleteFile("prive", key).catch(() => {});
    return { error: error.message };
  }
  return {};
}

// Impressie = ook zichtbaar op de openbare website: er komt een kopie in de openbare bucket.
export async function zetImpressie(fotoId: string, aan: boolean) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: foto } = await supabase.from("fotos").select("album_id, r2_key").eq("id", fotoId).single();
  if (!foto) return { error: "Foto niet gevonden." };

  try {
    if (aan) await copyToPublic(foto.r2_key);
  } catch {
    return { error: "Kopiëren naar de openbare opslag lukte niet." };
  }
  const { error } = await supabase.from("fotos").update({ impressies: aan }).eq("id", fotoId);
  if (error) return { error: error.message };
  const { data: album } = await supabase.from("albums").select("titel").eq("id", foto.album_id).single();
  await logActiviteit(sessie, aan ? "op de website gezet" : "van de website gehaald", "foto", { id: foto.album_id, naam: album?.titel });
  if (!aan) await deleteFile("openbaar", foto.r2_key).catch(() => {});

  vernieuw(foto.album_id);
  return {};
}

export async function verwijderFoto(fotoId: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: foto } = await supabase.from("fotos").select("album_id, r2_key, impressies").eq("id", fotoId).single();
  if (!foto) return { error: "Foto niet gevonden." };

  const { error } = await supabase.from("fotos").delete().eq("id", fotoId);
  if (error) return { error: error.message };
  await Promise.allSettled([
    deleteFile("prive", foto.r2_key),
    ...(foto.impressies ? [deleteFile("openbaar", foto.r2_key)] : []),
  ]);

  vernieuw(foto.album_id);
  return {};
}

// Nieuwe volgorde na slepen of de pijltjes: ids in de gewenste volgorde.
export async function zetFotoVolgorde(albumId: string, ids: string[]) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const resultaten = await Promise.all(
    ids.map((id, volgorde) => supabase.from("fotos").update({ volgorde }).eq("id", id).eq("album_id", albumId))
  );
  const fout = resultaten.find((r) => r.error);
  if (fout?.error) return { error: fout.error.message };
  vernieuw(albumId);
  return {};
}

// Na een reeks uploads: één regel in de activiteit in plaats van één per foto.
export async function fotosToegevoegd(albumId: string, aantal: number) {
  const sessie = await requireBeheer();
  const { data: album } = await sessie.supabase.from("albums").select("titel").eq("id", albumId).single();
  await logActiviteit(sessie, `${aantal} foto${aantal === 1 ? "" : "'s"} toegevoegd`, "album", { id: albumId, naam: album?.titel });
  return {};
}
