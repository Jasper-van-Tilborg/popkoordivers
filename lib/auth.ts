import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type Rol = Database["public"]["Enums"]["user_rol"];

// Drie niveaus:
// - lid:       de ledenomgeving
// - redacteur: in de admin de inhoud beheren (agenda, nieuws, media, bestanden)
// - admin:     alles, ook leden, instellingen, sitestatus en activiteit
export const magBeheren = (rol: Rol | null | undefined) => rol === "admin" || rol === "redacteur";

// Wie er ingelogd is, één keer per verzoek: layout en pagina delen het antwoord.
// getClaims controleert het token lokaal met de publieke sleutel van Supabase
// (ES256), zonder bij elke pagina eerst Supabase te bellen zoals getUser doet.
export const huidigeSessie = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims.sub;
  if (!id) return null;
  const { data: profiel } = await supabase.from("profiles").select("rol, naam, stemgroep").eq("id", id).single();
  return {
    supabase,
    user: { id, email: typeof data.claims.email === "string" ? data.claims.email : null },
    rol: profiel?.rol ?? null,
    naam: profiel?.naam ?? null,
    stemgroep: profiel?.stemgroep ?? null,
  };
});

async function ingelogd() {
  const sessie = await huidigeSessie();
  if (!sessie) throw new Error("Niet ingelogd");
  return { ...sessie, naam: sessie.naam ?? sessie.user.email ?? "Onbekend" };
}

// Gebruik in elke server action van de admin: server functions zijn ook
// rechtstreeks via een POST bereikbaar, dus de check moet in de functie zelf.
export async function requireBeheer() {
  const sessie = await ingelogd();
  if (!magBeheren(sessie.rol)) throw new Error("Geen toegang");
  return sessie;
}

export async function requireAdmin() {
  const sessie = await ingelogd();
  if (sessie.rol !== "admin") throw new Error("Geen toegang");
  return sessie;
}
