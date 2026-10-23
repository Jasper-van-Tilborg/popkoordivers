"use client";

import { useCallback, useMemo, useState } from "react";
import { IconClock, IconMapPin, IconEye } from "@/components/icons";
import { DateStub, IconCopy, IconPlus, IconSearch, Tabs, maandTitel, useToast, vandaag } from "../_components/ui";
import { Werkblad, kiesMetSchuif } from "../_components/Werkblad";
import AgendaDrawer, { toForm, type AgendaForm, type AgendaItem, type Album } from "./AgendaDrawer";
import { bewaarOptreden, verwijderOptreden, type AgendaInput } from "./actions";

// Wat er rechts open staat: een bestaand optreden, of een nieuw (eventueel als kopie)
type Gekozen = { id: string; kopie?: AgendaForm } | null;

export default function AgendaClient({ items, albums, loadError, startNieuw, startId }: {
  items: AgendaItem[];
  albums: Album[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [tab, setTab]   = useState<"komend" | "archief">("komend");
  const [zoek, setZoek] = useState("");
  const [gekozen, setGekozen] = useState<Gekozen>(startNieuw ? { id: "nieuw" } : startId ? { id: startId } : null);
  const [toast, melding] = useToast();

  const today   = vandaag();
  const komend  = useMemo(() => items.filter((i) => !i.datum_sorteer || i.datum_sorteer >= today), [items, today]);
  const archief = useMemo(() => items.filter((i) => i.datum_sorteer && i.datum_sorteer < today).reverse(), [items, today]);
  const item    = gekozen && gekozen.id !== "nieuw" ? items.find((i) => String(i.id) === gekozen.id) ?? null : null;

  // Een optreden uit het archief openen (bijv. via het overzicht): naar het juiste tabblad
  const [vorigeKeuze, setVorigeKeuze] = useState(gekozen?.id);
  if (gekozen?.id !== vorigeKeuze) {
    setVorigeKeuze(gekozen?.id);
    if (item?.datum_sorteer && item.datum_sorteer < today && tab !== "archief") setTab("archief");
  }

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const gefilterd = (tab === "komend" ? komend : archief).filter(
      (i) => !q || i.titel.toLowerCase().includes(q) || (i.locatie ?? "").toLowerCase().includes(q)
    );
    const out: { titel: string; items: AgendaItem[] }[] = [];
    for (const i of gefilterd) {
      const titel = maandTitel(i.datum_sorteer);
      const laatste = out[out.length - 1];
      if (laatste?.titel === titel) laatste.items.push(i);
      else out.push({ titel, items: [i] });
    }
    return out;
  }, [tab, komend, archief, zoek]);

  const kies = useCallback((nieuw: Gekozen) => {
    kiesMetSchuif(gekozen?.id ?? null, nieuw?.id ?? null, () => setGekozen(nieuw));
  }, [gekozen]);
  const sluit = useCallback(() => kies(null), [kies]);

  async function save(input: AgendaInput) {
    const res = await bewaarOptreden(item ? item.id : null, input);
    if (res.error) return res.error;
    setTab(input.datum_sorteer && input.datum_sorteer < today ? "archief" : "komend");
    setGekozen({ id: String(res.id) });
    melding(item ? "Wijzigingen opgeslagen" : "Optreden toegevoegd");
    return null;
  }

  async function remove() {
    if (!item) return null;
    const res = await verwijderOptreden(item.id);
    if (res.error) return res.error;
    setGekozen(null);
    melding("Optreden verwijderd");
    return null;
  }

  const verborgen = items.filter((i) => !i.gepubliceerd).length;

  const lijst = loadError ? (
    <div className="adm-empty"><p className="adm-empty-title">De agenda kon niet worden geladen</p><p>{loadError}</p></div>
  ) : (
    <>
      <button className="adm-wb-nieuw" data-id="nieuw" data-gekozen={gekozen?.id === "nieuw" || undefined} onClick={() => kies({ id: "nieuw" })}>
        <IconPlus /> Nieuw optreden
      </button>
      {groepen.length === 0 ? (
        <div className="adm-empty">
          {zoek
            ? <p className="adm-empty-title">Niets gevonden voor &ldquo;{zoek}&rdquo;</p>
            : <p className="adm-empty-title">{tab === "komend" ? "Er staat nog niets gepland" : "Nog geen afgelopen optredens"}</p>}
        </div>
      ) : groepen.map((g) => (
        <section key={g.titel} className="adm-group">
          <h2 className="adm-group-title">{g.titel}</h2>
          <ul className="adm-list">
            {g.items.map((i) => (
              <li
                key={i.id}
                data-id={String(i.id)}
                data-gekozen={gekozen?.id === String(i.id) || undefined}
                className="adm-row"
                data-hidden={!i.gepubliceerd || undefined}
                data-past={tab === "archief" || undefined}
                onClick={() => kies({ id: String(i.id) })}
              >
                <DateStub iso={i.datum_sorteer} />
                <div className="adm-main-col">
                  <button className="adm-title" onClick={(e) => { e.stopPropagation(); kies({ id: String(i.id) }); }}>{i.titel}</button>
                  <div className="adm-meta">
                    {i.locatie && <span><IconMapPin size={13} />{i.locatie}</span>}
                    {i.tijd && <span><IconClock size={13} />{i.tijd}</span>}
                    {!i.locatie && !i.tijd && <span className="adm-missing">Locatie en tijd nog onbekend</span>}
                  </div>
                </div>
                {!i.gepubliceerd && <span className="adm-pill">Verborgen</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );

  const blad = gekozen && (gekozen.id === "nieuw" || item) ? (
    <AgendaDrawer
      key={gekozen.id + (gekozen.kopie ? "-kopie" : "")}
      mode={item ? "edit" : "new"}
      initial={gekozen.kopie ?? toForm(item ?? undefined)}
      albums={albums}
      onClose={sluit}
      onSave={save}
      onDelete={item ? remove : undefined}
      acties={item && (
        <>
          {item.gepubliceerd && (
            <a className="adm-icon-btn" href={`/agenda/${item.id}`} target="_blank" rel="noopener" title="Bekijk op de website" aria-label="Bekijk op de website"><IconEye size={16} /></a>
          )}
          <button className="adm-icon-btn" title="Dupliceren" aria-label="Dupliceren" onClick={() => kies({ id: "nieuw", kopie: { ...toForm(item), datum_sorteer: "" } })}><IconCopy /></button>
        </>
      )}
    />
  ) : null;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Agenda</h1>
          <p className="adm-sub">{`${komend.length} gepland, ${archief.length} in het archief${verborgen ? `, ${verborgen} verborgen` : ""}`}</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => kies({ id: "nieuw" })}><IconPlus /> Nieuw optreden</button>
      </header>

      <div className="adm-toolbar">
        <Tabs
          label="Optredens filteren"
          value={tab}
          onChange={setTab}
          items={[{ id: "komend", label: "Komend", count: komend.length }, { id: "archief", label: "Archief", count: archief.length }]}
        />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek op titel of locatie" aria-label="Zoek op titel of locatie" />
        </div>
      </div>

      <div className="adm-content">
        <Werkblad
          gekozen={gekozen?.id ?? null}
          lijst={lijst}
          blad={blad}
          leeg={
            <>
              <p className="adm-empty-title">Kies een optreden</p>
              <p>Klik links op een optreden om het te bewerken, of voeg een nieuw optreden toe.</p>
              <button className="adm-btn adm-btn--primary" onClick={() => kies({ id: "nieuw" })}><IconPlus /> Nieuw optreden</button>
            </>
          }
        />
      </div>
      {toast}
    </div>
  );
}
