"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Eigen formulierelementen in de stijl van Popkoor Divers, in plaats van de
// standaard keuzelijst, datumkiezer, checkbox en suggestielijst van de browser
// of macOS. De uitklappers staan in een eigen laag boven de pagina (portal),
// zodat een venster of lijst ze nooit afsnijdt.

/* ── Uitklapper: plek onder (of boven) het veld ─────────────────────────────── */

function useUitklapper<T extends HTMLElement>(open: boolean, sluit: () => void, breedte?: number) {
  const veld = useRef<T>(null);
  const laag = useRef<HTMLDivElement>(null);
  const [stijl, setStijl] = useState<CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    if (!open) return;
    const plaats = () => {
      const v = veld.current?.getBoundingClientRect();
      const h = laag.current?.offsetHeight ?? 0;
      if (!v) return;
      const w = breedte ?? v.width;
      const onder = window.innerHeight - v.bottom >= h + 12 || v.top < h + 12;
      setStijl({
        position: "fixed",
        left: Math.max(8, Math.min(v.left, window.innerWidth - w - 8)),
        top: onder ? v.bottom + 6 : v.top - h - 6,
        width: w,
        transformOrigin: onder ? "top" : "bottom",
      });
    };
    plaats();
    window.addEventListener("resize", plaats);
    window.addEventListener("scroll", plaats, true);
    return () => { window.removeEventListener("resize", plaats); window.removeEventListener("scroll", plaats, true); };
  }, [open, breedte]);

  useEffect(() => {
    if (!open) return;
    const buiten = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!veld.current?.contains(t) && !laag.current?.contains(t)) sluit();
    };
    document.addEventListener("pointerdown", buiten);
    return () => document.removeEventListener("pointerdown", buiten);
  }, [open, sluit]);

  return { veld, laag, stijl };
}

const Laag = ({ children }: { children: ReactNode }) => (typeof document === "undefined" ? null : createPortal(children, document.body));

const Chevron = () => (
  <svg className="adm-veld-pijl" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
);
const Vink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 10 17 19 7" /></svg>
);

/* ── Keuze: een uitklaplijst ─────────────────────────────────────────────────── */

export interface Optie<T extends string> { value: T; label: string; hint?: string }

