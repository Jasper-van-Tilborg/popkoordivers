"use client";

import { useCallback, useMemo, useState } from "react";
import { Drawer, DeleteButton, IconPlus, IconSearch, useToast } from "../_components/ui";
import { Keuze, Vinkje } from "../_components/velden";
import { Werkblad, kiesMetSchuif } from "../_components/Werkblad";
import { maakLid, verwijderLid, wijzigLid, zetWachtwoord, type LidInput } from "./actions";

type Stemgroep = NonNullable<LidInput["stemgroep"]>;

interface Lid {
  id: string;
  email: string;
  naam: string | null;
  rol: LidInput["rol"];
  stemgroep: Stemgroep | null;
  in_smoelenboek: boolean;
  laatst_ingelogd: string | null;
}

const STEMGROEPEN: Stemgroep[] = ["Sopraan", "Mezzo", "Alt", "Tenor", "Bas"];

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
  onDone: (melding: string, id?: string) => void;
}) {
  const [form, setForm] = useState<LidInput>({
    naam: lid?.naam ?? "",
    email: lid?.email ?? "",
    stemgroep: lid?.stemgroep ?? null,
    rol: lid?.rol ?? "lid",
    in_smoelenboek: lid?.in_smoelenboek ?? true,
  });
  const [wachtwoord, setWachtwoord] = useState(() => (lid ? "" : maakWachtwoord()));
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
    else onDone(lid ? "Wijzigingen opgeslagen" : `${form.naam} is toegevoegd`, lid?.id ?? (res as { id?: string }).id);
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
      inline
      title={lid ? (lid.naam ?? lid.email) : "Gebruiker toevoegen"}
      onClose={onClose}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {lid && !eigen && <DeleteButton onConfirm={remove} busy={busy === "delete"} label="Account verwijderen" />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={!!busy}>
              {busy === "save" ? "Opslaan…" : lid ? "Wijzigingen opslaan" : "Gebruiker toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="ld-naam">Naam</label>
            <input id="ld-naam" className="adm-input" value={form.naam} onChange={(e) => set("naam", e.target.value)} placeholder="Voor- en achternaam" />
          </div>
          <div className="adm-field">
            <label htmlFor="ld-email">E-mailadres</label>
            <input id="ld-email" type="email" className="adm-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <p className="adm-hint">Hiermee logt het lid in.</p>
          </div>
        </div>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="ld-stem">Stemgroep</label>
            <Keuze<Stemgroep | "">
              id="ld-stem"
              value={form.stemgroep ?? ""}
              onChange={(v) => set("stemgroep", v || null)}
              opties={[...STEMGROEPEN.map((s) => ({ value: s, label: s })), { value: "", label: "Geen", hint: "Bijvoorbeeld de dirigent" }]}
            />
          </div>
          <div className="adm-field adm-field--vinkje">
            <Vinkje checked={form.in_smoelenboek} onChange={(v) => set("in_smoelenboek", v)}>Tonen in het smoelenboek</Vinkje>
          </div>
        </div>
      </section>

      <section className="adm-fieldset">
        <h3>Toegang</h3>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="ld-rol" className="adm-label">Rol</label>
            <Keuze<LidInput["rol"]>
              id="ld-rol"
              value={form.rol}
              onChange={(v) => set("rol", v)}
              disabled={eigen}
              opties={[
                { value: "lid", label: "Lid", hint: "Ziet de ledenomgeving" },
                { value: "redacteur", label: "Redacteur", hint: "Plaatst agenda, nieuws, foto's en bestanden" },
                { value: "admin", label: "Beheerder", hint: "Alles, ook gebruikers, activiteit en sitestatus" },
              ]}
            />
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
        </div>
      </section>
    </Drawer>
  );
}

export default function LedenClient({ leden, eigenId, startId }: { leden: Lid[]; eigenId: string; startId?: string }) {
  const [zoek, setZoek]       = useState("");
  const [gekozen, setGekozen] = useState<string | null>(startId ?? null);
  const [toast, melding]      = useToast();

  const lid = gekozen && gekozen !== "nieuw" ? leden.find((l) => l.id === gekozen) ?? null : null;
  const kies = useCallback((id: string | null) => kiesMetSchuif(gekozen, id, () => setGekozen(id)), [gekozen]);
  const sluit = useCallback(() => kies(null), [kies]);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const gefilterd = leden.filter((l) => !q || (l.naam ?? "").toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
    return [...STEMGROEPEN, null]
      .map((s) => ({ titel: s ?? "Zonder stemgroep", items: gefilterd.filter((l) => l.stemgroep === s) }))
      .filter((g) => g.items.length > 0);
  }, [leden, zoek]);

  const admins  = leden.filter((l) => l.rol === "admin").length;
  const redacteuren = leden.filter((l) => l.rol === "redacteur").length;

  const lijst = (
    <>
      <button className="adm-wb-nieuw" data-id="nieuw" data-gekozen={gekozen === "nieuw" || undefined} onClick={() => kies("nieuw")}>
        <IconPlus /> Gebruiker toevoegen
      </button>
      {groepen.length === 0 ? (
        <div className="adm-empty"><p className="adm-empty-title">{zoek ? <>Niemand gevonden voor &ldquo;{zoek}&rdquo;</> : "Nog geen gebruikers"}</p></div>
      ) : groepen.map((g) => (
        <section key={g.titel} className="adm-group">
          <h2 className="adm-group-title">{g.titel} <span className="adm-count">{g.items.length}</span></h2>
          <ul className="adm-list">
            {g.items.map((l) => (
              <li key={l.id} data-id={l.id} data-gekozen={gekozen === l.id || undefined} className="adm-row adm-row--avatar" onClick={() => kies(l.id)}>
                <span className="adm-avatar" aria-hidden="true">{initialen(l.naam ?? l.email)}</span>
                <div className="adm-main-col">
                  <button className="adm-title" onClick={(e) => { e.stopPropagation(); kies(l.id); }}>{l.naam ?? l.email}</button>
                  <div className="adm-meta">
                    <span>{l.email}</span>
                  </div>
                </div>
                {l.rol !== "lid" && <span className={l.rol === "admin" ? "adm-pill adm-pill--brand" : "adm-pill"}>{l.rol === "admin" ? "Beheerder" : "Redacteur"}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );

  const blad = gekozen && (gekozen === "nieuw" || lid) ? (
    <LidDrawer
      key={gekozen}
      lid={lid}
      eigen={lid?.id === eigenId}
      onClose={sluit}
      onDone={(m, id) => { setGekozen(id ?? null); melding(m); }}
    />
  ) : null;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Gebruikers</h1>
          <p className="adm-sub">{leden.length} accounts, {admins} beheerder{admins === 1 ? "" : "s"} en {redacteuren} redacteur{redacteuren === 1 ? "" : "en"}.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Gebruiker toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam of e-mail" aria-label="Zoek op naam of e-mail" />
        </div>
      </div>

      <div className="adm-content">
        <Werkblad
          gekozen={gekozen}
          lijst={lijst}
          blad={blad}
          leeg={
            <>
              <p className="adm-empty-title">Kies een lid</p>
              <p>Klik links op een lid om naam, stemgroep, rol of wachtwoord aan te passen.</p>
              <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Gebruiker toevoegen</button>
            </>
          }
        />
      </div>
      {toast}
    </div>
  );
}
