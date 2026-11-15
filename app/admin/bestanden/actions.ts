"use server";

import { revalidatePath } from "next/cache";
import mammoth from "mammoth";
import { requireBeheer } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import { deleteFile, downloadUrl } from "@/lib/r2";
import type { Database } from "@/lib/database.types";
import { MET_DATUM, MET_LIEDNUMMER, MET_STEMGROEP } from "./categorieen";

type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];

export interface BestandInput {
  naam: string;
  categorie: string;
  stemgroep: Stemgroep | null;
  liednummer: number | null;
  // "2026-11-12", alleen bij nieuwsbrieven en ALV-stukken
  datum: string | null;
}

const CATEGORIEEN = ["opnames", "nieuwsbrieven", "alv", "choreo"];

function controleer(input: BestandInput) {
  if (!input.naam.trim()) return "Geef het bestand een naam.";
  if (!CATEGORIEEN.includes(input.categorie)) return "Kies een categorie.";
  if (input.liednummer !== null && !(Number.isInteger(input.liednummer) && input.liednummer >= 1 && input.liednummer <= 999)) return "Een liednummer is een getal van 1 tot 999.";
  if (MET_DATUM.includes(input.categorie) && !(input.datum && /^\d{4}-\d{2}-\d{2}$/.test(input.datum))) return "Kies een datum.";
  return null;
}

// Alleen de velden die bij de categorie horen
function velden(input: BestandInput) {
  return {
    naam: input.naam.trim(),
    categorie: input.categorie,
    stemgroep: MET_STEMGROEP.includes(input.categorie) ? input.stemgroep : null,
    liednummer: MET_LIEDNUMMER.includes(input.categorie) ? input.liednummer : null,
    datum: MET_DATUM.includes(input.categorie) ? input.datum : null,
  };
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

  const { data, error } = await supabase.from("bestanden").insert({ ...velden(input), r2_key: key }).select("id").single();
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

  const { error } = await supabase.from("bestanden").update(velden(input)).eq("id", id);
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

// Een nieuwe versie van hetzelfde document: het oude bestand gaat weg
export async function vervangBestand(id: number, key: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  if (!key.startsWith("bestanden/")) return { error: "Ongeldig bestand." };
  const { data } = await supabase.from("bestanden").select("r2_key, naam").eq("id", id).single();
  if (!data) {
    await deleteFile("prive", key).catch(() => {});
    return { error: "Dit bestand bestaat niet meer." };
  }
  const { error } = await supabase.from("bestanden").update({ r2_key: key }).eq("id", id);
  if (error) {
    await deleteFile("prive", key).catch(() => {});
    return { error: error.message };
  }
  await deleteFile("prive", data.r2_key).catch(() => {});
  await logActiviteit(sessie, "vervangen", "bestand", { id, naam: data.naam });
  vernieuw();
  return {};
}

// Meerdere bestanden tegelijk weg (een heel choreolied, alle stukken van een ALV)
export async function verwijderBestanden(ids: number[], omschrijving: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data } = await supabase.from("bestanden").select("id, r2_key").in("id", ids).neq("categorie", "opnames");
  if (!data?.length) return {};
  const { error } = await supabase.from("bestanden").delete().in("id", data.map((b) => b.id));
  if (error) return { error: error.message };
  await Promise.all(data.map((b) => deleteFile("prive", b.r2_key).catch(() => {})));
  await logActiviteit(sessie, "verwijderd", "bestand", { naam: omschrijving });
  vernieuw();
  return {};
}

// Een vergadering een andere datum geven: alle stukken van die ALV gaan mee
export async function zetAlvDatum(ids: number[], datum: string) {
  const sessie = await requireBeheer();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return { error: "Kies een datum." };
  const { error } = await sessie.supabase.from("bestanden").update({ datum }).in("id", ids).eq("categorie", "alv");
  if (error) return { error: error.message };
  await logActiviteit(sessie, "gewijzigd", "bestand", { naam: `ALV-stukken (${ids.length})` });
  vernieuw();
  return {};
}

// Een choreolied een ander nummer of een andere titel geven (alle bestanden van dat lied)
export async function wijzigChoreoLied(ids: number[], lied: { liednummer: number | null; naam: string }) {
  const sessie = await requireBeheer();
  const naam = lied.naam.trim();
  if (!naam) return { error: "Geef het lied een titel." };
  if (lied.liednummer !== null && !(Number.isInteger(lied.liednummer) && lied.liednummer >= 1 && lied.liednummer <= 999)) return { error: "Een liednummer is een getal van 1 tot 999." };
  const { error } = await sessie.supabase.from("bestanden").update({ naam, liednummer: lied.liednummer }).in("id", ids).eq("categorie", "choreo");
  if (error) return { error: error.message };
  await logActiviteit(sessie, "gewijzigd", "bestand", { id: ids[0], naam });
  vernieuw();
  return {};
}

// Een Word-bestand als tekst, om in de admin te lezen (null voor andere soorten)
export async function documentTekst(id: number): Promise<string | null> {
  const { supabase } = await requireBeheer();
  const { data } = await supabase.from("bestanden").select("r2_key").eq("id", id).maybeSingle();
  if (!data || !data.r2_key.toLowerCase().endsWith(".docx")) return null;
  const res = await fetch(await downloadUrl(data.r2_key, 60));
  if (!res.ok) return null;
  const { value } = await mammoth.convertToHtml({ buffer: Buffer.from(await res.arrayBuffer()) });
  // Geen links naar buiten vanuit de admin; afbeeldingen blijven ingesloten
  return value.replace(/<a [^>]*>/gi, "").replace(/<\/a>/gi, "");
}

// Tijdelijke link om te bekijken, of (opslaan) om te downloaden onder de naam uit de admin
export async function bestandLink(id: number, opslaan = false) {
  const { supabase } = await requireBeheer();
  const { data } = await supabase.from("bestanden").select("r2_key, naam, liednummer").eq("id", id).maybeSingle();
  if (!data) return null;
  if (!opslaan) return downloadUrl(data.r2_key);
  const ext = data.r2_key.split(".").pop();
  const naam = [data.liednummer && String(data.liednummer).padStart(3, "0"), data.naam].filter(Boolean).join(" ");
  return downloadUrl(data.r2_key, 3600, `${naam.replace(/[\\/:*?"<>|]/g, "")}.${ext}`);
}
