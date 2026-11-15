import { redirect } from "next/navigation";
import { laadDocumenten } from "../laden";
import { choreoHref, choreoSleutel, groepeerChoreo } from "./liedjes";
import ChoreoClient from "./ChoreoClient";

export default async function ChoreoPage({ searchParams }: { searchParams: Promise<{ nieuw?: string; id?: string }> }) {
  const [{ nieuw, id }, { items, error }] = await Promise.all([searchParams, laadDocumenten("choreo")]);
  // Een link naar één bestand (activiteit, overzicht): naar de pagina van zijn lied
  const bestand = id ? items.find((d) => d.id === Number(id)) : undefined;
  if (bestand) redirect(choreoHref(choreoSleutel(bestand.liednummer, bestand.naam)));
  return <ChoreoClient liedjes={groepeerChoreo(items)} aantal={items.length} loadError={error} startNieuw={nieuw !== undefined} />;
}
