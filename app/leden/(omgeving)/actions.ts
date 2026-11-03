"use server";

import { downloadUrl } from "@/lib/r2";
import { db } from "./data";

// Tijdelijke link naar één bestand. De database geeft alleen ingelogde leden
// iets terug (RLS), dus wie niet is ingelogd krijgt null.
export async function bestandUrl(id: number): Promise<string | null> {
  const supabase = await db();
  const { data } = await supabase.from("bestanden").select("r2_key").eq("id", id).maybeSingle();
  return data ? downloadUrl(data.r2_key) : null;
}
