"use server";

import mammoth from "mammoth";
import { downloadUrl } from "@/lib/r2";
import { db } from "./data";

// Tijdelijke link naar één bestand. De database geeft alleen ingelogde leden
// iets terug (RLS), dus wie niet is ingelogd krijgt null.
export async function bestandUrl(id: number): Promise<string | null> {
  const supabase = await db();
  const { data } = await supabase.from("bestanden").select("r2_key").eq("id", id).maybeSingle();
  return data ? downloadUrl(data.r2_key) : null;
}

// Hetzelfde, maar om op te slaan: "030 Back It Up Alt Piano.mp3"
export async function bestandDownload(id: number): Promise<string | null> {
  const supabase = await db();
  const { data } = await supabase.from("bestanden").select("r2_key, naam, liednummer").eq("id", id).maybeSingle();
  if (!data) return null;
  const ext = data.r2_key.split(".").pop();
  const naam = [data.liednummer && String(data.liednummer).padStart(3, "0"), data.naam].filter(Boolean).join(" ");
  return downloadUrl(data.r2_key, 3600, `${naam.replace(/[\\/:*?"<>|]/g, "")}.${ext}`);
}

// Een Word-bestand (docx) als tekst om op de site te lezen, zonder te downloaden.
// Opmaak blijft over (kopjes, vet, lijsten); links mogen alleen naar het web of e-mail.
export async function bestandTekst(id: number): Promise<string | null> {
  const supabase = await db();
  const { data } = await supabase.from("bestanden").select("r2_key").eq("id", id).maybeSingle();
  if (!data || !data.r2_key.toLowerCase().endsWith(".docx")) return null;
  const res = await fetch(await downloadUrl(data.r2_key, 60));
  if (!res.ok) return null;
  const { value } = await mammoth.convertToHtml({ buffer: Buffer.from(await res.arrayBuffer()) });
  return value.replace(/href="(?!https?:|mailto:|#)[^"]*"/gi, 'href="#"').replace(/<a href="http/g, '<a target="_blank" rel="noopener" href="http');
}
