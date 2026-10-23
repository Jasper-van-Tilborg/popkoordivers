import { createClient } from "@/lib/supabase/server";
import { downloadUrl, getPublicUrl } from "@/lib/r2";
import AlbumsClient from "./AlbumsClient";

export default async function AlbumsAdminPage({ searchParams }: { searchParams: Promise<{ nieuw?: string }> }) {
  const { nieuw } = await searchParams;
  const supabase = await createClient();
  const [albums, fotos] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum").order("created_at", { ascending: false }),
    supabase.from("fotos").select("album_id, r2_key, impressies").order("volgorde").order("created_at"),
  ]);

  const lijst = await Promise.all((albums.data ?? []).map(async (a) => {
    const eigen = (fotos.data ?? []).filter((f) => f.album_id === a.id);
    const impressies = eigen.filter((f) => f.impressies);
    const cover = impressies[0]
      ? getPublicUrl(impressies[0].r2_key)
      : eigen[0] ? await downloadUrl(eigen[0].r2_key) : null;
    return { ...a, totaal: eigen.length, impressies: impressies.length, cover };
  }));

  return <AlbumsClient albums={lijst} loadError={albums.error?.message} startNieuw={nieuw !== undefined} />;
}
