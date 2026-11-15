"use client";

import { useMemo, useState } from "react";
import { Drawer, DeleteButton, IconPlus, IconSearch, useNaijlen, useToast } from "../_components/ui";
import { Keuze, Vinkje } from "../_components/velden";
import { gebruikersnaamVoor, isEmail, isGebruikersnaam } from "@/lib/gebruikersnaam";
import { maakLid, verwijderLid, wijzigLid, zetWachtwoord, type LidInput } from "./actions";

interface Lid {
  id: string;
  email: string;
  naam: string | null;
  rol: LidInput["rol"];
  in_smoelenboek: boolean;
  laatst_ingelogd: string | null;
}

const initialen = (naam: string) =>
  naam.split(/\s+/).filter((w) => w && w[0] === w[0].toUpperCase()).map((w) => w[0]).join("").slice(0, 2) || naam.slice(0, 2).toUpperCase();

function maakWachtwoord() {
  const tekens = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(r, (n) => tekens[n % tekens.length]).join("");
}

const ROL = { admin: "Beheerder", redacteur: "Redacteur", lid: "Lid" } as const;

const datumKort = (iso: string) => new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");

function LidDrawer({ lid, eigen, sluitend, onClose, onDone }: {
  lid: Lid | null;
  eigen: boolean;
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string, id?: string) => void;
}) {
  const [form, setForm] = useState<LidInput>({
    naam: lid?.naam ?? "",
    email: lid?.email ?? "",
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
    const inlog = form.email.trim().toLowerCase();
    if (inlog.includes("@") ? !isEmail(inlog) : !isGebruikersnaam(inlog)) {
      setFout("Vul een e-mailadres in, of een gebruikersnaam met alleen kleine letters, cijfers, punt of streepje.");
      return;
    }
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
      sluitend={sluitend}
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
            <label htmlFor="ld-email">E-mailadres of gebruikersnaam</label>
            <input
              id="ld-email"
              className="adm-input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder={gebruikersnaamVoor(form.naam) || "naam@voorbeeld.nl"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            {!lid && !form.email && gebruikersnaamVoor(form.naam) && (
              <button type="button" className="adm-link-knop" onClick={() => set("email", gebruikersnaamVoor(form.naam))}>
                Gebruik {gebruikersnaamVoor(form.naam)}
              </button>
            )}
          </div>
        </div>
        <div className="adm-field adm-field--vinkje">
          <Vinkje checked={form.in_smoelenboek} onChange={(v) => set("in_smoelenboek", v)}>Tonen in het smoelenboek</Vinkje>
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
  const [open, sluitend]      = useNaijlen(gekozen);
  const [toast, melding]      = useToast();

  const lid = open && open !== "nieuw" ? leden.find((l) => l.id === open) ?? null : null;

  const gefilterd = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    return leden.filter((l) => !q || (l.naam ?? "").toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
  }, [leden, zoek]);

  const admins  = leden.filter((l) => l.rol === "admin").length;
  const redacteuren = leden.filter((l) => l.rol === "redacteur").length;

  const lijst = gefilterd.length === 0 ? (
    <div className="adm-empty"><p className="adm-empty-title">{zoek ? <>Niemand gevonden voor &ldquo;{zoek}&rdquo;</> : "Nog geen gebruikers"}</p></div>
  ) : (
    <>
      <div className="adm-kolomkop adm-kolomkop--lid" aria-hidden="true">
        <span /><span>Naam</span><span>Inlog</span><span>Rol</span><span>Laatst ingelogd</span>
      </div>
      <section className="adm-group">
        <ul className="adm-list">
          {gefilterd.map((l) => (
            <li key={l.id} className="adm-row adm-row--avatar adm-row--lid" onClick={() => setGekozen(l.id)}>
              <span className="adm-avatar" aria-hidden="true">{initialen(l.naam ?? l.email)}</span>
              <div className="adm-main-col">
                <button className="adm-title" onClick={(e) => { e.stopPropagation(); setGekozen(l.id); }}>{l.naam ?? l.email}</button>
                <div className="adm-meta adm-meta-col">
                  <span>{l.email}</span>
                  {l.rol !== "lid" && <span className={l.rol === "admin" ? "adm-pill adm-pill--brand" : "adm-pill"}>{ROL[l.rol]}</span>}
                </div>
              </div>
              <span className="adm-col">{l.email}</span>
              <span className="adm-col">{l.rol === "lid" ? <span className="adm-col--leeg">Lid</span> : <span className={l.rol === "admin" ? "adm-pill adm-pill--brand" : "adm-pill"}>{ROL[l.rol]}</span>}</span>
              <span className={l.laatst_ingelogd ? "adm-col" : "adm-col adm-col--leeg"}>{l.laatst_ingelogd ? datumKort(l.laatst_ingelogd) : "Nog nooit"}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );

  const venster = open && (open === "nieuw" || lid) ? (
    <LidDrawer
      key={open}
      lid={lid}
      eigen={lid?.id === eigenId}
      sluitend={sluitend}
      onClose={() => setGekozen(null)}
      onDone={(m) => { setGekozen(null); melding(m); }}
    />
  ) : null;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Gebruikers</h1>
          <p className="adm-sub">{leden.length} accounts, {admins} beheerder{admins === 1 ? "" : "s"} en {redacteuren} redacteur{redacteuren === 1 ? "" : "en"}.</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setGekozen("nieuw")}><IconPlus /> Gebruiker toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op naam of e-mail" aria-label="Zoek op naam of e-mail" />
        </div>
      </div>

      <div className="adm-content">{lijst}</div>
      {venster}
      {toast}
    </div>
  );
}
