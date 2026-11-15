import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { downloadUrl } from "@/lib/r2";
import AlbumClient from "./AlbumClient";

export default async function AlbumAdminPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  const [{ data: album }, { data: fotos }, { data: videos }, { data: albums }] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum, soort").eq("id", id).single(),
    supabase.from("fotos").select("id, r2_key, klein_key, impressies, bijschrift").eq("album_id", id).order("volgorde").order("created_at"),
    supabase.from("videos").select("id, titel, datum, album_id, youtube_id, r2_key, openbaar").eq("album_id", id).order("volgorde"),
    supabase.from("albums").select("id, titel, datum")
      .order("datum_sorteer", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }),
  ]);
  if (!album) notFound();

  // In het raster de kleine versie; de grote pas als je een foto opent
  const metUrl = await Promise.all((fotos ?? []).map(async (f) => ({
    id: f.id,
    impressies: !!f.impressies,
    bijschrift: f.bijschrift,
    url: await downloadUrl(f.r2_key),
    klein: f.klein_key ? await downloadUrl(f.klein_key) : null,
  })));

  return <AlbumClient album={album} fotos={metUrl} videos={videos ?? []} albums={albums ?? []} startTab={tab === "videos" ? "videos" : "fotos"} />;
}
