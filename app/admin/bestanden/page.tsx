import { createClient } from "@/lib/supabase/server";
import { downloadUrl } from "@/lib/r2";
import BestandenClient from "./BestandenClient";

export default async function BestandenAdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bestanden")
    .select("id, naam, categorie, stemgroep, r2_key, created_at")
    .order("created_at", { ascending: false });

  const items = await Promise.all((data ?? []).map(async ({ r2_key, ...b }) => ({
    ...b,
    url: r2_key ? await downloadUrl(r2_key) : null,
  })));

  return <BestandenClient items={items} loadError={error?.message} />;
}
