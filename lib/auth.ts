import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type Rol = Database["public"]["Enums"]["user_rol"];

// Drie niveaus:
// - lid:       de ledenomgeving
// - redacteur: in de admin de inhoud beheren (agenda, nieuws, media, bestanden)
// - admin:     alles, ook leden, instellingen, sitestatus en activiteit
export const magBeheren = (rol: Rol | null | undefined) => rol === "admin" || rol === "redacteur";

async function ingelogd() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");
  const { data: profiel } = await supabase.from("profiles").select("rol, naam").eq("id", user.id).single();
  return { supabase, user, rol: profiel?.rol ?? null, naam: profiel?.naam ?? user.email ?? "Onbekend" };
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
