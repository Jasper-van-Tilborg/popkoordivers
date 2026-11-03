import { IconSparkle } from "@/components/icons";
import { Kop, Sectie } from "../Kop";
import { bestanden } from "../data";

export default async function ChoreoPage() {
  const items = await bestanden(["choreo"]);
  return (
    <>
      <Kop titel="Choreografie" tekst="De choreografie van de nummers." />
      <Sectie>
        <div className="leden-kaart" style={{ overflow: "hidden" }}>
          {items.length === 0 ? (
            <p className="leden-leeg" style={{ padding: "18px 22px" }}>Binnenkort beschikbaar.</p>
          ) : items.map((b) => (
            <a key={b.id} href={b.url} target="_blank" rel="noopener" className="leden-row">
              <span className="leden-row__icon" style={{ background: "rgba(14,165,233,0.10)", color: "#0ea5e9" }}><IconSparkle size={13} /></span>
              <span className="leden-row__title">{b.naam}</span>
              <span className="leden-row__action">Bekijken</span>
            </a>
          ))}
        </div>
      </Sectie>
    </>
  );
}
