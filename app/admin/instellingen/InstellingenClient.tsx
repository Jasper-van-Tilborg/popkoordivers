"use client";

import { useState } from "react";
import { useToast } from "../_components/ui";
import type { Instellingen } from "@/lib/instellingen-standaard";
import { bewaarInstellingen } from "./actions";

const DAGEN = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

function Veld({ id, label, hint, optioneel, children }: { id: string; label: string; hint?: string; optioneel?: boolean; children: React.ReactNode }) {
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}{optioneel && <span className="adm-optional">optioneel</span>}</label>
      {children}
      {hint && <p className="adm-hint">{hint}</p>}
    </div>
  );
}

export default function InstellingenClient({ initial, bijgewerkt }: { initial: Instellingen; bijgewerkt: string | null }) {
  const [form, setForm]   = useState(initial);
  const [fout, setFout]   = useState("");
  const [bezig, setBezig] = useState(false);
  const [toast, melding]  = useToast();
  const set = (k: keyof Instellingen, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const gewijzigd = JSON.stringify(form) !== JSON.stringify(initial);

  async function opslaan() {
    setBezig(true);
    setFout("");
    const res = await bewaarInstellingen(form);
    setBezig(false);
    if (res.error) setFout(res.error);
    else melding("Instellingen opgeslagen. De website is bijgewerkt.");
  }

  const input = (k: keyof Instellingen, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={`in-${k}`} className="adm-input" value={form[k]} onChange={(e) => set(k, e.target.value)} {...props} />
  );

  return (
    <div>
      <header className="adm-head">
        <div>
          <h1>Instellingen</h1>
          <p className="adm-sub">
            Gegevens die op meerdere plekken op de website staan.
            {bijgewerkt && ` Laatst aangepast op ${new Date(bijgewerkt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}.`}
          </p>
        </div>
      </header>

      <div className="adm-content">
        <div className="adm-list" style={{ padding: "4px 24px 8px" }}>
          <section className="adm-fieldset">
            <h3>Repetities</h3>
            <p className="adm-hint" style={{ margin: "0 0 14px" }}>Staat in de footer, op Over ons, op Contact en in de ledenomgeving.</p>
            <div className="adm-grid-2">
              <Veld id="in-repetitie_dag" label="Dag">
                <select id="in-repetitie_dag" className="adm-input" value={form.repetitie_dag} onChange={(e) => set("repetitie_dag", e.target.value)}>
                  {DAGEN.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Veld>
              <Veld id="in-repetitie_tijd" label="Tijd">{input("repetitie_tijd", { placeholder: "19:30 – 21:30" })}</Veld>
            </div>
            <div className="adm-grid-2">
              <Veld id="in-repetitie_locatie" label="Locatie">{input("repetitie_locatie", { placeholder: "CCGR De Schakel" })}</Veld>
              <Veld id="in-repetitie_adres" label="Adres">{input("repetitie_adres", { placeholder: "Straat en nummer, postcode en plaats" })}</Veld>
            </div>
          </section>

          <section className="adm-fieldset">
            <h3>Contact</h3>
            <Veld id="in-email" label="E-mailadres" hint="Hier komen aanmeldingen en boekingsaanvragen van het contactformulier binnen.">
              {input("email", { type: "email" })}
            </Veld>
          </section>

          <section className="adm-fieldset">
            <h3>Sociale media</h3>
            <p className="adm-hint" style={{ margin: "0 0 14px" }}>Laat een veld leeg om dat icoon te verbergen.</p>
            <Veld id="in-facebook" label="Facebook" optioneel>{input("facebook", { type: "url", placeholder: "https://" })}</Veld>
            <Veld id="in-instagram" label="Instagram" optioneel>{input("instagram", { type: "url", placeholder: "https://" })}</Veld>
            <Veld id="in-youtube" label="YouTube" optioneel>{input("youtube", { type: "url", placeholder: "https://" })}</Veld>
          </section>

          <section className="adm-fieldset">
            <h3>SponsorKliks</h3>
            <Veld id="in-sponsorkliks" label="Link naar de SponsorKliks-pagina" optioneel hint="Staat onderaan elke pagina.">
              {input("sponsorkliks", { type: "url", placeholder: "https://" })}
            </Veld>
          </section>
        </div>

        {fout && <p className="adm-server-err" role="alert" style={{ marginTop: 16 }}>{fout}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="adm-btn adm-btn--primary" onClick={opslaan} disabled={bezig || !gewijzigd}>{bezig ? "Opslaan…" : "Wijzigingen opslaan"}</button>
          {gewijzigd && <button className="adm-btn adm-btn--ghost" onClick={() => { setForm(initial); setFout(""); }}>Ongedaan maken</button>}
        </div>
      </div>
      {toast}
    </div>
  );
}
