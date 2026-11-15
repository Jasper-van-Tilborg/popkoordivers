import { cookies } from "next/headers";
import { Kop, Sectie } from "../Kop";
import StemTabs from "../components/StemTabs";
import { STEMGROEPEN, bestandenLijst, db, sessie } from "../data";

const ONTHOUD = "opnames-stem";

export default async function OpnamesPage() {
  // De pagina opent op de stem van het lid; zonder stem in het profiel op het tabblad van de vorige keer
  const stem = sessie().then(async ({ user }) =>
    (await (await db()).from("profiles").select("stemgroep").eq("id", user.id).maybeSingle()).data?.stemgroep ?? null);
  const [eigenStem, opnames, koekjes] = await Promise.all([stem, bestandenLijst(["opnames"]), cookies()]);
  const vorige = koekjes.get(ONTHOUD)?.value;

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
          <StemTabs liedjes={perStem} start={eigenStem ?? vorige} onthoud={ONTHOUD} />
        </div>
      </Sectie>
    </>
  );
}
