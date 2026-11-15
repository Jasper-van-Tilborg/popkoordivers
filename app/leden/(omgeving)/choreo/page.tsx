import { Kop, Sectie } from "../Kop";
import StemTabs from "../components/StemTabs";
import { bestandenLijst } from "../data";
import { choreoLiedjes } from "./liedjes";

const LIJST = "Alle";

export default async function ChoreoPage() {
  const liedjes = choreoLiedjes(await bestandenLijst(["choreo"]));

  return (
    <>
      <Kop titel="Choreografie" />
      <Sectie>
        <div className="leden-kaart leden-opnames">
          <StemTabs liedjes={{ [LIJST]: liedjes }} tabs={[LIJST]} wat="choreografie" />
        </div>
      </Sectie>
    </>
  );
}
