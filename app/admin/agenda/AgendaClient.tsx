"use client";

import { useCallback, useMemo, useOptimistic, useState, useTransition } from "react";
import { IconClock, IconMapPin, IconEye } from "@/components/icons";
import { DateStub, IconCopy, IconPlus, IconSearch, Switch, maandTitel, useToast, vandaag } from "../_components/ui";
import AgendaDrawer, { toForm, type AgendaForm, type AgendaItem, type Album } from "./AgendaDrawer";
import { bewaarOptreden, verwijderOptreden, zetOptredenZichtbaar, type AgendaInput } from "./actions";

type DrawerState = { mode: "new"; initial: AgendaForm } | { mode: "edit"; item: AgendaItem; initial: AgendaForm };

export default function AgendaClient({ items, albums, loadError }: { items: AgendaItem[]; albums: Album[]; loadError?: string }) {
  const [tab, setTab]       = useState<"komend" | "archief">("komend");
  const [zoek, setZoek]     = useState("");
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [toast, melding]    = useToast();
  const [, startTransition] = useTransition();
  const [lijst, zetOptimistisch] = useOptimistic(items, (state, u: { id: number; gepubliceerd: boolean }) =>
    state.map((i) => (i.id === u.id ? { ...i, gepubliceerd: u.gepubliceerd } : i))
  );

  const today   = vandaag();
  const komend  = useMemo(() => lijst.filter((i) => !i.datum_sorteer || i.datum_sorteer >= today), [lijst, today]);
  const archief = useMemo(() => lijst.filter((i) => i.datum_sorteer && i.datum_sorteer < today).reverse(), [lijst, today]);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const gefilterd = (tab === "komend" ? komend : archief).filter(
      (i) => !q || i.titel.toLowerCase().includes(q) || (i.locatie ?? "").toLowerCase().includes(q)
    );
    const out: { titel: string; items: AgendaItem[] }[] = [];
    for (const item of gefilterd) {
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

  async function save(input: AgendaInput) {
    if (!drawer) return null;
    const res = await bewaarOptreden(drawer.mode === "edit" ? drawer.item.id : null, input);
    if (res.error) return res.error;
    setDrawer(null);
    setTab(input.datum_sorteer && input.datum_sorteer < today ? "archief" : "komend");
    melding(drawer.mode === "edit" ? "Wijzigingen opgeslagen" : "Optreden toegevoegd");
    return null;
  }

  async function remove() {
    if (drawer?.mode !== "edit") return null;
    const res = await verwijderOptreden(drawer.item.id);
    if (res.error) return res.error;
    setDrawer(null);
    melding("Optreden verwijderd");
    return null;
  }

  function togglePublish(item: AgendaItem) {
    const nieuw = !item.gepubliceerd;
    startTransition(async () => {
      zetOptimistisch({ id: item.id, gepubliceerd: nieuw });
      const res = await zetOptredenZichtbaar(item.id, nieuw);
      melding(res.error ? "Zichtbaarheid wijzigen lukte niet. Probeer het opnieuw." : nieuw ? `"${item.titel}" staat online` : `"${item.titel}" is verborgen`);
    });
  }

  const verborgen = lijst.filter((i) => !i.gepubliceerd).length;

  return (
    <div>
      <header className="adm-head">
        <div>
          <h1>Agenda</h1>
          <p className="adm-sub">{`${komend.length} gepland, ${archief.length} in het archief${verborgen ? `, ${verborgen} verborgen` : ""}`}</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openNieuw}><IconPlus /> Nieuw optreden</button>
      </header>

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Optredens filteren">
          <button role="tab" aria-selected={tab === "komend"} onClick={() => setTab("komend")}>
            Komend <span className="adm-count">{komend.length}</span>
          </button>
          <button role="tab" aria-selected={tab === "archief"} onClick={() => setTab("archief")}>
            Archief <span className="adm-count">{archief.length}</span>
          </button>
        </div>
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op titel of locatie" aria-label="Zoek op titel of locatie" />
        </div>
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty">
            <p className="adm-empty-title">De agenda kon niet worden geladen</p>
            <p>{loadError}</p>
          </div>
        ) : groepen.length === 0 ? (
          <div className="adm-empty">
            {zoek ? (
              <>
                <p className="adm-empty-title">Niets gevonden voor &ldquo;{zoek}&rdquo;</p>
                <p>Zoek op een deel van de titel of de plaatsnaam.</p>
              </>
            ) : tab === "komend" ? (
              <>
                <p className="adm-empty-title">Er staat nog niets gepland</p>
                <p>Het eerstvolgende optreden verschijnt automatisch op de homepage.</p>
                <button className="adm-btn adm-btn--primary" onClick={openNieuw}>Nieuw optreden</button>
              </>
            ) : (
              <p className="adm-empty-title">Nog geen afgelopen optredens</p>
            )}
          </div>
        ) : (
          groepen.map((g) => (
            <section key={g.titel} className="adm-group">
              <h2 className="adm-group-title">{g.titel}</h2>
              <ul className="adm-list">
                {g.items.map((item) => (
                  <li key={item.id} className="adm-row" data-hidden={!item.gepubliceerd || undefined} data-past={tab === "archief" || undefined} onClick={() => openEdit(item)}>
                    <DateStub iso={item.datum_sorteer} />

                    <div className="adm-main-col">
                      <button className="adm-title" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>{item.titel}</button>
                      <div className="adm-meta">
                        {item.locatie && <span><IconMapPin size={13} />{item.locatie}</span>}
                        {item.tijd && <span><IconClock size={13} />{item.tijd}</span>}
                        {!item.locatie && !item.tijd && <span className="adm-missing">Locatie en tijd nog onbekend</span>}
                      </div>
                    </div>

                    <div className="adm-actions" onClick={(e) => e.stopPropagation()}>
                      <Switch checked={item.gepubliceerd} onChange={() => togglePublish(item)} label={`${item.titel} zichtbaar op de website`} />
                      <span className="adm-status">{item.gepubliceerd ? "Online" : "Verborgen"}</span>
                      {item.gepubliceerd ? (
                        <a className="adm-icon-btn" href={`/agenda/${item.id}`} target="_blank" rel="noopener" title="Bekijk op de website" aria-label={`Bekijk ${item.titel} op de website`}>
                          <IconEye size={16} />
                        </a>
                      ) : (
                        <span className="adm-icon-btn adm-icon-btn--off" aria-hidden="true"><IconEye size={16} /></span>
                      )}
                      <button className="adm-icon-btn" onClick={() => dupliceer(item)} title="Dupliceren" aria-label={`${item.titel} dupliceren`}>
                        <IconCopy />
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
      {toast}
    </div>
  );
}
