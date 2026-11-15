import { Kop, Sectie } from "../Kop";
import Documenten from "../components/Documenten";
import { documenten } from "../data";

export default async function NieuwsbrievenPage() {
  const alles = await documenten(["nieuwsbrieven", "alv"]);
  return (
    <>
      <Kop titel="Nieuwsbrieven & ALV" />
      <Sectie direct>
        <div className="leden-kaart leden-opnames">
          <Documenten
            nieuwsbrieven={alles.filter((d) => d.categorie === "nieuwsbrieven")}
            alv={alles.filter((d) => d.categorie === "alv")}
          />
        </div>
      </Sectie>
    </>
  );
}
