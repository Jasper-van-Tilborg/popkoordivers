"use server";

import { revalidatePath } from "next/cache";
import { requireBeheer } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import { deleteFile, downloadUrl } from "@/lib/r2";
import type { Database } from "@/lib/database.types";

type Stemgroep = Database["public"]["Enums"]["stemgroep_type"];

export interface OpnameInput {
  naam: string;
  stemgroep: Stemgroep | null;
  liednummer: number | null;
}

const STEMGROEPEN: (Stemgroep | null)[] = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas", null];
const UPLOADMAP = "bestanden/opnames/";

function geldigNummer(n: number | null) {
  return n === null || (Number.isInteger(n) && n >= 1 && n <= 999);
}

function controleer(i: OpnameInput) {
  if (!i.naam.trim()) return "Geef elke opname een naam.";
  if (!STEMGROEPEN.includes(i.stemgroep)) return "Kies bij elke opname een stem.";
  if (!geldigNummer(i.liednummer)) return "Een liednummer is een getal van 1 tot 999.";
  return null;
}

function vernieuw() {
  revalidatePath("/admin/bestanden", "layout");
  revalidatePath("/leden", "layout");
}

// Een of meer geüploade bestanden (al in R2) als opnames opslaan
export async function opnamesToevoegen(items: (OpnameInput & { key: string })[], titel: string) {
  const sessie = await requireBeheer();
  const fout = items.length === 0 ? "Kies een bestand."
    : items.map(controleer).find(Boolean) ?? (items.every((i) => i.key.startsWith(UPLOADMAP)) ? null : "Ongeldig bestand.");
  if (fout) return { error: fout };

  const { data, error } = await sessie.supabase.from("bestanden").insert(items.map((i) => ({
    naam: i.naam.trim(),
    categorie: "opnames",
    stemgroep: i.stemgroep,
    liednummer: i.liednummer,
    r2_key: i.key,
  }))).select("id");
  if (error) {
    await Promise.all(items.map((i) => deleteFile("prive", i.key).catch(() => {})));
    return { error: error.message };
  }
  await logActiviteit(sessie, "toegevoegd", "bestand", {
    id: data[0]?.id,
    naam: items.length === 1 ? items[0].naam.trim() : `${titel.trim() || "Opnames"} (${items.length} opnames)`,
  });
  vernieuw();
  return { ids: data.map((d) => d.id) };
}

export async function wijzigOpname(id: number, input: OpnameInput) {
  const sessie = await requireBeheer();
  const fout = controleer(input);
  if (fout) return { error: fout };
  const { error } = await sessie.supabase.from("bestanden")
    .update({ naam: input.naam.trim(), stemgroep: input.stemgroep, liednummer: input.liednummer })
    .eq("id", id).eq("categorie", "opnames");
  if (error) return { error: error.message };
  await logActiviteit(sessie, "gewijzigd", "bestand", { id, naam: input.naam.trim() });
  vernieuw();
  return {};
}

// Een nieuwe versie van dezelfde opname: het oude bestand gaat weg
export async function vervangOpname(id: number, key: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  if (!key.startsWith(UPLOADMAP)) return { error: "Ongeldig bestand." };
  const { data } = await supabase.from("bestanden").select("r2_key, naam").eq("id", id).eq("categorie", "opnames").single();
  if (!data) {
    await deleteFile("prive", key).catch(() => {});
    return { error: "Deze opname bestaat niet meer." };
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

export async function verwijderOpnames(ids: number[], titel?: string) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data } = await supabase.from("bestanden").select("id, r2_key, naam").in("id", ids).eq("categorie", "opnames");
  const { error } = await supabase.from("bestanden").delete().in("id", ids).eq("categorie", "opnames");
  if (error) return { error: error.message };
  await Promise.all((data ?? []).map((b) => deleteFile("prive", b.r2_key).catch(() => {})));
  await logActiviteit(sessie, "verwijderd", "bestand", {
    naam: data?.length === 1 ? data[0].naam : `${titel ?? "Opnames"} (${data?.length ?? 0} opnames)`,
  });
  vernieuw();
  return {};
}

// Een heel lied een ander nummer of een andere titel geven. De titel staat
// vooraan in de naam van elke opname ("Back It Up Alt Band") en verandert mee.
export async function wijzigLied(ids: number[], wijziging: { liednummer: number | null; oudeTitel: string; titel: string }) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const titel = wijziging.titel.trim();
  if (!titel) return { error: "Geef het lied een titel." };
  if (!geldigNummer(wijziging.liednummer)) return { error: "Een liednummer is een getal van 1 tot 999." };

  const { data, error } = await supabase.from("bestanden").select("id, naam").in("id", ids).eq("categorie", "opnames");
  if (error) return { error: error.message };
  const oud = wijziging.oudeTitel.trim();
  const fouten = await Promise.all(data.map(async (b) => {
    const naam = oud && b.naam.toLowerCase().startsWith(oud.toLowerCase()) ? titel + b.naam.slice(oud.length) : b.naam;
    const { error } = await supabase.from("bestanden").update({ naam, liednummer: wijziging.liednummer }).eq("id", b.id);
    return error?.message;
  }));
  vernieuw();
  const fout = fouten.find(Boolean);
  if (fout) return { error: fout };
  await logActiviteit(sessie, "gewijzigd", "bestand", { id: ids[0], naam: titel });
  return {};
}

// Tijdelijke link om te luisteren, of (opslaan) om te downloaden als "030 Back It Up Alt Band.mp3"
export async function opnameLink(id: number, opslaan = false) {
  const { supabase } = await requireBeheer();
  const { data } = await supabase.from("bestanden").select("r2_key, naam, liednummer").eq("id", id).maybeSingle();
  if (!data) return null;
  if (!opslaan) return downloadUrl(data.r2_key);
  const ext = data.r2_key.split(".").pop();
  const naam = [data.liednummer && String(data.liednummer).padStart(3, "0"), data.naam].filter(Boolean).join(" ");
  return downloadUrl(data.r2_key, 3600, `${naam.replace(/[\\/:*?"<>|]/g, "")}.${ext}`);
}
