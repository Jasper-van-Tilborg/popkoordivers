import { Kop, Sectie } from "../Kop";
import StemTabs from "../components/StemTabs";
import { STEMGROEPEN, bestanden, sessie } from "../data";

export default async function BladmuziekPage() {
  const [{ stemgroep }, liedjes] = await Promise.all([sessie(), bestanden(["liedjes"])]);

  // Per stemgroep; bladmuziek zonder stemgroep is voor iedereen
  const perStem = Object.fromEntries(STEMGROEPEN.map((stem) => [
    stem,
    liedjes
      .filter((b) => !b.stemgroep || b.stemgroep === stem)
      .map((b) => ({ titel: b.naam, pdf_url: b.url }))
      .sort((a, b) => a.titel.localeCompare(b.titel, "nl")),
  ]));

  return (
    <>
      <Kop titel="Bladmuziek" tekst={stemgroep ? `Per stemgroep. De lijst opent bij ${stemgroep}; bladmuziek voor het hele koor staat bij elke stemgroep.` : "Per stemgroep. Bladmuziek voor het hele koor staat bij elke stemgroep."} />
      <Sectie warm>
        <div className="leden-kaart" style={{ padding: 28 }}>
          <StemTabs liedjes={perStem} begin={stemgroep} />
        </div>
      </Sectie>
    </>
  );
}