export function Keuze<T extends string>({ id, value, onChange, opties, disabled }: {
  id?: string;
  value: T;
  onChange: (v: T) => void;
  opties: Optie<T>[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [actief, setActief] = useState(0);
  const lijstId = useId();
  const sluit = () => setOpen(false);
  const { veld, laag, stijl } = useUitklapper<HTMLButtonElement>(open, sluit);
  const gekozen = opties.find((o) => o.value === value);

  const openen = () => { setActief(Math.max(0, opties.findIndex((o) => o.value === value))); setOpen(true); };
  const kies = (o: Optie<T>) => { onChange(o.value); setOpen(false); veld.current?.focus(); };

  function toets(e: KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openen(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActief((i) => Math.min(opties.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActief((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); kies(opties[actief]); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      const i = opties.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActief(i);
    }
  }

  return (
    <>
      <button
        ref={veld}
        id={id}
        type="button"
        className="adm-input adm-keuze"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? lijstId : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openen())}
        onKeyDown={toets}
      >
        <span className="adm-keuze-tekst">{gekozen?.label ?? "Kies…"}</span>
        <Chevron />
      </button>
      {open && (
        <Laag>
          <div ref={laag} className="adm-uitklap" style={stijl}>
            <ul id={lijstId} role="listbox" aria-activedescendant={`${lijstId}-${actief}`} tabIndex={-1}>
              {opties.map((o, i) => (
                <li
                  key={o.value}
                  id={`${lijstId}-${i}`}
                  role="option"
                  aria-selected={o.value === value}
                  data-actief={i === actief || undefined}
                  onPointerEnter={() => setActief(i)}
                  onClick={() => kies(o)}
                >
                  <span>
                    {o.label}
                    {o.hint && <small>{o.hint}</small>}
                  </span>
                  {o.value === value && <Vink />}
                </li>
              ))}
            </ul>
          </div>
        </Laag>
      )}
    </>
  );
}

/* ── Suggestie: tekstveld met voorstellen ────────────────────────────────────── */

export function Suggestie({ id, value, onChange, suggesties, placeholder }: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  suggesties: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [actief, setActief] = useState(-1);
  const lijstId = useId();
  const sluit = () => setOpen(false);
  const { veld, laag, stijl } = useUitklapper<HTMLInputElement>(open, sluit);
  const q = value.trim().toLowerCase();
  const lijst = suggesties.filter((s) => !q || (s.toLowerCase().includes(q) && s.toLowerCase() !== q));
  const toon = open && lijst.length > 0;

  function toets(e: KeyboardEvent) {
    if (!toon) { if (e.key === "ArrowDown") { setOpen(true); setActief(0); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActief((i) => Math.min(lijst.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActief((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter" && actief >= 0) { e.preventDefault(); onChange(lijst[actief]); setOpen(false); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); }
  }

  return (
    <>
      <input
        ref={veld}
        id={id}
        className="adm-input"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={toon}
        aria-controls={toon ? lijstId : undefined}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActief(-1); }}
        onKeyDown={toets}
      />
      {toon && (
        <Laag>
          <div ref={laag} className="adm-uitklap" style={stijl}>
            <ul id={lijstId} role="listbox">
              {lijst.map((s, i) => (
                <li key={s} role="option" aria-selected={false} data-actief={i === actief || undefined}
                  onPointerEnter={() => setActief(i)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(s); setOpen(false); }}>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Laag>
      )}
    </>
  );
}

/* ── Vinkje ───────────────────────────────────────────────────────────────────── */

export function Vinkje({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} className="adm-vinkje" onClick={() => onChange(!checked)}>
      <span className="adm-vinkje-doos">{checked && <Vink />}</span>
      <span>{children}</span>
    </button>
  );
}

/* ── Datum: een eigen kalender ───────────────────────────────────────────────── */

const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const DAGEN = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const iso = (j: number, m: number, d: number) => `${j}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const vandaagIso = () => { const n = new Date(); return iso(n.getFullYear(), n.getMonth(), n.getDate()); };
const leesIso = (s: string) => { const [j, m, d] = s.split("-").map(Number); return { j, m: m - 1, d }; };
export const toonDatum = (s: string) => { const { j, m, d } = leesIso(s); return `${d} ${MAANDEN[m]} ${j}`; };

export function Datum({ id, value, onChange, placeholder = "Kies een datum", invalid }: {
  id?: string;
  value: string;              // "2026-11-07" of ""
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const start = leesIso(value || vandaagIso());
  const [maand, setMaand] = useState({ j: start.j, m: start.m });
  const [focusDag, setFocusDag] = useState(value || vandaagIso());
  const sluit = () => setOpen(false);
  const { veld, laag, stijl } = useUitklapper<HTMLButtonElement>(open, sluit, 304);
  const raster = useRef<HTMLDivElement>(null);

  const openen = () => {
    const s = leesIso(value || vandaagIso());
    setMaand({ j: s.j, m: s.m });
    setFocusDag(value || vandaagIso());
    setOpen(true);
  };
  const kies = (d: string) => { onChange(d); setOpen(false); veld.current?.focus(); };
  const verschuif = (n: number) => setMaand(({ j, m }) => ({ j: j + Math.floor((m + n) / 12), m: ((m + n) % 12 + 12) % 12 }));

  // Focus volgt de gekozen dag in het raster (toetsenbord)
  useEffect(() => {
    if (open) raster.current?.querySelector<HTMLButtonElement>(`[data-dag="${focusDag}"]`)?.focus({ preventScroll: true });
  }, [open, focusDag, maand]);

  function toetsRaster(e: KeyboardEvent) {
    const stap = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (stap) {
      e.preventDefault();
      const { j, m, d } = leesIso(focusDag);
      const n = new Date(j, m, d + stap);
      setMaand({ j: n.getFullYear(), m: n.getMonth() });
      setFocusDag(iso(n.getFullYear(), n.getMonth(), n.getDate()));
    } else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); veld.current?.focus(); }
  }

  const eerste = new Date(maand.j, maand.m, 1);
  const leeg = (eerste.getDay() + 6) % 7; // maandag eerst
  const aantal = new Date(maand.j, maand.m + 1, 0).getDate();
  const vandaag = vandaagIso();

  return (
    <>
      <button
        ref={veld}
        id={id}
        type="button"
        className="adm-input adm-keuze"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openen())}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); openen(); } }}
      >
        <span className={value ? "adm-keuze-tekst" : "adm-keuze-tekst adm-keuze-leeg"}>{value ? toonDatum(value) : placeholder}</span>
        <svg className="adm-veld-pijl" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
      </button>
      {open && (
        <Laag>
          <div ref={laag} className="adm-uitklap adm-kalender" style={stijl} role="dialog" aria-label="Kies een datum">
            <div className="adm-kal-kop">
              <button type="button" onClick={() => verschuif(-12)} aria-label="Vorig jaar">«</button>
              <button type="button" onClick={() => verschuif(-1)} aria-label="Vorige maand">‹</button>
              <strong>{MAANDEN[maand.m]} {maand.j}</strong>
              <button type="button" onClick={() => verschuif(1)} aria-label="Volgende maand">›</button>
              <button type="button" onClick={() => verschuif(12)} aria-label="Volgend jaar">»</button>
            </div>
            <div className="adm-kal-raster" role="grid" ref={raster} onKeyDown={toetsRaster}>
              {DAGEN.map((d) => <span key={d} className="adm-kal-weekdag" aria-hidden="true">{d}</span>)}
              {Array.from({ length: leeg }, (_, i) => <span key={`l${i}`} />)}
              {Array.from({ length: aantal }, (_, i) => {
                const dag = iso(maand.j, maand.m, i + 1);
                return (
                  <button
                    key={dag}
                    type="button"
                    data-dag={dag}
                    tabIndex={dag === focusDag ? 0 : -1}
                    aria-pressed={dag === value}
                    aria-label={toonDatum(dag)}
                    data-vandaag={dag === vandaag || undefined}
                    onClick={() => kies(dag)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="adm-kal-voet">
              <button type="button" onClick={() => kies(vandaag)}>Vandaag</button>
            </div>
          </div>
        </Laag>
      )}
    </>
  );
}
