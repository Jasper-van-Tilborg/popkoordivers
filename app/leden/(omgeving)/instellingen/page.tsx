import { inlognaam } from "@/lib/gebruikersnaam";
import { Kop, Sectie } from "../Kop";
import { sessie, weergave } from "../data";
import Instellingen from "./Instellingen";

export default async function InstellingenPage() {
  const [{ naam, rol, user }, grootte] = await Promise.all([sessie(), weergave()]);
  return (
    <>
      <Kop titel="Instellingen" />
      <Sectie direct>
        <Instellingen
          weergave={grootte}
          account={{ naam, inlog: inlognaam(user.email) }}
          beheer={rol !== "lid"}
        />
      </Sectie>
    </>
  );
}
