"use server";

import { revalidatePath } from "next/cache";
import { requireBeheer } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import { deleteFile } from "@/lib/r2";
import type { Database } from "@/lib/database.types";

type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];

export interface BestandInput {
  naam: string;
  categorie: string;
  stemgroep: Stemgroep | null;
}

const CATEGORIEEN = ["liedjes", "nieuwsbrieven", "alv", "opnames", "choreo"];

function controleer(input: BestandInput) {
  if (!input.naam.trim()) return "Geef het bestand een naam.";
  if (!CATEGORIEEN.includes(input.categorie)) return "Kies een categorie.";
  return null;
}

function vernieuw() {
  revalidatePath("/admin/bestanden", "layout");
  revalidatePath("/leden", "layout");
}

export async function bestandToevoegen(key: string, input: BestandInput) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const fout = controleer(input) ?? (key.startsWith("bestanden/") ? null : "Ongeldig bestand.");
  if (fout) return { error: fout };

  const { data, error } = await supabase.from("bestanden").insert({
    naam: input.naam.trim(),
    categorie: input.categorie,
    stemgroep: input.categorie === "liedjes" ? input.stemgroep : null,
    r2_key: key,
  }).select("id").single();
  if (error) {
    await deleteFile("prive", key).catch(() => {});
    return { error: error.message };
  }
  await logActiviteit(sessie, "toegevoegd", "bestand", { id: data.id, naam: input.naam.trim() });
  vernieuw();
  return { id: data.id };
}

export async function wijzigBestand(id: number, input: BestandInput) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const fout = controleer(input);
  if (fout) return { error: fout };

  const { error } = await supabase.from("bestanden").update({
    naam: input.naam.trim(),
    categorie: input.categorie,
    stemgroep: input.categorie === "liedjes" ? input.stemgroep : null,
  }).eq("id", id);
  if (error) return { error: error.message };
  await logActiviteit(sessie, "gewijzigd", "bestand", { id, naam: input.naam.trim() });
  vernieuw();
  return {};
}

export async function verwijderBestand(id: number) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data } = await supabase.from("bestanden").select("r2_key, naam").eq("id", id).single();
  const { error } = await supabase.from("bestanden").delete().eq("id", id);
  if (error) return { error: error.message };
  if (data?.r2_key) await deleteFile("prive", data.r2_key).catch(() => {});
  await logActiviteit(sessie, "verwijderd", "bestand", { id, naam: data?.naam });
  vernieuw();
  return {};
}
