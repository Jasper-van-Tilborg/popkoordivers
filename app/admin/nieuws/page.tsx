import { createClient } from "@/lib/supabase/server";
import NieuwsClient from "./NieuwsClient";

export default async function NieuwsAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("berichten")
    .select("id, slug, titel, datum, intro, inhoud, afbeelding, gepubliceerd, created_at")
    .order("created_at", { ascending: false });

  return <NieuwsClient items={data ?? []} loadError={error?.message} />;
}
