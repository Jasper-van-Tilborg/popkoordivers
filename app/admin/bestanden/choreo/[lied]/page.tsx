import { redirect } from "next/navigation";
import { bestandLink, documentTekst } from "../../actions";
import { laadDocumenten } from "../../laden";
import { groepeerChoreo } from "../liedjes";
import ChoreoLiedClient from "./ChoreoLiedClient";

export default async function ChoreoLiedPage({ params }: { params: Promise<{ lied: string }> }) {
  const [{ lied: sleutel }, { items }] = await Promise.all([params, laadDocumenten("choreo")]);
  const liedjes = groepeerChoreo(items);
  // Afhankelijk van de versie komt de parameter al gedecodeerd binnen of niet
  let gedecodeerd = sleutel;
  try { gedecodeerd = decodeURIComponent(sleutel); } catch {}
  const lied = liedjes.find((l) => l.sleutel === sleutel || l.sleutel === gedecodeerd);
  // Een lied zonder bestanden bestaat niet meer
  if (!lied) redirect("/admin/bestanden/choreo");

  // De video om meteen te bekijken, de beschrijving als tekst
  const [videos, teksten] = await Promise.all([
    Promise.all(lied.videos.map(async (d) => [d.id, await bestandLink(d.id).catch(() => null)] as const)),
    Promise.all(lied.beschrijvingen.map(async (d) => [d.id, await documentTekst(d.id).catch(() => null)] as const)),
  ]);

  return (
    <ChoreoLiedClient
      lied={lied}
      liedjes={liedjes}
      videoUrls={Object.fromEntries(videos)}
      teksten={Object.fromEntries(teksten)}
    />
  );
}
