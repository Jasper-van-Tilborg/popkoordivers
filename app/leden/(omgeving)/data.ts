import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { downloadUrl } from "@/lib/r2";
import type { Database } from "@/lib/database.types";

// Gedeeld door de pagina's van de ledenomgeving.

export type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];
export const STEMGROEPEN: Stemgroep[] = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas"];

// Wie er ingelogd is; één keer per verzoek, ook als layout en pagina het allebei vragen.
export const sessie = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/leden/login");
  const { data: profiel } = await supabase.from("profiles").select("naam, rol, stemgroep").eq("id", user.id).single();
  return { supabase, user, rol: profiel?.rol ?? "lid", naam: profiel?.naam ?? null, stemgroep: profiel?.stemgroep ?? null };
});

// Bestanden uit de ledenomgeving, nieuwste eerst, met een tijdelijke link (1 uur geldig).
export async function bestanden(categorieen: string[]) {
  const { supabase } = await sessie();
  const { data } = await supabase
    .from("bestanden")
    .select("id, naam, categorie, stemgroep, r2_key, created_at")
    .in("categorie", categorieen)
    .order("created_at", { ascending: false });
  return Promise.all((data ?? []).filter((b) => b.r2_key).map(async ({ r2_key, ...b }) => ({ ...b, url: await downloadUrl(r2_key!) })));
}

export function initialen(naam: string) {
  const delen = naam.split(/\s+/).filter((w) => w && w[0] === w[0].toUpperCase());
  return (delen.map((w) => w[0]).join("") || naam.slice(0, 2)).slice(0, 2).toUpperCase();
}
