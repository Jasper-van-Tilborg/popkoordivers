import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { downloadUrl } from "@/lib/r2";
import AlbumClient from "./AlbumClient";

export default async function AlbumAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: album }, { data: fotos }] = await Promise.all([
    supabase.from("albums").select("id, slug, titel, datum").eq("id", id).single(),
    supabase.from("fotos").select("id, r2_key, impressies").eq("album_id", id).order("volgorde").order("created_at"),
  ]);
  if (!album) notFound();

  const metUrl = await Promise.all((fotos ?? []).map(async (f) => ({
    id: f.id,
    impressies: !!f.impressies,
    url: await downloadUrl(f.r2_key),
  })));

  return <AlbumClient album={album} fotos={metUrl} />;
}
