import { createClient } from "@/lib/supabase/server";
import AgendaClient from "./AgendaClient";

export default async function AgendaAdminPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const { nieuw, id } = await searchParams;
  const supabase = await createClient();
  const [agenda, albums] = await Promise.all([
    supabase
      .from("agenda")
      .select("id, titel, datum, datum_sorteer, tijd, locatie, beschrijving, link, fotos_url, gepubliceerd")
      .order("datum_sorteer", { ascending: true, nullsFirst: false }),
    supabase.from("albums").select("slug, titel").order("created_at", { ascending: false }),
  ]);

  return <AgendaClient items={agenda.data ?? []} albums={albums.data ?? []} loadError={agenda.error?.message} startNieuw={nieuw !== undefined} startId={id} />;
}
