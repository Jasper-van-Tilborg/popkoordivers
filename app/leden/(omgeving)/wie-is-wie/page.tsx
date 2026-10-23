import { createAdminClient } from "@/lib/supabase/admin";
import { Kop, Sectie } from "../Kop";
import { initialen, sessie } from "../data";

const Chevron = () => (
  <span className="leden-album__chevron" aria-hidden="true">
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
  </span>
);

export default async function WieIsWiePage() {
  const { supabase } = await sessie();
  const [{ data: groepenRaw }, { data: ledenRaw }] = await Promise.all([
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

      <Sectie titel="Bestuur" warm id="bestuur">
        {bestuursleden.length === 0 ? (
          <p className="leden-leeg">Binnenkort beschikbaar.</p>
        ) : (
          <div className="bestuur-grid">
            {bestuursleden.map((l) => (
              <div key={l.id} className="leden-kaart bestuur-kaart">
                <div className="leden-avatar" style={{ width: 48, height: 48, fontSize: 15 }}>{initialen(l.naam)}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{l.naam}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{l.functie ?? "Bestuurslid"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Sectie>

      {commissies.length > 0 && (
        <Sectie titel="Commissies" warm id="commissies">
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
                          <span className="leden-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initialen(l.naam)}</span>
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
              <div key={i} className="leden-kaart" style={{ borderRadius: 16, padding: "20px 12px", textAlign: "center" }}>
                <div className="leden-avatar" style={{ width: 56, height: 56, fontSize: 17, margin: "0 auto 12px" }}>{initialen(l.naam)}</div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{l.naam}</p>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", background: "rgba(243,106,42,0.08)", padding: "3px 10px", borderRadius: 100, letterSpacing: "0.04em" }}>
                  {l.stemgroep ?? "Divers"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Sectie>
    </>
  );
}
