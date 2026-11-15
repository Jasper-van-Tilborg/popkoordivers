import { createClient } from "@/lib/supabase/server";
import type { Document } from "./documenten";

// De lijst van één categorie; een link om te bekijken of downloaden komt pas bij het klikken
export async function laadDocumenten(categorie: "choreo" | "nieuwsbrieven" | "alv") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bestanden")
    .select("id, naam, liednummer, datum, r2_key, created_at")
    .eq("categorie", categorie);
  const items: Document[] = (data ?? []).map(({ r2_key, ...b }) => ({ ...b, ext: r2_key.split(".").pop()!.toLowerCase() }));
  return { items, error: error?.message };
}
