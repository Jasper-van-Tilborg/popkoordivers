import { Kop, Sectie } from "../Kop";
import StemTabs from "../components/StemTabs";
import { bestandenLijst } from "../data";

const TABS = ["Video's", "Beschrijvingen"];

export default async function ChoreoPage() {
  const items = await bestandenLijst(["choreo"]);

  // De video's apart van de uitgeschreven bewegingen (Word, PDF)
  const lijst = (video: boolean) => items
    .filter((b) => (b.ext === "mp4") === video)
    .map((b) => ({ id: b.id, titel: b.naam, nummer: b.liednummer, ext: b.ext }));

  return (
    <>
      <Kop titel="Choreografie" />
      <Sectie>
        <div className="leden-kaart leden-opnames">
          <StemTabs liedjes={{ [TABS[0]]: lijst(true), [TABS[1]]: lijst(false) }} tabs={TABS} wat="choreografie" />
        </div>
      </Sectie>
    </>
  );
}
