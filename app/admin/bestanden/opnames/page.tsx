import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { liedHref, sleutelVoor, titelVan } from "./liedjes";
import OpnamesClient from "./OpnamesClient";

export default async function OpnamesPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const { nieuw, id } = await searchParams;
  const supabase = await createClient();

  // Een oude link naar één opname (activiteit, overzicht): naar de pagina van zijn lied
  if (id) {
    const { data: o } = await supabase.from("bestanden").select("naam, liednummer").eq("id", Number(id)).eq("categorie", "opnames").maybeSingle();
    if (o) redirect(`${liedHref(sleutelVoor(o.liednummer, titelVan(o.naam)))}?opname=${id}`);
  }

  const { data, error } = await supabase
    .from("bestanden")
    .select("id, naam, stemgroep, liednummer, r2_key, created_at, datum")
    .eq("categorie", "opnames");

  // Alleen de lijst; een link om te luisteren of downloaden komt pas bij het klikken
  const opnames = (data ?? []).map(({ r2_key, ...o }) => ({ ...o, ext: r2_key.split(".").pop()!.toLowerCase() }));

  return <OpnamesClient opnames={opnames} loadError={error?.message} startNieuw={nieuw !== undefined} />;
}
