"use server";

import { revalidatePath } from "next/cache";
import { requireBeheer } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import type { TablesInsert } from "@/lib/database.types";

export type AgendaInput = Pick<
  TablesInsert<"agenda">,
  "titel" | "datum" | "datum_sorteer" | "tijd" | "locatie" | "beschrijving" | "link" | "fotos_url" | "gepubliceerd"
>;

function vernieuw() {
  revalidatePath("/admin/agenda");
  revalidatePath("/agenda", "layout");
  revalidatePath("/");
}

export async function bewaarOptreden(id: number | null, input: AgendaInput) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  if (!input.titel?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.datum_sorteer ?? "")) {
    return { error: "Titel en datum zijn verplicht." };
  }

  if (id) {
    const { error } = await supabase.from("agenda").update(input).eq("id", id);
    if (error) return { error: error.message };
    await logActiviteit(sessie, "gewijzigd", "optreden", { id, naam: input.titel });
    vernieuw();
    return { id };
  }
  const { data, error } = await supabase.from("agenda").insert(input).select("id").single();
  if (error) return { error: error.message };
  await logActiviteit(sessie, "aangemaakt", "optreden", { id: data.id, naam: input.titel });
  vernieuw();
  return { id: data.id };
}

export async function verwijderOptreden(id: number) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: oud } = await supabase.from("agenda").select("titel").eq("id", id).single();
  const { error } = await supabase.from("agenda").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActiviteit(sessie, "verwijderd", "optreden", { id, naam: oud?.titel });
  vernieuw();
  return {};
}
