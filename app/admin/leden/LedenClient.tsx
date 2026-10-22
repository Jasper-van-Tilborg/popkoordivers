"use client";

import { useCallback, useMemo, useState } from "react";
import { Drawer, DeleteButton, IconPlus, IconSearch, useToast } from "../_components/ui";
import { maakLid, verwijderLid, wijzigLid, zetWachtwoord, type LidInput } from "./actions";

type Stemgroep = NonNullable<LidInput["stemgroep"]>;

interface Lid {
  id: string;
  email: string;
  naam: string | null;
  rol: LidInput["rol"];
  stemgroep: Stemgroep | null;
  bestuursfunctie: string | null;
  in_smoelenboek: boolean;
  laatst_ingelogd: string | null;
}

const STEMGROEPEN: Stemgroep[] = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas"];
const FUNCTIES = ["Voorzitter", "Secretaris", "Penningmeester", "Algemeen bestuurslid"];

const initialen = (naam: string) =>
  naam.split(/\s+/).filter((w) => w && w[0] === w[0].toUpperCase()).map((w) => w[0]).join("").slice(0, 2) || naam.slice(0, 2).toUpperCase();

function maakWachtwoord() {
  const tekens = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(r, (n) => tekens[n % tekens.length]).join("");
}

function LidDrawer({ lid, eigen, onClose, onDone }: {
  lid: Lid | null;
  eigen: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  const [form, setForm] = useState<LidInput>({
    naam: lid?.naam ?? "",
    email: lid?.email ?? "",
    stemgroep: lid?.stemgroep ?? null,
    rol: lid?.rol ?? "lid",
    bestuursfunctie: lid?.bestuursfunctie ?? "",
    in_smoelenboek: lid?.in_smoelenboek ?? true,
  });
  const [wachtwoord, setWachtwoord] = useState(lid ? "" : maakWachtwoord());
  const [fout, setFout]   = useState("");
  const [info, setInfo]   = useState("");
  const [busy, setBusy]   = useState<"save" | "delete" | "pw" | null>(null);
  const set = <K extends keyof LidInput>(k: K, v: LidInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.naam.trim()) { setFout("Vul de naam in."); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) { setFout("Vul een geldig e-mailadres in."); return; }
    setBusy("save");
    setFout("");
    const res = lid ? await wijzigLid(lid.id, form) : await maakLid(form, wachtwoord);
    setBusy(null);
    if (res.error) setFout(res.error);
    else onDone(lid ? "Wijzigingen opgeslagen" : `${form.naam} is toegevoegd`);
  }

  async function nieuwWachtwoord() {
    if (!lid) return;
    setBusy("pw");
    setFout("");
    setInfo("");
    const res = await zetWachtwoord(lid.id, wachtwoord);
    setBusy(null);
    if (res.error) setFout(res.error);
    else setInfo("Nieuw wachtwoord ingesteld. Geef het door aan het lid.");
  }

  async function remove() {
    if (!lid) return;
    setBusy("delete");
    const res = await verwijderLid(lid.id);
    setBusy(null);
    if (res.error) setFout(res.error);
    else onDone(`${lid.naam ?? lid.email} is verwijderd`);
  }

  return (
    <Drawer
      title={lid ? (lid.naam ?? lid.email) : "Lid toevoegen"}
      onClose={onClose}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {lid && !eigen && <DeleteButton onConfirm={remove} busy={busy === "delete"} label="Account verwijderen" />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Opslaan…" : lid ? "Wijzigingen opslaan" : "Lid toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="ld-naam">Naam</label>
          <input id="ld-naam" className="adm-input" value={form.naam} onChange={(e) => set("naam", e.target.value)} placeholder="Voor- en achternaam" />
        </div>
        <div className="adm-field">
          <label htmlFor="ld-email">E-mailadres</label>
          <input id="ld-email" type="email" className="adm-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <p className="adm-hint">Hiermee logt het lid in.</p>
        </div>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="ld-stem">Stemgroep</label>
            <select id="ld-stem" className="adm-input" value={form.stemgroep ?? ""} onChange={(e) => set("stemgroep", (e.target.value || null) as Stemgroep | null)}>
              <option value="">Geen (bijv. dirigent)</option>
              {STEMGROEPEN.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label htmlFor="ld-functie">Bestuursfunctie <span className="adm-optional">optioneel</span></label>
            <input id="ld-functie" className="adm-input" list="ld-functies" value={form.bestuursfunctie} onChange={(e) => set("bestuursfunctie", e.target.value)} placeholder="Geen" />
            <datalist id="ld-functies">{FUNCTIES.map((f) => <option key={f} value={f} />)}</datalist>
          </div>
        </div>
        <p className="adm-hint">Met een bestuursfunctie staat het lid in het blok &ldquo;Bestuur&rdquo; in de ledenomgeving.</p>
        <label className="adm-check" style={{ marginTop: 16 }}>
          <input type="checkbox" checked={form.in_smoelenboek} onChange={(e) => set("in_smoelenboek", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--primary)" }} />
          Tonen in het smoelenboek
        </label>
      </section>

      <section className="adm-fieldset">
        <h3>Toegang</h3>
        <div className="adm-field">
          <label htmlFor="ld-rol" className="adm-label">Rol</label>
          <select id="ld-rol" className="adm-input" value={form.rol} onChange={(e) => set("rol", e.target.value as LidInput["rol"])} disabled={eigen}>
            <option value="lid">Lid: ziet de ledenomgeving</option>
            <option value="admin">Beheerder: kan ook de website aanpassen</option>
          </select>
          {eigen && <p className="adm-hint">Je eigen rol kun je niet wijzigen.</p>}
        </div>
        <div className="adm-field">
          <label htmlFor="ld-pw">{lid ? "Nieuw wachtwoord" : "Wachtwoord"}</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="ld-pw" className="adm-input" value={wachtwoord} onChange={(e) => setWachtwoord(e.target.value)} placeholder={lid ? "Laat leeg om niets te wijzigen" : ""} autoComplete="off" />
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => setWachtwoord(maakWachtwoord())}>Maak er een</button>
          </div>
          {lid ? (
            <>
              {wachtwoord && <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" style={{ marginTop: 8 }} onClick={nieuwWachtwoord} disabled={!!busy}>{busy === "pw" ? "Instellen…" : "Wachtwoord instellen"}</button>}
              {info && <p className="adm-hint" role="status" style={{ color: "var(--ok)", fontWeight: 600 }}>{info}</p>}
              {lid.laatst_ingelogd && <p className="adm-hint">Laatst ingelogd: {new Date(lid.laatst_ingelogd).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</p>}
            </>
          ) : (
            <p className="adm-hint">Geef dit wachtwoord door aan het nieuwe lid. Minstens 8 tekens.</p>
          )}
        </div>
      </section>
    </Drawer>
  );
}

export default function LedenClient({ leden, eigenId }: { leden: Lid[]; eigenId: string }) {
  const [zoek, setZoek]     = useState("");
  const [drawer, setDrawer] = useState<{ lid: Lid | null } | null>(null);
  const [toast, melding]    = useToast();
  const sluit = useCallback(() => setDrawer(null), []);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const gefilterd = leden.filter((l) => !q || (l.naam ?? "").toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
    return [...STEMGROEPEN, null]
      .map((s) => ({ titel: s ?? "Zonder stemgroep", items: gefilterd.filter((l) => l.stemgroep === s) }))
      .filter((g) => g.items.length > 0);
  }, [leden, zoek]);

  const bestuur = leden.filter((l) => l.bestuursfunctie).length;
  const admins  = leden.filter((l) => l.rol === "admin").length;

  return (
    <div>
      <header className="adm-head">
        <div>
          <h1>Leden</h1>
          <p className="adm-sub">{leden.length} accounts, {bestuur} in het bestuur, {admins} beheerder{admins === 1 ? "" : "s"}.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setDrawer({ lid: null })}><IconPlus /> Lid toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam of e-mail" aria-label="Zoek op naam of e-mail" />
        </div>
      </div>

      <div className="adm-content">
        {groepen.length === 0 ? (
          <div className="adm-empty">
            {zoek ? <p className="adm-empty-title">Niemand gevonden voor &ldquo;{zoek}&rdquo;</p> : (
              <>
                <p className="adm-empty-title">Nog geen leden</p>
                <button className="adm-btn adm-btn--primary" onClick={() => setDrawer({ lid: null })}>Lid toevoegen</button>
              </>
            )}
          </div>
        ) : (
          groepen.map((g) => (
            <section key={g.titel} className="adm-group">
              <h2 className="adm-group-title">{g.titel} <span className="adm-count">{g.items.length}</span></h2>
              <ul className="adm-list">
                {g.items.map((l) => (
                  <li key={l.id} className="adm-row adm-row--avatar" onClick={() => setDrawer({ lid: l })}>
                    <span className="adm-avatar" aria-hidden="true">{initialen(l.naam ?? l.email)}</span>
                    <div className="adm-main-col">
                      <button className="adm-title" onClick={(e) => { e.stopPropagation(); setDrawer({ lid: l }); }}>{l.naam ?? l.email}</button>
                      <div className="adm-meta">
                        <span>{l.email}</span>
                        {!l.in_smoelenboek && <span className="adm-missing">Niet in het smoelenboek</span>}
                      </div>
                    </div>
                    <div className="adm-actions">
                      {l.bestuursfunctie && <span className="adm-pill adm-pill--brand">{l.bestuursfunctie}</span>}
                      {l.rol === "admin" && <span className="adm-pill">Beheerder</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {drawer && (
        <LidDrawer
          key={drawer.lid?.id ?? "new"}
          lid={drawer.lid}
          eigen={drawer.lid?.id === eigenId}
          onClose={sluit}
          onDone={(m) => { setDrawer(null); melding(m); }}
        />
      )}
      {toast}
    </div>
  );
}
