import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Oude en algemene links (/admin/bestanden, ?id=, ?nieuw) naar de pagina van de juiste categorie.
export default async function BestandenPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const { nieuw, id } = await searchParams;
  if (id) {
    const supabase = await createClient();
    const { data } = await supabase.from("bestanden").select("categorie").eq("id", Number(id)).single();
    redirect(`/admin/bestanden/${data?.categorie ?? "opnames"}?id=${id}`);
  }
  redirect(`/admin/bestanden/opnames${nieuw !== undefined ? "?nieuw" : ""}`);
}
