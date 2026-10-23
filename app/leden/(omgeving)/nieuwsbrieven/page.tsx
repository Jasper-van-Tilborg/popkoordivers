import { IconFolder } from "@/components/icons";
import { Kop, Sectie } from "../Kop";
import { bestanden } from "../data";

export default async function NieuwsbrievenPage() {
  const alles = await bestanden(["nieuwsbrieven", "alv"]);
  const groepen = [
    { titel: "Nieuwsbrieven", items: alles.filter((b) => b.categorie === "nieuwsbrieven") },
    { titel: "ALV-stukken", items: alles.filter((b) => b.categorie === "alv") },
  ];
  return (
    <>
      <Kop titel="Nieuwsbrieven & ALV" tekst="De nieuwsbrieven en de stukken voor de algemene ledenvergadering, nieuwste bovenaan." />
      <Sectie>
        <div className="leden-twee">
          {groepen.map((g) => (
            <div key={g.titel} className="leden-kaart" style={{ overflow: "hidden" }}>
              <h2 className="leden-kaart-titel">{g.titel}</h2>
              {g.items.length === 0 ? (
                <p className="leden-leeg" style={{ padding: "18px 22px" }}>Binnenkort beschikbaar.</p>
              ) : g.items.map((doc) => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noopener" className="leden-row">
                  <span className="leden-row__icon"><IconFolder size={16} /></span>
                  <span className="leden-row__title">
                    {doc.naam}
                    <span className="leden-row__sub">{new Date(doc.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </span>
                  <span className="leden-row__action">Openen</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </Sectie>
    </>
  );
}
