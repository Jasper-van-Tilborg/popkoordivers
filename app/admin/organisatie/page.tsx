import { createClient } from "@/lib/supabase/server";
import OrganisatieClient, { type Groep } from "./OrganisatieClient";

export default async function OrganisatiePage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const { nieuw, id } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groepen")
    .select("id, naam, soort, toelichting, contactpersoon_id, volgorde, leden:groepsleden!groepsleden_groep_id_fkey(id, naam, functie, volgorde)")
    .order("volgorde")
    .order("id");

  const groepen: Groep[] = (data ?? [])
    .sort((a, b) => ["bestuur", "commissie", "overig"].indexOf(a.soort) - ["bestuur", "commissie", "overig"].indexOf(b.soort) || a.volgorde - b.volgorde)
    .map((g) => ({ ...g, leden: [...g.leden].sort((a, b) => a.volgorde - b.volgorde) }));

  return <OrganisatieClient groepen={groepen} loadError={error?.message} startNieuw={nieuw !== undefined} startId={id} />;
}
