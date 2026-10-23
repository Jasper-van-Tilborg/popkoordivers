import { createAdminClient } from "@/lib/supabase/admin";

export type Soort = "optreden" | "bericht" | "album" | "foto" | "bestand" | "lid" | "instellingen";

// Legt vast wie wat deed in de admin (te zien op het overzicht van admins).
// Mislukt dit, dan gaat de wijziging zelf gewoon door.
export async function logActiviteit(
  wie: { user: { id: string }; naam: string },
  actie: string,
  soort: Soort,
  item?: { id?: string | number | null; naam?: string | null },
) {
  await createAdminClient().from("activiteit").insert({
    wie: wie.user.id,
    wie_naam: wie.naam,
    actie,
    soort,
    item_id: item?.id != null ? String(item.id) : null,
    item_naam: item?.naam ?? null,
  }).then(() => {}, () => {});
}
