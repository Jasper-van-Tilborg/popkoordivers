"use server";

import { revalidatePath } from "next/cache";
import { requireBeheer } from "@/lib/auth";
import { logActiviteit } from "@/lib/activiteit";
import { deleteFile } from "@/lib/r2";

export interface PersoonInput {
  id?: number;      // bestaande persoon; zonder id wordt hij toegevoegd
  naam: string;
  functie: string;
  foto_key?: string | null;   // alleen in het smoelenboek
}

export interface GroepInput {
  naam: string;
  soort: "commissie" | "overig";   // het bestuur en het smoelenboek blijven wat ze zijn
  toelichting: string;
  contactpersoon_id: number | null;
  leden: PersoonInput[];
}

function vernieuw() {
  revalidatePath("/admin/organisatie");
  revalidatePath("/leden", "layout");
}

// Slaat een groep op met al zijn mensen in de getoonde volgorde. Bestaande mensen
// houden hun id, zodat een contactpersoon in het bestuur gekoppeld blijft.
export async function bewaarGroep(id: number | null, input: GroepInput) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const naam = input.naam.trim();
  if (!naam) return { error: "Geef de groep een naam." };
  const leden = input.leden.map((l) => ({ ...l, naam: l.naam.trim(), functie: l.functie.trim() })).filter((l) => l.naam);

  const { data: huidig } = id ? await supabase.from("groepen").select("soort").eq("id", id).single() : { data: null };
  if (id && !huidig) return { error: "Deze groep bestaat niet meer." };
  // Het bestuur en het smoelenboek zijn vaste groepen: geen andere soort, geen contactpersoon
  const isVast = huidig?.soort === "bestuur" || huidig?.soort === "smoelenboek";
  // Het smoelenboek staat op alfabet
  if (huidig?.soort === "smoelenboek") leden.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));

  const velden = {
    naam,
    toelichting: input.toelichting.trim() || null,
    contactpersoon_id: isVast ? null : input.contactpersoon_id,
    ...(isVast ? {} : { soort: input.soort }),
  };

  let groepId = id;
  if (groepId) {
    const { error } = await supabase.from("groepen").update(velden).eq("id", groepId);
    if (error) return { error: error.message };
  } else {
    const { data: laatste } = await supabase.from("groepen").select("volgorde").eq("soort", input.soort).order("volgorde", { ascending: false }).limit(1);
    const { data, error } = await supabase.from("groepen").insert({ ...velden, volgorde: (laatste?.[0]?.volgorde ?? 0) + 1 }).select("id").single();
    if (error) return { error: error.message };
    groepId = data.id;
  }

  // Wie er niet meer in staat eruit; de rest bijwerken of toevoegen
  const { data: bestaand } = await supabase.from("groepsleden").select("id, foto_key").eq("groep_id", groepId);
  // Een foto is een nieuwe upload, of de foto die al bij deze groep hoort
  const eigen = new Set((bestaand ?? []).map((b) => b.foto_key).filter(Boolean));
  const isSmoelenboek = huidig?.soort === "smoelenboek";
  if (leden.some((l) => l.foto_key && !l.foto_key.startsWith("smoelenboek/") && !eigen.has(l.foto_key))) return { error: "Ongeldige foto." };
  const blijft = new Set(leden.filter((l) => l.id).map((l) => l.id));
  const weg = (bestaand ?? []).map((b) => b.id).filter((b) => !blijft.has(b));
  if (weg.length) {
    const { error } = await supabase.from("groepsleden").delete().in("id", weg);
    if (error) return { error: error.message };
  }
  for (const [volgorde, l] of leden.entries()) {
    const rij = { naam: l.naam, functie: l.functie || null, volgorde, ...(isSmoelenboek ? { foto_key: l.foto_key ?? null } : {}) };
    const { error } = l.id
      ? await supabase.from("groepsleden").update(rij).eq("id", l.id).eq("groep_id", groepId)
      : await supabase.from("groepsleden").insert({ ...rij, groep_id: groepId });
    if (error) return { error: error.message };
  }

  // Foto's die niemand meer gebruikt (persoon weg of andere foto) uit de opslag
  if (isSmoelenboek) {
    const inGebruik = new Set(leden.map((l) => l.foto_key).filter(Boolean));
    await Promise.all([...eigen].filter((k) => !inGebruik.has(k)).map((k) => deleteFile("prive", k!).catch(() => {})));
  }

  await logActiviteit(sessie, id ? "gewijzigd" : "aangemaakt", "groep", { id: groepId, naam });
  vernieuw();
  return { id: groepId };
}

export async function verwijderGroep(id: number) {
  const sessie = await requireBeheer();
  const { supabase } = sessie;
  const { data: groep } = await supabase.from("groepen").select("naam, soort").eq("id", id).single();
  if (groep?.soort === "bestuur") return { error: "Het bestuur kan niet worden verwijderd." };
  if (groep?.soort === "smoelenboek") return { error: "Het smoelenboek kan niet worden verwijderd." };
  const { error } = await supabase.from("groepen").delete().eq("id", id);
  if (error) return { error: error.message };
  await logActiviteit(sessie, "verwijderd", "groep", { naam: groep?.naam });
  vernieuw();
  return {};
}

// Een commissie een plek omhoog of omlaag in de lijst
export async function verplaatsGroep(id: number, richting: -1 | 1) {
  const { supabase } = await requireBeheer();
  const { data } = await supabase.from("groepen").select("id, soort, volgorde").in("soort", ["commissie", "overig"]).order("volgorde").order("id");
  // Commissies eerst, dan de overige taken (zoals in de admin en de ledenomgeving)
  const lijst = (data ?? []).sort((a, b) => Number(a.soort === "overig") - Number(b.soort === "overig") || a.volgorde - b.volgorde);
  const i = lijst.findIndex((g) => g.id === id);
  const j = i + richting;
  if (i < 0 || j < 0 || j >= lijst.length || lijst[i].soort !== lijst[j].soort) return {};
  [lijst[i], lijst[j]] = [lijst[j], lijst[i]];
  // Opnieuw nummeren, zodat gelijke nummers geen rol meer spelen
  for (const [n, g] of lijst.entries()) {
    if (g.volgorde !== n + 1) await supabase.from("groepen").update({ volgorde: n + 1 }).eq("id", g.id);
  }
  vernieuw();
  return {};
}
