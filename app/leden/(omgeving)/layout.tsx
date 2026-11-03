import type { ReactNode } from "react";
import type { Viewport } from "next";
import Navbar from "./Navbar";
import LedenPagina from "./LedenPagina";
import { inlognaam } from "@/lib/gebruikersnaam";
import { sessie, weergave } from "./data";
import "./leden.css";
import "./mobiel.css";

// Tot in de randen van de telefoon (de balk onderin houdt zelf ruimte vrij), in de kleur van de achtergrond.
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#FFF8F3" };

// De ledenomgeving: de navbar blijft staan, de pagina eronder schuift (wissel.ts).
// Geen footer: alles wat je nodig hebt zit in de navbar.
export default async function LedenLayout({ children }: { children: ReactNode }) {
  const [{ rol, naam, stemgroep, user }, grootte] = await Promise.all([sessie(), weergave()]);
  return (
    <div className="leden-weergave" data-weergave={grootte}>
      {/* Eén doorlopende achtergrond die blijft staan; de pagina's schuiven eroverheen */}
      <div className="leden-achtergrond" aria-hidden="true" />
      <Navbar rol={rol} account={{ naam, stemgroep, inlog: inlognaam(user.email) }} weergave={grootte} />
      <div className="leden-main">
        <LedenPagina>
          <main>{children}</main>
        </LedenPagina>
      </div>
    </div>
  );
}
