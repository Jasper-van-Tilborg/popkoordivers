import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { groepeer } from "../liedjes";
import LiedClient from "./LiedClient";

export default async function LiedPage({ params, searchParams }: {
  params: Promise<{ lied: string }>;
  searchParams: Promise<{ opname?: string }>;
}) {
  const [{ lied: sleutel }, { opname }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("bestanden")
    .select("id, naam, stemgroep, liednummer, r2_key, created_at, datum, opname_versies(id, datum, r2_key)")
    .eq("categorie", "opnames");

  // Alle liedjes: een opname kan naar een ander lied, en een nieuw nummer kan samenvallen
  const ext = (key: string) => key.split(".").pop()!.toLowerCase();
  const liedjes = groepeer((data ?? []).map(({ r2_key, opname_versies, ...o }) => ({
    ...o,
    ext: ext(r2_key),
    versies: opname_versies
      .map((v) => ({ id: v.id, datum: v.datum, ext: ext(v.r2_key) }))
      .sort((a, b) => b.datum.localeCompare(a.datum) || b.id - a.id),
  })));
  // Afhankelijk van de versie komt de parameter al gedecodeerd binnen of niet
  let gedecodeerd = sleutel;
  try { gedecodeerd = decodeURIComponent(sleutel); } catch {}
  const lied = liedjes.find((l) => l.sleutel === sleutel || l.sleutel === gedecodeerd);
  // Een lied zonder opnames bestaat niet meer (alles verplaatst of verwijderd)
  if (!lied) redirect("/admin/bestanden/opnames");

  return <LiedClient lied={lied} liedjes={liedjes} startOpname={opname ? Number(opname) : undefined} />;
}
