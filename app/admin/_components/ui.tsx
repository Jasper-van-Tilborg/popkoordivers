"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ── Bewerkscherm ────────────────────────────────────────────────────────────────
   inline: als blok rechts in het Werkblad (Agenda, Nieuws, Bestanden, Leden).
   Anders: een venster in het midden, voor korte formulieren (een album). */

// Houdt een waarde nog even vast nadat hij null wordt, zodat iets kan wegschuiven
// voordat het uit beeld verdwijnt. Geeft [waarde om te tonen, bezig met sluiten].
export function useNaijlen<T>(waarde: T | null, ms = 200): [T | null, boolean] {
  const [laatste, setLaatste] = useState(waarde);
  if (waarde !== null && waarde !== laatste) setLaatste(waarde);
  useEffect(() => {
    if (waarde !== null || laatste === null) return;
    const t = setTimeout(() => setLaatste(null), ms);
    return () => clearTimeout(t);
  }, [waarde, laatste, ms]);
  return [waarde ?? laatste, waarde === null && laatste !== null];
}

export function Drawer({ title, onClose, children, footer, sluitend, inline, acties }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  sluitend?: boolean;
  inline?: boolean;
  acties?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  // Alleen bij openen: focus op het eerste veld (zonder de pagina te laten verspringen) en Esc om te sluiten
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("input:not([type=hidden]):not([type=file]), textarea, select")?.focus({ preventScroll: true });
    // Een Escape die een kalender of keuzelijst al heeft afgehandeld, sluit niet ook het scherm
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !e.defaultPrevented) closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inhoud = (
    <>
      <header className="adm-drawer-head">
        <h2 id="adm-drawer-titel">{title}</h2>
        <div className="adm-drawer-acties">
          {acties}
          <button className="adm-icon-btn" onClick={onClose} aria-label="Sluiten">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </header>
      <div className="adm-drawer-body">{children}</div>
      <footer className="adm-drawer-foot">{footer}</footer>
    </>
  );

  if (inline) {
    return (
      <section ref={ref} className="adm-blad" data-sluitend={sluitend || undefined} aria-labelledby="adm-drawer-titel">
        {inhoud}
      </section>
    );
  }
  return (
    <>
      <div className="adm-overlay" data-sluitend={sluitend || undefined} onClick={onClose} />
      <div ref={ref as React.RefObject<HTMLDivElement>} className="adm-venster" data-sluitend={sluitend || undefined} role="dialog" aria-modal="true" aria-labelledby="adm-drawer-titel">
        {inhoud}
      </div>
    </>
  );
}

/* ── Korte melding onderin ───────────────────────────────────────────────────── */

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; key: number; weg?: boolean } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => (toast.weg ? setToast(null) : setToast({ ...toast, weg: true })), toast.weg ? 200 : 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const element = toast ? <div key={toast.key} className="adm-toast" data-sluitend={toast.weg || undefined} role="status">{toast.msg}</div> : null;
  return [element, (msg: string) => setToast({ msg, key: Date.now() })] as const;
}

/* ── Tabbladen met een meeschuivend actief blokje ────────────────────────────── */

export function Tabs<T extends string>({ value, onChange, items, label }: {
  value: T;
  onChange: (v: T) => void;
  items: { id: T; label: string; count?: number }[];
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [blok, setBlok] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const meet = () => {
      const el = ref.current?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (el) setBlok({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    meet();
    window.addEventListener("resize", meet);
    return () => window.removeEventListener("resize", meet);
  }, [value, items.length]);

  return (
    <div ref={ref} className="adm-tabs" role="tablist" aria-label={label}>
      {blok && <span className="adm-tabs-blok" aria-hidden="true" style={{ transform: `translate(${blok.x}px, ${blok.y}px)`, width: blok.w, height: blok.h }} />}
      {items.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}{t.count !== undefined && <span className="adm-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── Aan/uit-schakelaar ──────────────────────────────────────────────────────── */

export function Switch({ checked, onChange, label, disabled }: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="adm-switch" onClick={onChange} disabled={disabled}>
      <span className="adm-switch-knob" />
    </button>
  );
}

/* ── Verwijderen in twee stappen ─────────────────────────────────────────────── */

export function DeleteButton({ onConfirm, busy, label = "Verwijderen" }: {
  onConfirm: () => void;
  busy?: boolean;
  label?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <button
      type="button"
      className={confirm ? "adm-btn adm-btn--danger-solid" : "adm-btn adm-btn--danger"}
      onClick={() => (confirm ? onConfirm() : setConfirm(true))}
      onBlur={() => setConfirm(false)}
      disabled={busy}
    >
      {busy ? "Verwijderen…" : confirm ? "Ja, verwijderen" : label}
    </button>
  );
}

/* ── Iconen die alleen in de admin voorkomen ─────────────────────────────────── */

export const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
);
export const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>
);
export const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
);
export const IconStarSmall = ({ filled }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
);
export const IconUpload = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
);
export const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></svg>
);
export const IconOmhoog = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 15 6-6 6 6" /></svg>
);
export const IconOmlaag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);
export const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
);

/* ── Datums ──────────────────────────────────────────────────────────────────── */

export function vandaag() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const nlDatum = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", opts).replace(".", "");

// "2026-11-07" → "7 november 2026" (zo staan datums op de website)
export const formatDatum = (iso: string) => nlDatum(iso, { day: "numeric", month: "long", year: "numeric" });

// Omgekeerd, voor oudere records waar alleen de tekst bewaard is: "14 Januari 2024" → "2024-01-14"
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
export function parseNlDatum(tekst: string): string {
  const m = tekst.toLowerCase().match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  const maand = m ? MAANDEN.indexOf(m[2]) + 1 : 0;
  return m && maand ? `${m[3]}-${String(maand).padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
}

export function maandTitel(iso: string | null) {
  if (!iso) return "Zonder datum";
  const s = nlDatum(iso, { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DateStub({ iso }: { iso: string | null }) {
  return (
    <div className="adm-stub" aria-hidden="true">
      {iso ? (
        <>
          <span className="adm-stub-day">{nlDatum(iso, { weekday: "short" })}</span>
          <span className="adm-stub-num">{Number(iso.slice(8, 10))}</span>
          <span className="adm-stub-month">{nlDatum(iso, { month: "short" })}</span>
        </>
      ) : (
        <span className="adm-stub-num">?</span>
      )}
    </div>
  );
}
