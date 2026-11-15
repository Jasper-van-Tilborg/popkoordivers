"use server";

import { revalidatePath } from "next/cache";
import { requireBeheer } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import { copyToPublic, deleteFile, downloadUrl } from "@/lib/r2";
import { youtubeId } from "./youtube";

export interface AlbumInput {
  titel: string;
  datum: string;     // "14 januari 2024"
  datumIso: string;  // "2024-01-14", voor het webadres
}

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "album";
}

function vernieuw(albumId?: string | null) {
  revalidatePath("/admin/albums");
  if (albumId) revalidatePath(`/admin/albums/${albumId}`);
  revalidatePath("/media", "layout");
  revalidatePath("/leden/fotos");
}

// De grote foto en (als die er is) de kleine versie
const keysVan = (f: { r2_key: string; klein_key?: string | null }) => [f.r2_key, ...(f.klein_key ? [f.klein_key] : [])];

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
    .from("albums").insert({ titel: input.titel.trim(), datum: input.datum, datum_sorteer: input.datumIso || null, slug }).select("id").single();
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
  // Zonder nieuwe datum (een oud album met "april 2017") blijft de sorteerdatum staan
  const { error } = await supabase.from("albums")
    .update({ titel: input.titel.trim(), datum: input.datum, ...(input.datumIso ? { datum_sorteer: input.datumIso } : {}) })
    .eq("id", id);
  if (error) return { error: error.message };
  await logActiviteit(sessie, "gewijzigd", "album", { id, naam: input.titel.trim() });
  vernieuw(id);
  return {};
}

export async function verwijderAlbum(id: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: album } = await supabase.from("albums").select("slug, titel").eq("id", id).single();
  const { data: fotos } = await supabase.from("fotos").select("r2_key, klein_key, impressies").eq("album_id", id);

  // Foto's gaan mee (cascade); video's blijven bestaan, als losse video
  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) return { error: error.message };

  await Promise.allSettled((fotos ?? []).flatMap((f) => keysVan(f).flatMap((key) => [
    deleteFile("prive", key),
    ...(f.impressies ? [deleteFile("openbaar", key)] : []),
  ])));
  if (album) await supabase.from("agenda").update({ fotos_url: null }).eq("fotos_url", `/media/${album.slug}`);
  await logActiviteit(sessie, `verwijderd met ${(fotos ?? []).length} foto's`, "album", { id, naam: album?.titel });

  vernieuw();
  revalidatePath("/admin/agenda");
  return {};
}

// Na een upload vanuit de browser: de foto (en zijn kleine versie) vastleggen in het album.
export async function fotoToevoegen(albumId: string, key: string, kleinKey: string | null = null) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  if (!key.startsWith(`albums/${albumId}/`)) return { error: "Ongeldige foto." };
  if (kleinKey && !kleinKey.startsWith(`albums/${albumId}/klein/`)) return { error: "Ongeldige foto." };

  const { data: laatste } = await supabase
    .from("fotos").select("volgorde").eq("album_id", albumId).order("volgorde", { ascending: false }).limit(1);
  const volgorde = (laatste?.[0]?.volgorde ?? -1) + 1;

  const { error } = await supabase.from("fotos").insert({ album_id: albumId, r2_key: key, klein_key: kleinKey, impressies: false, volgorde });
  if (error) {
    await Promise.allSettled([key, kleinKey].filter((k): k is string => !!k).map((k) => deleteFile("prive", k)));
    return { error: error.message };
  }
  return {};
}

// Impressie = ook zichtbaar op de openbare website: er komt een kopie in de openbare bucket.
export async function zetImpressie(fotoId: string, aan: boolean) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: foto } = await supabase.from("fotos").select("album_id, r2_key, klein_key").eq("id", fotoId).single();
  if (!foto) return { error: "Foto niet gevonden." };

  try {
    if (aan) await Promise.all(keysVan(foto).map(copyToPublic));
  } catch {
    return { error: "Kopiëren naar de openbare opslag lukte niet." };
  }
  const { error } = await supabase.from("fotos").update({ impressies: aan }).eq("id", fotoId);
  if (error) return { error: error.message };
  const { data: album } = await supabase.from("albums").select("titel").eq("id", foto.album_id).single();
  await logActiviteit(sessie, aan ? "op de website gezet" : "van de website gehaald", "foto", { id: foto.album_id, naam: album?.titel });
  if (!aan) await Promise.allSettled(keysVan(foto).map((k) => deleteFile("openbaar", k)));

  vernieuw(foto.album_id);
  return {};
}

export async function verwijderFoto(fotoId: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: foto } = await supabase.from("fotos").select("album_id, r2_key, klein_key, impressies").eq("id", fotoId).single();
  if (!foto) return { error: "Foto niet gevonden." };

  const { error } = await supabase.from("fotos").delete().eq("id", fotoId);
  if (error) return { error: error.message };
  await Promise.allSettled(keysVan(foto).flatMap((k) => [
    deleteFile("prive", k),
    ...(foto.impressies ? [deleteFile("openbaar", k)] : []),
  ]));

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

// Wat er onder een foto staat (leeg = geen bijschrift)
export async function zetBijschrift(fotoId: string, tekst: string) {
  const sessie = await requireBeheer();
  const bijschrift = tekst.trim().slice(0, 200) || null;
  const { data, error } = await sessie.supabase.from("fotos").update({ bijschrift }).eq("id", fotoId).select("album_id").single();
  if (error) return { error: error.message };
  vernieuw(data.album_id);
  return {};
}

