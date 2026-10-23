"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
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
  const { supabase } = await requireAdmin();
  if (!input.titel?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.datum_sorteer ?? "")) {
    return { error: "Titel en datum zijn verplicht." };
  }

  if (id) {
    const { error } = await supabase.from("agenda").update(input).eq("id", id);
    if (error) return { error: error.message };
    vernieuw();
    return { id };
  }
  const { data, error } = await supabase.from("agenda").insert(input).select("id").single();
  if (error) return { error: error.message };
  vernieuw();
  return { id: data.id };
}

export async function verwijderOptreden(id: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("agenda").delete().eq("id", id);
  if (error) return { error: error.message };
  vernieuw();
  return {};
}
