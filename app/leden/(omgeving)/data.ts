import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { huidigeSessie } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { downloadUrl } from "@/lib/r2";
import type { Database } from "@/lib/database.types";
import { WEERGAVE_COOKIE, type Weergave } from "./weergave";

// Gedeeld door de pagina's van de ledenomgeving.

export type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];
export const STEMGROEPEN: Stemgroep[] = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas"];

// Wie er ingelogd is; één keer per verzoek, ook als layout en pagina het allebei vragen.
export const sessie = cache(async () => {
  const s = await huidigeSessie();
  if (!s) redirect("/leden/login");
  return { ...s, rol: s.rol ?? "lid" };
});

// Voor de gegevens van een pagina: niet wachten op het profiel. Wie niet is
// ingelogd, komt hier niet (proxy.ts), en de database laat alleen leden lezen (RLS).
export const db = cache(createClient);

// Bestanden uit de ledenomgeving, nieuwste eerst, met een tijdelijke link (1 uur geldig).
export async function bestanden(categorieen: string[], limiet?: number) {
  const supabase = await db();
  let q = supabase
    .from("bestanden")
    .select("id, naam, categorie, stemgroep, r2_key, created_at")
    .in("categorie", categorieen)
    .order("created_at", { ascending: false });
  if (limiet) q = q.limit(limiet);
  const { data } = await q;
  return Promise.all((data ?? []).map(async ({ r2_key, ...b }) => ({ ...b, url: await downloadUrl(r2_key) })));
}

// Alleen de lijst, zonder links: bij honderden opnames haalt de pagina een link
// pas op als iemand een bestand opent (bestandUrl in actions.ts).
export async function bestandenLijst(categorieen: string[]) {
  const supabase = await db();
  const { data } = await supabase
    .from("bestanden")
    .select("id, naam, stemgroep, liednummer, r2_key")
    .in("categorie", categorieen)
    .order("naam");
  return (data ?? []).map(({ r2_key, ...b }) => ({ ...b, ext: r2_key.split(".").pop()!.toLowerCase() }));
}

export const weergave = cache(async (): Promise<Weergave> =>
  (await cookies()).get(WEERGAVE_COOKIE)?.value === "normaal" ? "normaal" : "groot");

export function initialen(naam: string) {
  const delen = naam.split(/\s+/).filter((w) => w && w[0] === w[0].toUpperCase());
  return (delen.map((w) => w[0]).join("") || naam.slice(0, 2)).slice(0, 2).toUpperCase();
}