// ── Video's ─────────────────────────────────────────────────────────────────────
// Een video is een YouTube-video (alleen de id) of een eigen bestand in R2 (privé;
// openbaar = ook een kopie in de openbare bucket). Hoort optioneel bij een album.

export interface VideoInput {
  titel: string;
  datum: string | null;    // "2024-06-01"
  albumId: string | null;
  openbaar: boolean;
}

// De titel van een YouTube-video, als voorstel bij het toevoegen
export async function youtubeTitel(link: string): Promise<string | null> {
  await requireBeheer();
  const id = youtubeId(link);
  if (!id) return null;
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://youtu.be/${id}&format=json`, { signal: AbortSignal.timeout(5000) });
    return res.ok ? ((await res.json()) as { title?: string }).title ?? null : null;
  } catch {
    return null;
  }
}

function controleerVideo(i: VideoInput) {
  if (!i.titel.trim()) return "Geef de video een titel.";
  if (i.datum && !/^\d{4}-\d{2}-\d{2}$/.test(i.datum)) return "Kies een geldige datum.";
  if (i.albumId && !/^[0-9a-f-]{36}$/.test(i.albumId)) return "Ongeldig album.";
  return null;
}

export async function maakVideo(input: VideoInput, bron: { youtube: string } | { key: string }) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const fout = controleerVideo(input);
  if (fout) return { error: fout };

  let youtube_id: string | null = null, r2_key: string | null = null;
  if ("youtube" in bron) {
    youtube_id = youtubeId(bron.youtube);
    if (!youtube_id) return { error: "Dit is geen YouTube-link." };
  } else {
    if (!bron.key.startsWith("videos/")) return { error: "Ongeldig bestand." };
    r2_key = bron.key;
    if (input.openbaar) {
      try { await copyToPublic(r2_key); } catch { return { error: "Kopiëren naar de openbare opslag lukte niet." }; }
    }
  }

  const { data: laatste } = await supabase.from("videos").select("volgorde")
    .filter("album_id", input.albumId ? "eq" : "is", input.albumId ?? null).order("volgorde", { ascending: false }).limit(1);
  const { data, error } = await supabase.from("videos").insert({
    titel: input.titel.trim(), datum: input.datum, album_id: input.albumId, openbaar: input.openbaar,
    youtube_id, r2_key, volgorde: (laatste?.[0]?.volgorde ?? -1) + 1,
  }).select("id").single();
  if (error) {
    if (r2_key) await Promise.allSettled([deleteFile("prive", r2_key), deleteFile("openbaar", r2_key)]);
    return { error: error.message };
  }
  await logActiviteit(sessie, "toegevoegd", "video", { id: data.id, naam: input.titel.trim() });
  vernieuw(input.albumId);
  return { id: data.id };
}

export async function wijzigVideo(id: string, input: VideoInput) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const fout = controleerVideo(input);
  if (fout) return { error: fout };
  const { data: oud } = await supabase.from("videos").select("album_id, r2_key, openbaar").eq("id", id).single();
  if (!oud) return { error: "Deze video bestaat niet meer." };

  // Een eigen bestand dat openbaar wordt (of niet meer): de kopie in de openbare bucket
  if (oud.r2_key && input.openbaar !== oud.openbaar) {
    try {
      if (input.openbaar) await copyToPublic(oud.r2_key);
    } catch {
      return { error: "Kopiëren naar de openbare opslag lukte niet." };
    }
  }
  const { error } = await supabase.from("videos")
    .update({ titel: input.titel.trim(), datum: input.datum, album_id: input.albumId, openbaar: input.openbaar }).eq("id", id);
  if (error) return { error: error.message };
  if (oud.r2_key && oud.openbaar && !input.openbaar) await deleteFile("openbaar", oud.r2_key).catch(() => {});

  await logActiviteit(sessie, "gewijzigd", "video", { id, naam: input.titel.trim() });
  vernieuw(oud.album_id);
  if (input.albumId !== oud.album_id) vernieuw(input.albumId);
  return {};
}

export async function zetVideoOpenbaar(id: string, aan: boolean) {
  const sessie = await requireBeheer();
  const { data: v } = await sessie.supabase.from("videos").select("titel, datum, album_id").eq("id", id).single();
  if (!v) return { error: "Deze video bestaat niet meer." };
  return wijzigVideo(id, { titel: v.titel, datum: v.datum, albumId: v.album_id, openbaar: aan });
}

export async function verwijderVideo(id: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: v } = await supabase.from("videos").select("titel, album_id, r2_key, openbaar").eq("id", id).single();
  if (!v) return { error: "Deze video bestaat niet meer." };
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { error: error.message };
  if (v.r2_key) await Promise.allSettled([deleteFile("prive", v.r2_key), ...(v.openbaar ? [deleteFile("openbaar", v.r2_key)] : [])]);
  await logActiviteit(sessie, "verwijderd", "video", { id, naam: v.titel });
  vernieuw(v.album_id);
  return {};
}

// Tijdelijke link om een eigen video te bekijken in de admin
export async function videoLink(id: string) {
  const { supabase } = await requireBeheer();
  const { data } = await supabase.from("videos").select("r2_key").eq("id", id).maybeSingle();
  return data?.r2_key ? downloadUrl(data.r2_key) : null;
}
