import type { ReactNode } from "react";
import { IconPlay, IconSparkle } from "@/components/icons";
import { Kop, Sectie } from "../Kop";
import { bestanden } from "../data";

type Bestand = Awaited<ReturnType<typeof bestanden>>[number];

function Lijst({ titel, items, icoon, tint, kleur }: { titel: string; items: Bestand[]; icoon: ReactNode; tint: string; kleur: string }) {
  return (
    <div className="leden-kaart" style={{ overflow: "hidden" }}>
      <h2 className="leden-kaart-titel">{titel}</h2>
      {items.length === 0 ? (
        <p className="leden-leeg" style={{ padding: "18px 22px" }}>Binnenkort beschikbaar.</p>
      ) : items.map((b) => (
        <a key={b.id} href={b.url} target="_blank" rel="noopener" className="leden-row">
          <span className="leden-row__icon" style={{ background: tint, color: kleur }}>{icoon}</span>
          <span className="leden-row__title">{b.naam}</span>
          <span className="leden-row__action">Bekijken</span>
        </a>
      ))}
    </div>
  );
}

export default async function OpnamesPage() {
  const alles = await bestanden(["opnames", "choreo"]);
  return (
    <>
      <Kop titel="Opnames & choreo" tekst="Opnames om thuis mee te zingen en de choreografie van de nummers." />
      <Sectie warm>
        <div className="leden-twee">
          <Lijst titel="Opnames" items={alles.filter((b) => b.categorie === "opnames")} icoon={<IconPlay size={13} />} tint="rgba(243,106,42,0.10)" kleur="var(--primary)" />
          <Lijst titel="Choreografie" items={alles.filter((b) => b.categorie === "choreo")} icoon={<IconSparkle size={13} />} tint="rgba(14,165,233,0.10)" kleur="#0ea5e9" />
        </div>
      </Sectie>
    </>
  );
}
