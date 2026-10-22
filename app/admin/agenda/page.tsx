"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconClock, IconMapPin, IconEye } from "@/components/icons";
import AgendaDrawer, { toForm, type AgendaForm, type AgendaItem, type AgendaPayload, type Album } from "./AgendaDrawer";

type Drawer = { mode: "new"; initial: AgendaForm } | { mode: "edit"; item: AgendaItem; initial: AgendaForm };

function vandaag() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const nl = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", opts).replace(".", "");

function maandTitel(iso: string | null) {
  if (!iso) return "Zonder datum";
  const s = nl(iso, { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AgendaAdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems]       = useState<AgendaItem[]>([]);
  const [albums, setAlbums]     = useState<Album[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState("");
  const [tab, setTab]           = useState<"komend" | "archief">("komend");
  const [zoek, setZoek]         = useState("");
  const [drawer, setDrawer]     = useState<Drawer | null>(null);
  const [toast, setToast]       = useState<{ msg: string; key: number } | null>(null);

  const load = useCallback(async () => {
    setLoadErr("");
    const [agenda, albumRes] = await Promise.all([
      supabase.from("agenda").select("*").order("datum_sorteer", { ascending: true, nullsFirst: false }),
      supabase.from("albums").select("slug, titel").order("created_at", { ascending: false }),
    ]);
    if (agenda.error) setLoadErr(agenda.error.message);
    else setItems(agenda.data ?? []);
    setAlbums(albumRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data ophalen bij het openen van de pagina
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const melding = (msg: string) => setToast({ msg, key: Date.now() });

  const today = vandaag();
  const komend  = useMemo(() => items.filter((i) => !i.datum_sorteer || i.datum_sorteer >= today), [items, today]);
  const archief = useMemo(() => items.filter((i) => i.datum_sorteer && i.datum_sorteer < today).reverse(), [items, today]);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const lijst = (tab === "komend" ? komend : archief).filter(
      (i) => !q || i.titel.toLowerCase().includes(q) || (i.locatie ?? "").toLowerCase().includes(q)
    );
    const out: { titel: string; items: AgendaItem[] }[] = [];
    for (const item of lijst) {
      const titel = maandTitel(item.datum_sorteer);
      const laatste = out[out.length - 1];
      if (laatste?.titel === titel) laatste.items.push(item);
      else out.push({ titel, items: [item] });
    }
    return out;
  }, [tab, komend, archief, zoek]);

  const openNieuw = () => setDrawer({ mode: "new", initial: toForm() });
  const openEdit  = (item: AgendaItem) => setDrawer({ mode: "edit", item, initial: toForm(item) });
  const dupliceer = (item: AgendaItem) => setDrawer({ mode: "new", initial: { ...toForm(item), datum_sorteer: "" } });
  const sluit     = useCallback(() => setDrawer(null), []);

  async function save(payload: AgendaPayload) {
    if (!drawer) return null;
    const { error } = drawer.mode === "edit"
      ? await supabase.from("agenda").update(payload).eq("id", drawer.item.id)
      : await supabase.from("agenda").insert(payload);
    if (error) return error.message;
    setDrawer(null);
    setTab(payload.datum_sorteer && payload.datum_sorteer < today ? "archief" : "komend");
    melding(drawer.mode === "edit" ? "Wijzigingen opgeslagen" : "Optreden toegevoegd");
    load();
    return null;
  }

  async function remove() {
    if (drawer?.mode !== "edit") return null;
    const { error } = await supabase.from("agenda").delete().eq("id", drawer.item.id);
    if (error) return error.message;
    setDrawer(null);
    melding("Optreden verwijderd");
    load();
    return null;
  }

  async function togglePublish(item: AgendaItem) {
    const nieuw = !item.gepubliceerd;
    setItems((all) => all.map((i) => (i.id === item.id ? { ...i, gepubliceerd: nieuw } : i)));
    const { error } = await supabase.from("agenda").update({ gepubliceerd: nieuw }).eq("id", item.id);
    if (error) {
      setItems((all) => all.map((i) => (i.id === item.id ? { ...i, gepubliceerd: item.gepubliceerd } : i)));
      melding("Zichtbaarheid wijzigen lukte niet. Probeer het opnieuw.");
    } else {
      melding(nieuw ? `"${item.titel}" staat online` : `"${item.titel}" is verborgen`);
    }
  }

  const verborgen = items.filter((i) => !i.gepubliceerd).length;

  return (
    <div className="ag-page">
      <header className="ag-head">
        <div>
          <h1>Agenda</h1>
          <p className="ag-sub">
            {loading ? "Laden…" : `${komend.length} gepland, ${archief.length} in het archief${verborgen ? `, ${verborgen} verborgen` : ""}`}
          </p>
        </div>
        <button className="ag-btn ag-btn--primary" onClick={openNieuw}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Nieuw optreden
        </button>
      </header>

      <div className="ag-toolbar">
        <div className="ag-tabs" role="tablist" aria-label="Optredens filteren">
          <button role="tab" aria-selected={tab === "komend"} onClick={() => setTab("komend")}>
            Komend <span className="ag-count">{komend.length}</span>
          </button>
          <button role="tab" aria-selected={tab === "archief"} onClick={() => setTab("archief")}>
            Archief <span className="ag-count">{archief.length}</span>
          </button>
        </div>
        <div className="ag-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op titel of locatie" aria-label="Zoek op titel of locatie" />
        </div>
      </div>

      <div className="ag-content">
        {loading ? (
          <div className="ag-skeleton" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} />)}</div>
        ) : loadErr ? (
          <div className="ag-empty">
            <p className="ag-empty-title">De agenda kon niet worden geladen</p>
            <p>{loadErr}</p>
            <button className="ag-btn ag-btn--ghost" onClick={() => { setLoading(true); load(); }}>Opnieuw proberen</button>
          </div>
        ) : groepen.length === 0 ? (
          <div className="ag-empty">
            {zoek ? (
              <>
                <p className="ag-empty-title">Niets gevonden voor &ldquo;{zoek}&rdquo;</p>
                <p>Zoek op een deel van de titel of de plaatsnaam.</p>
              </>
            ) : tab === "komend" ? (
              <>
                <p className="ag-empty-title">Er staat nog niets gepland</p>
                <p>Het eerstvolgende optreden verschijnt automatisch op de homepage.</p>
                <button className="ag-btn ag-btn--primary" onClick={openNieuw}>Nieuw optreden</button>
              </>
            ) : (
              <p className="ag-empty-title">Nog geen afgelopen optredens</p>
            )}
          </div>
        ) : (
          groepen.map((g) => (
            <section key={g.titel} className="ag-group">
              <h2 className="ag-month">{g.titel}</h2>
              <ul className="ag-list">
                {g.items.map((item) => (
                  <li key={item.id} className="ag-row" data-hidden={!item.gepubliceerd || undefined} data-past={tab === "archief" || undefined} onClick={() => openEdit(item)}>
                    <div className="ag-stub" aria-hidden="true">
                      {item.datum_sorteer ? (
                        <>
                          <span className="ag-stub-day">{nl(item.datum_sorteer, { weekday: "short" })}</span>
                          <span className="ag-stub-num">{Number(item.datum_sorteer.slice(8, 10))}</span>
                          <span className="ag-stub-month">{nl(item.datum_sorteer, { month: "short" })}</span>
                        </>
                      ) : (
                        <span className="ag-stub-num">?</span>
                      )}
                    </div>

                    <div className="ag-main">
                      <button className="ag-title" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>{item.titel}</button>
                      <div className="ag-meta">
                        {item.locatie && <span><IconMapPin size={13} />{item.locatie}</span>}
                        {item.tijd && <span><IconClock size={13} />{item.tijd}</span>}
                        {!item.locatie && !item.tijd && <span className="ag-missing">Locatie en tijd nog onbekend</span>}
                      </div>
                    </div>

                    <div className="ag-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        role="switch"
                        aria-checked={item.gepubliceerd}
                        aria-label={`${item.titel} zichtbaar op de website`}
                        className="ag-switch"
                        onClick={() => togglePublish(item)}
                        title={item.gepubliceerd ? "Zichtbaar op de website" : "Verborgen voor bezoekers"}
                      >
                        <span className="ag-switch-knob" />
                      </button>
                      <span className="ag-status">{item.gepubliceerd ? "Online" : "Verborgen"}</span>
                      {item.gepubliceerd ? (
                        <a className="ag-icon-btn" href={`/agenda/${item.id}`} target="_blank" rel="noopener" title="Bekijk op de website" aria-label={`Bekijk ${item.titel} op de website`}>
                          <IconEye size={16} />
                        </a>
                      ) : (
                        <span className="ag-icon-btn ag-icon-btn--off" aria-hidden="true"><IconEye size={16} /></span>
                      )}
                      <button className="ag-icon-btn" onClick={() => dupliceer(item)} title="Dupliceren" aria-label={`${item.titel} dupliceren`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {drawer && (
        <AgendaDrawer
          key={drawer.mode === "edit" ? drawer.item.id : "new"}
          mode={drawer.mode}
          initial={drawer.initial}
          albums={albums}
          onClose={sluit}
          onSave={save}
          onDelete={drawer.mode === "edit" ? remove : undefined}
        />
      )}

      {toast && <div key={toast.key} className="ag-toast" role="status">{toast.msg}</div>}

      <style>{`
        .ag-page {
          --ink: #1C1917; --ink-2: #57534E; --ink-3: #A8A29E;
          --line: #E7E5E4; --line-soft: #F0EFED; --canvas: #F7F6F3;
          --ok: #15803D;
          min-height: 100%; color: var(--ink);
        }
        .ag-head {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
          padding: 36px 40px 20px; max-width: 1040px;
        }
        .ag-head h1 {
          margin: 0; font-family: var(--font-display), var(--font-manrope), sans-serif;
          font-size: 40px; font-weight: 800; letter-spacing: -0.035em; line-height: 1;
        }
        .ag-sub { margin: 10px 0 0; font-size: 14px; color: var(--ink-2); }

        .ag-toolbar {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: 12px 40px; max-width: 1040px;
          background: color-mix(in srgb, var(--canvas) 88%, transparent);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        }
        .ag-tabs { display: inline-flex; padding: 3px; background: #EDECE9; border-radius: 12px; }
        .ag-tabs button {
          border: 0; background: transparent; padding: 7px 14px; border-radius: 9px; cursor: pointer;
          font: inherit; font-size: 13px; font-weight: 600; color: var(--ink-2); display: inline-flex; align-items: center; gap: 8px;
        }
        .ag-tabs button[aria-selected="true"] { background: #fff; color: var(--ink); box-shadow: 0 1px 2px rgba(28,25,23,0.08), 0 0 0 1px rgba(28,25,23,0.04); }
        .ag-count { font-size: 12px; font-weight: 700; color: var(--ink-3); font-variant-numeric: tabular-nums; }
        .ag-tabs button[aria-selected="true"] .ag-count { color: var(--primary); }

        .ag-search { position: relative; display: flex; align-items: center; color: var(--ink-3); }
        .ag-search svg { position: absolute; left: 12px; pointer-events: none; }
        .ag-search input {
          width: 260px; padding: 9px 12px 9px 34px; font: inherit; font-size: 14px; color: var(--ink);
          background: #fff; border: 1px solid var(--line); border-radius: 10px; outline: none;
        }

        .ag-content { padding: 8px 40px 64px; max-width: 1040px; }
        .ag-group + .ag-group { margin-top: 28px; }
        .ag-month {
          margin: 0 0 10px; font-family: var(--font-display), var(--font-manrope), sans-serif;
          font-size: 17px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink);
        }
        .ag-list { list-style: none; margin: 0; padding: 0; background: #fff; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; }
        .ag-row {
          display: grid; grid-template-columns: 64px 1fr auto; align-items: center; gap: 20px;
          padding: 14px 16px 14px 14px; cursor: pointer; transition: background 0.12s;
        }
        .ag-row + .ag-row { border-top: 1px solid var(--line-soft); }
        .ag-row:hover { background: #FCFBFA; }

        .ag-stub {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 64px; border-radius: 12px; background: #FFF1EA; color: var(--primary);
        }
        .ag-row[data-past] .ag-stub { background: #F2F1EF; color: var(--ink-2); }
        .ag-row[data-hidden] .ag-stub { background: transparent; box-shadow: inset 0 0 0 1.5px var(--line); color: var(--ink-3); }
        .ag-stub-day, .ag-stub-month { font-size: 11px; font-weight: 700; line-height: 1; }
        .ag-stub-num {
          font-family: var(--font-display), var(--font-manrope), sans-serif;
          font-size: 26px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; font-variant-numeric: tabular-nums;
        }

        .ag-main { min-width: 0; }
        .ag-title {
          all: unset; cursor: pointer; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink);
          overflow-wrap: anywhere; border-radius: 4px;
        }
        .ag-row[data-hidden] .ag-title { color: var(--ink-2); }
        .ag-title:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
        .ag-meta { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 5px; font-size: 13px; color: var(--ink-2); }
        .ag-meta span { display: inline-flex; align-items: center; gap: 5px; }
        .ag-meta svg { color: var(--ink-3); flex-shrink: 0; }
        .ag-missing { color: var(--ink-3); font-style: italic; }

        .ag-actions { display: flex; align-items: center; gap: 6px; }
        .ag-status { width: 64px; font-size: 12px; font-weight: 600; color: var(--ink-3); }
        .ag-switch[aria-checked="true"] + .ag-status { color: var(--ok); }

        .ag-switch {
          position: relative; flex-shrink: 0; width: 36px; height: 21px; padding: 0; border: 0; border-radius: 100px;
          background: #D6D3D1; cursor: pointer; transition: background 0.18s;
        }
        .ag-switch[aria-checked="true"] { background: var(--ok); }
        .ag-switch-knob {
          position: absolute; top: 2.5px; left: 2.5px; width: 16px; height: 16px; border-radius: 50%; background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2); transition: transform 0.18s var(--ease-out);
        }
        .ag-switch[aria-checked="true"] .ag-switch-knob { transform: translateX(15px); }
        .ag-switch:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

        .ag-icon-btn {
          display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px;
          border: 0; border-radius: 9px; background: transparent; color: var(--ink-2); cursor: pointer; text-decoration: none;
        }
        .ag-icon-btn:hover { background: #F2F1EF; color: var(--ink); }
        .ag-icon-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 1px; }
        .ag-icon-btn--off { color: #E2E0DD; cursor: default; }
        .ag-icon-btn--off:hover { background: transparent; color: #E2E0DD; }

        .ag-btn {
          display: inline-flex; align-items: center; gap: 7px; padding: 10px 16px; border-radius: 10px;
          font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; border: 1px solid transparent;
        }
        .ag-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
        .ag-btn--primary { background: var(--primary); color: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.18); }
        .ag-btn--ghost { background: #fff; color: var(--ink); border-color: var(--line); }
        .ag-btn--danger { background: transparent; color: #B91C1C; padding-left: 10px; padding-right: 10px; }
        .ag-btn--danger:hover { background: #FEF2F2; }
        .ag-btn--danger-solid { background: #DC2626; color: #fff; }

        .ag-empty { padding: 56px 24px; text-align: center; color: var(--ink-2); font-size: 14px; background: #fff; border: 1px dashed var(--line); border-radius: 16px; }
        .ag-empty p { margin: 0 0 6px; }
        .ag-empty-title { font-size: 16px; font-weight: 700; color: var(--ink); }
        .ag-empty .ag-btn { margin-top: 14px; }

        .ag-skeleton { display: grid; gap: 10px; }
        .ag-skeleton div { height: 92px; border-radius: 16px; background: linear-gradient(90deg, #EFEEEC 0%, #F6F5F3 50%, #EFEEEC 100%); background-size: 200% 100%; animation: ag-shimmer 1.4s infinite; }
        @keyframes ag-shimmer { to { background-position: -200% 0; } }

        /* Drawer */
        .ag-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(28,25,23,0.32); animation: ag-fade 0.2s ease-out; }
        .ag-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 51; width: min(520px, 100vw);
          display: flex; flex-direction: column; background: #fff; color: var(--ink);
          box-shadow: -24px 0 60px -20px rgba(28,25,23,0.3); animation: ag-slide 0.28s var(--ease-out);
        }
        @keyframes ag-fade { from { opacity: 0; } }
        @keyframes ag-slide { from { transform: translateX(40px); opacity: 0; } }
        .ag-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px 18px; border-bottom: 1px solid var(--line-soft); }
        .ag-drawer-head h2 { margin: 0; font-family: var(--font-display), var(--font-manrope), sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
        .ag-drawer-body { flex: 1; overflow-y: auto; padding: 8px 24px 24px; }
        .ag-fieldset { padding: 18px 0; }
        .ag-fieldset + .ag-fieldset { border-top: 1px solid var(--line-soft); }
        .ag-fieldset h3 { margin: 0 0 4px; font-size: 15px; font-weight: 700; }
        .ag-field + .ag-field, .ag-grid-2 + .ag-field, .ag-field + .ag-grid-2 { margin-top: 16px; }
        .ag-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ag-grid-2 > .ag-field { margin-top: 0; }
        .ag-field label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--ink); }
        .ag-optional { font-weight: 500; color: var(--ink-3); margin-left: 4px; }
        .ag-input {
          width: 100%; box-sizing: border-box; padding: 10px 12px; font: inherit; font-size: 14px; color: var(--ink);
          background: #fff; border: 1px solid var(--line); border-radius: 10px; outline: none;
        }
        textarea.ag-input { resize: vertical; line-height: 1.55; }
        .ag-input[aria-invalid="true"] { border-color: #DC2626; }
        .ag-hint { margin: 6px 0 0; font-size: 12.5px; color: var(--ink-2); line-height: 1.45; }
        .ag-err { margin: 6px 0 0; font-size: 12.5px; font-weight: 600; color: #B91C1C; }

        .ag-drawer-foot { padding: 14px 24px 18px; border-top: 1px solid var(--line); background: #FCFBFA; }
        .ag-server-err { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: #FEF2F2; color: #991B1B; font-size: 13px; font-weight: 600; }
        .ag-publish { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: var(--ink-2); cursor: pointer; margin-bottom: 14px; }
        .ag-foot-actions { display: flex; align-items: center; gap: 8px; }

        .ag-toast {
          position: fixed; left: 50%; bottom: 28px; z-index: 60; transform: translateX(-50%);
          padding: 11px 18px; border-radius: 12px; background: var(--ink); color: #fff; font-size: 14px; font-weight: 600;
          box-shadow: 0 12px 32px -8px rgba(28,25,23,0.45); animation: ag-toast 0.25s var(--ease-out);
        }
        @keyframes ag-toast { from { opacity: 0; transform: translate(-50%, 8px); } }

        @media (max-width: 760px) {
          .ag-head { padding: 24px 20px 12px; }
          .ag-head h1 { font-size: 32px; }
          .ag-toolbar, .ag-content { padding-left: 20px; padding-right: 20px; }
          .ag-search, .ag-search input { width: 100%; }
          .ag-row { grid-template-columns: 52px 1fr; gap: 14px; }
          .ag-stub { height: 56px; align-self: start; }
          .ag-actions { grid-column: 2; margin-left: -8px; }
          .ag-grid-2 { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ag-overlay, .ag-drawer, .ag-toast, .ag-skeleton div { animation: none; }
          .ag-switch, .ag-switch-knob { transition: none; }
        }
      `}</style>
    </div>
  );
}
