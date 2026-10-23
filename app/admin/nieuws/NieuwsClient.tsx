"use client";

import { useCallback, useMemo, useState } from "react";
import { IconEye } from "@/components/icons";
import { IconPlus, IconSearch, useToast } from "../_components/ui";
import { Werkblad, kiesMetSchuif } from "../_components/Werkblad";
import NieuwsDrawer, { type Bericht } from "./NieuwsDrawer";
import { bewaarBericht, verwijderBericht, type BerichtInput } from "./actions";

export default function NieuwsClient({ items, loadError, startNieuw, startId }: {
  items: Bericht[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [zoek, setZoek] = useState("");
  const [gekozen, setGekozen] = useState<string | null>(startNieuw ? "nieuw" : startId ?? null);
  const [toast, melding] = useToast();

  const bericht = gekozen && gekozen !== "nieuw" ? items.find((b) => String(b.id) === gekozen) ?? null : null;
  const zichtbaar = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    return items.filter((b) => !q || b.titel.toLowerCase().includes(q) || b.intro.toLowerCase().includes(q));
  }, [items, zoek]);

  const kies = useCallback((id: string | null) => kiesMetSchuif(gekozen, id, () => setGekozen(id)), [gekozen]);
  const sluit = useCallback(() => kies(null), [kies]);

  async function save(input: BerichtInput) {
    const res = await bewaarBericht(bericht?.id ?? null, input);
    if (res.error) return res.error;
    setGekozen(String(res.id));
    melding(bericht ? "Wijzigingen opgeslagen" : "Bericht geplaatst");
    return null;
  }

  async function remove() {
    if (!bericht) return null;
    const res = await verwijderBericht(bericht.id);
    if (res.error) return res.error;
    setGekozen(null);
    melding("Bericht verwijderd");
    return null;
  }

  const verborgen = items.filter((b) => !b.gepubliceerd).length;

  const lijst = loadError ? (
    <div className="adm-empty"><p className="adm-empty-title">Het nieuws kon niet worden geladen</p><p>{loadError}</p></div>
  ) : (
    <>
      <button className="adm-wb-nieuw" data-id="nieuw" data-gekozen={gekozen === "nieuw" || undefined} onClick={() => kies("nieuw")}>
        <IconPlus /> Nieuw bericht
      </button>
      {zichtbaar.length === 0 ? (
        <div className="adm-empty">
          <p className="adm-empty-title">{zoek ? <>Niets gevonden voor &ldquo;{zoek}&rdquo;</> : "Nog geen nieuwsberichten"}</p>
        </div>
      ) : (
        <ul className="adm-list">
          {zichtbaar.map((b) => (
            <li
              key={b.id}
              data-id={String(b.id)}
              data-gekozen={gekozen === String(b.id) || undefined}
              className="adm-row adm-row--thumb"
              data-hidden={!b.gepubliceerd || undefined}
              onClick={() => kies(String(b.id))}
            >
              <span className="adm-thumb">
                {/^(https?:\/\/|\/)/.test(b.afbeelding) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.afbeelding} alt="" loading="lazy" />
                )}
              </span>
              <div className="adm-main-col">
                <button className="adm-title" onClick={(e) => { e.stopPropagation(); kies(String(b.id)); }}>{b.titel}</button>
                <div className="adm-meta"><span>{b.datum}</span><span>{b.categorie}</span></div>
              </div>
              {!b.gepubliceerd && <span className="adm-pill">Verborgen</span>}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const blad = gekozen && (gekozen === "nieuw" || bericht) ? (
    <NieuwsDrawer
      key={gekozen}
      bericht={bericht}
      onClose={sluit}
      onSave={save}
      onDelete={bericht ? remove : undefined}
      acties={bericht?.gepubliceerd && (
        <a className="adm-icon-btn" href={`/nieuws/${bericht.slug}`} target="_blank" rel="noopener" title="Bekijk op de website" aria-label="Bekijk op de website"><IconEye size={16} /></a>
      )}
    />
  ) : null;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Nieuws</h1>
          <p className="adm-sub">{`${items.length} bericht${items.length === 1 ? "" : "en"}${verborgen ? `, ${verborgen} verborgen` : ""}`}</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Nieuw bericht</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek in berichten" aria-label="Zoek in berichten" />
        </div>
      </div>

      <div className="adm-content">
        <Werkblad
          gekozen={gekozen}
          lijst={lijst}
          blad={blad}
          leeg={
            <>
              <p className="adm-empty-title">Kies een bericht</p>
              <p>Klik links op een bericht om het te bewerken, of vertel bezoekers iets nieuws.</p>
              <button className="adm-btn adm-btn--primary" onClick={() => kies("nieuw")}><IconPlus /> Nieuw bericht</button>
            </>
          }
        />
      </div>
      {toast}
    </div>
  );
}
