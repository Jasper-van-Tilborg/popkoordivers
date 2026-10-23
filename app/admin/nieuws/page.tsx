import { createClient } from "@/lib/supabase/server";
import NieuwsClient from "./NieuwsClient";

export default async function NieuwsAdminPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const { nieuw, id } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("berichten")
    .select("id, slug, titel, datum, categorie, intro, inhoud, afbeelding, gepubliceerd, created_at")
    .order("created_at", { ascending: false });

  return <NieuwsClient items={data ?? []} loadError={error?.message} startNieuw={nieuw !== undefined} startId={id} />;
}
