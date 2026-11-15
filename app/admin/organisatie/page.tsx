import { createClient } from "@/lib/supabase/server";
import { downloadUrl } from "@/lib/r2";
import OrganisatieClient, { type Groep } from "./OrganisatieClient";

const SOORTEN = ["bestuur", "smoelenboek", "commissie", "overig"];

export default async function OrganisatiePage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const { nieuw, id } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groepen")
    .select("id, naam, soort, toelichting, contactpersoon_id, volgorde, leden:groepsleden!groepsleden_groep_id_fkey(id, naam, functie, volgorde, foto_key)")
    .order("volgorde")
    .order("id");

  // Foto's (smoelenboek) staan in de privé bucket: tijdelijke links
  const groepen: Groep[] = await Promise.all((data ?? [])
    .sort((a, b) => SOORTEN.indexOf(a.soort) - SOORTEN.indexOf(b.soort) || a.volgorde - b.volgorde)
    .map(async (g) => ({
      ...g,
      leden: await Promise.all([...g.leden].sort((a, b) => a.volgorde - b.volgorde)
        .map(async (l) => ({ ...l, foto: l.foto_key ? await downloadUrl(l.foto_key) : null }))),
    })));

  return <OrganisatieClient groepen={groepen} loadError={error?.message} startNieuw={nieuw !== undefined} startId={id} />;
}
