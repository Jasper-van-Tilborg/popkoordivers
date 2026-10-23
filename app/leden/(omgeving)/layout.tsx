import type { ReactNode } from "react";
import Navbar from "./Navbar";
import LedenPagina from "./LedenPagina";
import { sessie } from "./data";
import "./leden.css";

// De ledenomgeving: de navbar blijft staan, de pagina eronder schuift (wissel.ts).
// Geen footer: alles wat je nodig hebt zit in de navbar.
export default async function LedenLayout({ children }: { children: ReactNode }) {
  const { rol } = await sessie();
  return (
    <>
      <Navbar rol={rol} />
      <div className="leden-main">
        <LedenPagina>
          <main>{children}</main>
        </LedenPagina>
      </div>
    </>
  );
}
