"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { Instellingen } from "@/lib/instellingen-standaard";

export async function bewaarInstellingen(input: Instellingen) {
  const { supabase } = await requireAdmin();

  const schoon = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, String(v ?? "").trim()])) as Instellingen;
  if (!schoon.repetitie_dag || !schoon.repetitie_tijd || !schoon.repetitie_locatie) return { error: "Vul dag, tijd en locatie van de repetities in." };
  if (!/^\S+@\S+\.\S+$/.test(schoon.email)) return { error: "Vul een geldig e-mailadres in." };
  for (const k of ["facebook", "instagram", "youtube", "sponsorkliks"] as const) {
    if (schoon[k] && !/^https?:\/\//.test(schoon[k])) return { error: `De link bij ${k} moet beginnen met https://` };
  }

  const { error } = await supabase
    .from("website_instellingen")
    .update({ ...schoon, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/", "layout"); // alle pagina's tonen de nieuwe gegevens
  return {};
}
