import { Kop, Sectie } from "../Kop";
import StemTabs from "../components/StemTabs";
import { STEMGROEPEN, bestandenLijst, sessie } from "../data";

export default async function OpnamesPage() {
  const [{ stemgroep }, opnames] = await Promise.all([sessie(), bestandenLijst(["opnames"])]);

  // Per stemgroep; opnames zonder stemgroep zijn voor het hele koor
  const perStem = Object.fromEntries(STEMGROEPEN.map((stem) => [
    stem,
    opnames
      .filter((b) => !b.stemgroep || b.stemgroep === stem)
      .map((b) => ({ id: b.id, titel: b.naam, ext: b.ext }))
      .sort((a, b) => a.titel.localeCompare(b.titel, "nl")),
  ]));

  return (
    <>
      <Kop titel="Opnames" />
      <Sectie>
        <div className="leden-kaart leden-opnames">
          <StemTabs liedjes={perStem} begin={stemgroep} />
        </div>
      </Sectie>
    </>
  );
}
