import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { STANDAARD, type Instellingen } from "@/lib/instellingen-standaard";

export { STANDAARD, type Instellingen };

// Openbare gegevens: zonder cookies opgehaald, zodat pagina's statisch kunnen blijven.
// Na opslaan in de admin ververst revalidatePath("/", "layout") alle pagina's.
export const getInstellingen = cache(async (): Promise<Instellingen> => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data } = await supabase
    .from("website_instellingen")
    .select("repetitie_dag, repetitie_tijd, repetitie_locatie, repetitie_adres, email, facebook, instagram, youtube, sponsorkliks")
    .eq("id", 1)
    .single();
  return data ?? STANDAARD;
});
