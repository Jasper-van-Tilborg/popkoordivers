import { huidigeSessie } from "@/lib/auth";
import { NL } from "../_components/activiteit";
import Redactie from "./Redactie";
import Beheer from "./Beheer";

// Een redacteur ziet hier alles om iets te maken; een beheerder hoe de site ervoor staat.
export default async function OverzichtPage() {
  const nu = new Date();
  const ik = await huidigeSessie();

  const voornaam = ik?.naam?.split(" ")[0];
  const datumTekst = nu.toLocaleDateString("nl-NL", { timeZone: NL, weekday: "long", day: "numeric", month: "long" });
  const uur = Number(nu.toLocaleString("nl-NL", { timeZone: NL, hour: "numeric", hour12: false }));
  const groet = uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>{groet}{voornaam ? `, ${voornaam}` : ""}</h1>
          <p className="adm-sub">{datumTekst.charAt(0).toUpperCase() + datumTekst.slice(1)}</p>
        </div>
        <a className="adm-btn adm-btn--ghost" href="/" target="_blank" rel="noopener">Website bekijken</a>
      </header>

      <div className="adm-content">
        {ik?.rol === "admin" ? <Beheer nu={nu} /> : <Redactie nu={nu} />}
      </div>
    </div>
  );
}
