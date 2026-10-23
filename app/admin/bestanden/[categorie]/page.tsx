import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { downloadUrl } from "@/lib/r2";
import { categorie as vind } from "../categorieen";
import BestandenClient from "../BestandenClient";

export default async function CategoriePage({ params, searchParams }: {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ nieuw?: string; id?: string }>;
}) {
  const [{ categorie }, { nieuw, id }] = await Promise.all([params, searchParams]);
  const cat = vind(categorie);
  if (!cat) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bestanden")
    .select("id, naam, categorie, stemgroep, r2_key, created_at")
    .eq("categorie", cat.id)
    .order("created_at", { ascending: false });

  const items = await Promise.all((data ?? []).map(async ({ r2_key, ...b }) => ({
    ...b,
    url: r2_key ? await downloadUrl(r2_key) : null,
  })));

  return <BestandenClient categorie={cat.id} items={items} loadError={error?.message} startNieuw={nieuw !== undefined} startId={id} />;
}
