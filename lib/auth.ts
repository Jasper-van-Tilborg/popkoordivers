import { createClient } from "@/lib/supabase/server";

// Gebruik in elke server action en route van de admin: server functions zijn
// ook rechtstreeks via een POST bereikbaar, dus de check moet in de functie zelf.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Niet ingelogd");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  if (profile?.rol !== "admin") throw new Error("Geen toegang");

  return { supabase, user };
}
