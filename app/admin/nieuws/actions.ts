"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteFile, getPublicUrl, keyFromPublicUrl } from "@/lib/r2";

export interface BerichtInput {
  titel: string;
  datumIso: string;           // "2026-10-22"
  datum: string;              // "22 oktober 2026"
  categorie: string;
  intro: string;
  inhoud: string;
  gepubliceerd: boolean;
  nieuweAfbeeldingKey: string | null;
  afbeeldingWeg: boolean;
}

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "bericht";
}

async function verwijderAfbeelding(url: string | null) {
  const key = url ? keyFromPublicUrl(url) : null;
  if (key) await deleteFile("openbaar", key).catch(() => {});
}

function vernieuw() {
  revalidatePath("/admin/nieuws");
  revalidatePath("/nieuws", "layout");
}

export async function bewaarBericht(id: number | null, input: BerichtInput) {
  const { supabase } = await requireAdmin();
  if (!input.titel.trim() || !input.intro.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.datumIso)) {
    return { error: "Titel, datum en introductie zijn verplicht." };
  }
  if (input.nieuweAfbeeldingKey && !input.nieuweAfbeeldingKey.startsWith("nieuws/")) {
    return { error: "Ongeldige afbeelding." };
  }

  const huidig = id
    ? (await supabase.from("berichten").select("afbeelding").eq("id", id).single()).data
    : null;

  let afbeelding = huidig?.afbeelding ?? "";
  if (input.nieuweAfbeeldingKey) afbeelding = getPublicUrl(input.nieuweAfbeeldingKey);
  else if (input.afbeeldingWeg) afbeelding = "";

  const velden = {
    titel: input.titel.trim(),
    datum: input.datum,
    intro: input.intro.trim(),
    inhoud: input.inhoud.trim(),
    afbeelding,
    categorie: input.categorie.trim() || "Nieuws",
    gepubliceerd: input.gepubliceerd,
    created_at: `${input.datumIso}T12:00:00Z`,
  };

  if (id) {
    const { error } = await supabase.from("berichten").update(velden).eq("id", id);
    if (error) return { error: error.message };
  } else {
    // Uniek webadres op basis van de titel
    const basis = slugify(input.titel);
    const { data: bestaand } = await supabase.from("berichten").select("slug").like("slug", `${basis}%`);
    const bezet = new Set((bestaand ?? []).map((b) => b.slug));
    let slug = basis;
    for (let n = 2; bezet.has(slug); n++) slug = `${basis}-${n}`;

    const { error } = await supabase.from("berichten").insert({ ...velden, slug });
    if (error) return { error: error.message };
  }

  if (huidig && huidig.afbeelding !== afbeelding) await verwijderAfbeelding(huidig.afbeelding);
  vernieuw();
  return {};
}

export async function verwijderBericht(id: number) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("berichten").select("afbeelding").eq("id", id).single();
  const { error } = await supabase.from("berichten").delete().eq("id", id);
  if (error) return { error: error.message };
  await verwijderAfbeelding(data?.afbeelding ?? null);
  vernieuw();
  return {};
}

export async function zetBerichtZichtbaar(id: number, gepubliceerd: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("berichten").update({ gepubliceerd }).eq("id", id);
  if (error) return { error: error.message };
  vernieuw();
  return {};
}
