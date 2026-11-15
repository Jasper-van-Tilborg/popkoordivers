import { createClient } from "@/lib/supabase/server";
import { downloadUrl, getPublicUrl } from "@/lib/r2";
import AlbumsClient from "./AlbumsClient";

export default async function AlbumsAdminPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; video?: string }> }) {
  const { nieuw, video } = await searchParams;
  const supabase = await createClient();
  const [albums, fotos, videos] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum")
      .order("datum_sorteer", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
    supabase.from("fotos").select("album_id, r2_key, klein_key, impressies").order("volgorde").order("created_at"),
    supabase.from("videos").select("id, titel, datum, album_id, youtube_id, r2_key, openbaar")
      .order("datum", { ascending: false, nullsFirst: false }).order("volgorde"),
  ]);

  const alleVideos = videos.data ?? [];
  const lijst = await Promise.all((albums.data ?? []).map(async (a) => {
    const eigen = (fotos.data ?? []).filter((f) => f.album_id === a.id);
    const impressies = eigen.filter((f) => f.impressies);
    // De omslag: de eerste foto die op de website staat, anders de eerste foto; klein als dat kan
    const omslag = impressies[0] ?? eigen[0];
    const cover = !omslag ? null
      : omslag.impressies ? getPublicUrl(omslag.klein_key ?? omslag.r2_key)
      : await downloadUrl(omslag.klein_key ?? omslag.r2_key);
    return { ...a, totaal: eigen.length, impressies: impressies.length, videos: alleVideos.filter((v) => v.album_id === a.id).length, cover };
  }));

  // Een link naar een video bij een album (activiteit): naar dat album
  const gevraagd = video ? alleVideos.find((v) => v.id === video) : undefined;

  return (
    <AlbumsClient
      albums={lijst}
      losseVideos={alleVideos.filter((v) => !v.album_id)}
      loadError={albums.error?.message}
      startNieuw={nieuw !== undefined}
      startVideo={gevraagd && !gevraagd.album_id ? gevraagd.id : undefined}
      videoAlbum={gevraagd?.album_id ?? undefined}
    />
  );
}
