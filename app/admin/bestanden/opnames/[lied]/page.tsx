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
    .select("id, naam, stemgroep, liednummer, r2_key, created_at")
    .eq("categorie", "opnames");

  // Alle liedjes: een opname kan naar een ander lied, en een nieuw nummer kan samenvallen
  const liedjes = groepeer((data ?? []).map(({ r2_key, ...o }) => ({ ...o, ext: r2_key.split(".").pop()!.toLowerCase() })));
  // Afhankelijk van de versie komt de parameter al gedecodeerd binnen of niet
  let gedecodeerd = sleutel;
  try { gedecodeerd = decodeURIComponent(sleutel); } catch {}
  const lied = liedjes.find((l) => l.sleutel === sleutel || l.sleutel === gedecodeerd);
  // Een lied zonder opnames bestaat niet meer (alles verplaatst of verwijderd)
  if (!lied) redirect("/admin/bestanden/opnames");

  return <LiedClient lied={lied} liedjes={liedjes} startOpname={opname ? Number(opname) : undefined} />;
}
