"use client";

import { useState } from "react";
import { useToast } from "../_components/ui";
import { Keuze } from "../_components/velden";
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
    <div className="adm-page">
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
        <section className="adm-instelling">
          <div>
            <h2>Repetities</h2>
            <p>Staat in de footer, op Over ons, op Contact en in de ledenomgeving.</p>
          </div>
          <div className="adm-instelling-velden">
            <div className="adm-grid-2">
              <Veld id="in-repetitie_dag" label="Dag">
                <Keuze id="in-repetitie_dag" value={form.repetitie_dag} onChange={(v) => set("repetitie_dag", v)} opties={DAGEN.map((d) => ({ value: d, label: d }))} />
              </Veld>
              <Veld id="in-repetitie_tijd" label="Tijd">{input("repetitie_tijd", { placeholder: "19:30 – 21:30" })}</Veld>
            </div>
            <div className="adm-grid-2">
              <Veld id="in-repetitie_locatie" label="Locatie">{input("repetitie_locatie", { placeholder: "CCGR De Schakel" })}</Veld>
              <Veld id="in-repetitie_adres" label="Adres">{input("repetitie_adres", { placeholder: "Straat en nummer, postcode en plaats" })}</Veld>
            </div>
          </div>
        </section>

        <section className="adm-instelling">
          <div>
            <h2>Contact</h2>
            <p>Hier komen aanmeldingen en boekingsaanvragen van het contactformulier binnen. Staat ook in de footer en op Contact.</p>
          </div>
          <div className="adm-instelling-velden">
            <Veld id="in-email" label="E-mailadres">{input("email", { type: "email" })}</Veld>
          </div>
        </section>

        <section className="adm-instelling">
          <div>
            <h2>Sociale media</h2>
            <p>De iconen in het menu, op de homepage, in de footer en op Contact. Laat een veld leeg om dat icoon te verbergen.</p>
          </div>
          <div className="adm-instelling-velden">
            <Veld id="in-facebook" label="Facebook" optioneel>{input("facebook", { type: "url", placeholder: "https://" })}</Veld>
            <Veld id="in-instagram" label="Instagram" optioneel>{input("instagram", { type: "url", placeholder: "https://" })}</Veld>
            <Veld id="in-youtube" label="YouTube" optioneel>{input("youtube", { type: "url", placeholder: "https://" })}</Veld>
          </div>
        </section>

        <section className="adm-instelling">
          <div>
            <h2>SponsorKliks</h2>
            <p>De link onderaan elke pagina. Leeg laten om hem te verbergen.</p>
          </div>
          <div className="adm-instelling-velden">
            <Veld id="in-sponsorkliks" label="Link naar de SponsorKliks-pagina" optioneel>{input("sponsorkliks", { type: "url", placeholder: "https://" })}</Veld>
          </div>
        </section>

        <div className="adm-opslaanbalk">
          <button className="adm-btn adm-btn--primary" onClick={opslaan} disabled={bezig || !gewijzigd}>{bezig ? "Opslaan…" : "Wijzigingen opslaan"}</button>
          {gewijzigd && <button className="adm-btn adm-btn--ghost" onClick={() => { setForm(initial); setFout(""); }}>Ongedaan maken</button>}
          {fout ? <span role="alert" style={{ color: "var(--danger)", fontWeight: 600 }}>{fout}</span> : <span>{gewijzigd ? "Je hebt wijzigingen die nog niet zijn opgeslagen." : "Alles is opgeslagen."}</span>}
        </div>
      </div>
      {toast}
    </div>
  );
}
