import { Kop, Sectie } from "../Kop";
import StemTabs from "../components/StemTabs";
import { STEMGROEPEN, bestandenLijst, sessie } from "../data";

export default async function OpnamesPage() {
  const [{ stemgroep }, opnames] = await Promise.all([sessie(), bestandenLijst(["opnames"])]);

  // Per stemgroep, en opnames zonder stemgroep onder Compleet (het hele koor)
  const lijst = (filter: (b: (typeof opnames)[number]) => boolean) => opnames
    .filter(filter)
    .map((b) => ({ id: b.id, titel: b.naam, nummer: b.liednummer, ext: b.ext }));
  const perStem = {
    ...Object.fromEntries(STEMGROEPEN.map((stem) => [stem, lijst((b) => b.stemgroep === stem)])),
    Compleet: lijst((b) => !b.stemgroep),
  };

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
