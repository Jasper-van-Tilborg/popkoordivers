"use client";

import { useMemo, useState } from "react";
import { DateStub, IconDownload, IconPlus, IconSearch, formatDatum, useNaijlen, useToast } from "../../_components/ui";
import DocumentVenster from "../DocumentVenster";
import { gewoon, openBestand, soort, type Document } from "../documenten";

// Alle nieuwsbrieven per jaar, nieuwste bovenaan. Openen en downloaden kan meteen
// vanuit de lijst; een klik op de regel opent het venster om te bewerken.
export default function NieuwsbrievenClient({ items, loadError, startNieuw, startId }: {
  items: Document[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [zoek, setZoek]       = useState("");
  const [gekozen, setGekozen] = useState<string | null>(startNieuw ? "nieuw" : startId ?? null);
  const [open, sluitend]      = useNaijlen(gekozen);
  const [toast, melding]      = useToast();

  const brief = open && open !== "nieuw" ? items.find((d) => String(d.id) === open) ?? null : null;

  const jaren = useMemo(() => {
    const woorden = gewoon(zoek).split(/\s+/).filter(Boolean);
    const lijst = items
      .filter((d) => woorden.every((w) => gewoon(`${d.naam} ${d.datum ? formatDatum(d.datum) : ""}`).includes(w)))
      .sort((a, b) => (b.datum ?? "").localeCompare(a.datum ?? "") || b.naam.localeCompare(a.naam, "nl", { numeric: true }));
    const out: { jaar: string; items: Document[] }[] = [];
    for (const d of lijst) {
      const jaar = d.datum?.slice(0, 4) ?? "Zonder datum";
      const laatste = out[out.length - 1];
      if (laatste?.jaar === jaar) laatste.items.push(d);
      else out.push({ jaar, items: [d] });
    }
    return out;
  }, [items, zoek]);

  async function openen(d: Document, opslaan: boolean) {
    if (!(await openBestand(d.id, opslaan))) melding("Dit bestand kon niet worden geopend");
  }

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Nieuwsbrieven</h1>
          <p className="adm-sub">{items.length} nieuwsbrieven</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setGekozen("nieuw")}><IconPlus /> Nieuwsbrief toevoegen</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Naam, nummer of datum" aria-label="Zoek in nieuwsbrieven" />
        </div>
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">De nieuwsbrieven konden niet worden geladen</p><p>{loadError}</p></div>
        ) : jaren.length === 0 ? (
          <div className="adm-empty"><p className="adm-empty-title">{zoek ? <>Niets gevonden voor &ldquo;{zoek}&rdquo;</> : "Nog geen nieuwsbrieven"}</p></div>
        ) : jaren.map((j) => (
          <section key={j.jaar} className="adm-group">
            <h2 className="adm-group-title">{j.jaar} <span className="adm-count">{j.items.length}</span></h2>
            <ul className="adm-list">
              {j.items.map((d) => (
                <li key={d.id} className="adm-row" onClick={() => setGekozen(String(d.id))}>
                  <DateStub iso={d.datum} />
                  <div className="adm-main-col">
                    <button className="adm-title" onClick={(e) => { e.stopPropagation(); setGekozen(String(d.id)); }}>{d.naam}</button>
                    <div className="adm-meta">
                      {d.datum && <span>{formatDatum(d.datum)}</span>}
                      <span>{soort(d.ext)}</span>
                    </div>
                  </div>
                  <span className="adm-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => openen(d, false)}>Openen</button>
                    <button type="button" className="adm-icon-btn" onClick={() => openen(d, true)} title="Downloaden" aria-label={`${d.naam} downloaden`}><IconDownload /></button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {open && (open === "nieuw" || brief) && (
        <DocumentVenster
          key={open}
          categorie="nieuwsbrieven"
          document={brief}
          alle={items}
          sluitend={sluitend}
          onClose={() => setGekozen(null)}
          onDone={(m) => { setGekozen(null); melding(m); }}
        />
      )}
      {toast}
    </div>
  );
}
