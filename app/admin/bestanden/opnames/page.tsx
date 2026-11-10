import { createClient } from "@/lib/supabase/server";
import OpnamesClient from "./OpnamesClient";

export default async function OpnamesPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const { nieuw, id } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bestanden")
    .select("id, naam, stemgroep, liednummer, r2_key, created_at")
    .eq("categorie", "opnames");

  // Alleen de lijst; een link om te luisteren of downloaden komt pas bij het klikken
  const opnames = (data ?? []).map(({ r2_key, ...o }) => ({ ...o, ext: r2_key.split(".").pop()!.toLowerCase() }));

  return <OpnamesClient opnames={opnames} loadError={error?.message} startNieuw={nieuw !== undefined} startId={id ? Number(id) : undefined} />;
}
