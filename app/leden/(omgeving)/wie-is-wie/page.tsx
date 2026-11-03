import { createAdminClient } from "@/lib/supabase/admin";
import { Kop, Sectie } from "../Kop";
import { db, initialen, sessie } from "../data";

const Chevron = () => (
  <span className="leden-album__chevron" aria-hidden="true">
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
  </span>
);

export default async function WieIsWiePage() {
  const supabase = await db();
  // sessie() hoort erbij: zonder login gaat die naar de loginpagina voordat er iets getoond wordt
  const [, { data: groepenRaw }, { data: ledenRaw }] = await Promise.all([
    sessie(),
    supabase.from("groepen").select("id, naam, soort, toelichting, contactpersoon_id, volgorde, leden:groepsleden!groepsleden_groep_id_fkey(id, naam, functie, volgorde)").order("volgorde"),
    // Leden mogen elkaars profiel niet rechtstreeks lezen (e-mailadressen); de server
    // haalt alleen naam en stemgroep op, na de login-check in sessie().
    createAdminClient().from("profiles").select("naam, stemgroep, in_smoelenboek").not("naam", "is", null).order("naam"),
  ]);

  // Bestuur en commissies (Admin → Bestuur & commissies)
  const groepen = (groepenRaw ?? []).map((g) => ({ ...g, leden: [...g.leden].sort((a, b) => a.volgorde - b.volgorde) }));
  const bestuursleden = groepen.find((g) => g.soort === "bestuur")?.leden ?? [];
  const commissies = groepen
    .filter((g) => g.soort !== "bestuur" && g.leden.length > 0)
    .sort((a, b) => Number(a.soort === "overig") - Number(b.soort === "overig") || a.volgorde - b.volgorde)
    .map((g) => ({ ...g, contact: bestuursleden.find((l) => l.id === g.contactpersoon_id)?.naam ?? null }));
  const leden = (ledenRaw ?? []).filter((l) => l.in_smoelenboek).map((l) => ({ ...l, naam: l.naam! }));

  return (
    <>
      <Kop titel="Wie is wie" tekst="Het bestuur, de commissies en wie erin zitten, en het smoelenboek van het koor." />

      <Sectie titel="Bestuur" id="bestuur">
        {bestuursleden.length === 0 ? (
          <p className="leden-leeg">Binnenkort beschikbaar.</p>
        ) : (
          <div className="bestuur-grid">
            {bestuursleden.map((l) => (
              <div key={l.id} className="leden-kaart bestuur-kaart">
                <div className="leden-avatar bestuur-avatar">{initialen(l.naam)}</div>
                <div style={{ minWidth: 0 }}>
                  <p className="bestuur-naam">{l.naam}</p>
                  <p className="bestuur-functie">{l.functie ?? "Bestuurslid"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Sectie>

      {commissies.length > 0 && (
        <Sectie titel="Commissies" id="commissies">
          {/* Twee losse kolommen: een commissie openklappen duwt alleen die kolom omlaag */}
          <div className="commissie-kolommen">
            {[0, 1].map((k) => (
              <div key={k} className="commissie-kolom">
                {commissies.map((c, i) => ({ c, i })).filter(({ i }) => i % 2 === k).map(({ c, i }) => (
                  <details key={c.id} className="leden-kaart commissie" style={{ order: i }}>
                    <summary>
                      <div style={{ minWidth: 0 }}>
                        <p className="commissie-naam">{c.naam}</p>
                        <p className="commissie-meta">
                          {c.soort === "overig" ? `${c.leden.length} ${c.leden.length === 1 ? "taak" : "taken"}` : `${c.leden.length} ${c.leden.length === 1 ? "lid" : "leden"}`}
                          {c.toelichting && <span className="commissie-toelichting">{c.toelichting}</span>}
                          {c.contact && <span>Contact: {c.contact}</span>}
                        </p>
                      </div>
                      <Chevron />
                    </summary>
                    <ul className="commissie-leden">
                      {c.leden.map((l) => (
                        <li key={l.id}>
                          <span className="leden-avatar commissie-avatar">{initialen(l.naam)}</span>
                          <span>{l.naam}</span>
                          {l.functie && <span className="commissie-functie">{l.functie}</span>}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </Sectie>
      )}

      <Sectie titel="Smoelenboek" aantal={leden.length} id="smoelenboek">
        {leden.length === 0 ? (
          <p className="leden-leeg">Binnenkort beschikbaar.</p>
        ) : (
          <div className="smoelenboek-grid">
            {leden.map((l, i) => (
              <div key={i} className="leden-kaart smoel">
                <div className="leden-avatar smoel-avatar">{initialen(l.naam)}</div>
                <p className="smoel-naam">{l.naam}</p>
                <span className="smoel-stem">{l.stemgroep ?? "Divers"}</span>
              </div>
            ))}
          </div>
        )}
      </Sectie>
    </>
  );
}
