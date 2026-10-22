"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
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
  revalidatePath("/admin/bestanden");
  revalidatePath("/leden");
}

export async function bestandToevoegen(key: string, input: BestandInput) {
  const { supabase } = await requireAdmin();
  const fout = controleer(input) ?? (key.startsWith("bestanden/") ? null : "Ongeldig bestand.");
  if (fout) return { error: fout };

  const { error } = await supabase.from("bestanden").insert({
    naam: input.naam.trim(),
    categorie: input.categorie,
    stemgroep: input.categorie === "liedjes" ? input.stemgroep : null,
    r2_key: key,
  });
  if (error) {
    await deleteFile("prive", key).catch(() => {});
    return { error: error.message };
  }
  vernieuw();
  return {};
}

export async function wijzigBestand(id: number, input: BestandInput) {
  const { supabase } = await requireAdmin();
  const fout = controleer(input);
  if (fout) return { error: fout };

  const { error } = await supabase.from("bestanden").update({
    naam: input.naam.trim(),
    categorie: input.categorie,
    stemgroep: input.categorie === "liedjes" ? input.stemgroep : null,
  }).eq("id", id);
  if (error) return { error: error.message };
  vernieuw();
  return {};
}

export async function verwijderBestand(id: number) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("bestanden").select("r2_key").eq("id", id).single();
  const { error } = await supabase.from("bestanden").delete().eq("id", id);
  if (error) return { error: error.message };
  if (data?.r2_key) await deleteFile("prive", data.r2_key).catch(() => {});
  vernieuw();
  return {};
}
