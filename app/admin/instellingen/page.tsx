import { createClient } from "@/lib/supabase/server";
import { STANDAARD } from "@/lib/instellingen-standaard";
import InstellingenClient from "./InstellingenClient";

export default async function InstellingenPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("website_instellingen")
    .select("repetitie_dag, repetitie_tijd, repetitie_locatie, repetitie_adres, email, facebook, instagram, youtube, sponsorkliks, updated_at")
    .eq("id", 1)
    .single();

  const { updated_at, ...waarden } = data ?? { ...STANDAARD, updated_at: null };
  return <InstellingenClient initial={waarden} bijgewerkt={updated_at} />;
}
