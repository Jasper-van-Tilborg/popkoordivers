"use client";

import { useMemo, useState } from "react";
import { IconEye } from "@/components/icons";
import { IconPlus, IconSearch, useNaijlen, useToast } from "../_components/ui";
import NieuwsDrawer, { type Bericht } from "./NieuwsDrawer";
import { bewaarBericht, verwijderBericht, type BerichtInput } from "./actions";

// Alle berichten als kaarten met hun afbeelding; bewerken in een venster.
export default function NieuwsClient({ items, loadError, startNieuw, startId }: {
  items: Bericht[];
  loadError?: string;
  startNieuw?: boolean;
  startId?: string;
}) {
  const [zoek, setZoek] = useState("");
  const [gekozen, setGekozen] = useState<string | null>(startNieuw ? "nieuw" : startId ?? null);
  const [open, sluitend] = useNaijlen(gekozen);
  const [toast, melding] = useToast();

  const bericht = open && open !== "nieuw" ? items.find((b) => String(b.id) === open) ?? null : null;
  const zichtbaar = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    return items.filter((b) => !q || b.titel.toLowerCase().includes(q) || b.intro.toLowerCase().includes(q));
  }, [items, zoek]);

  async function save(input: BerichtInput) {
    const res = await bewaarBericht(bericht?.id ?? null, input);
    if (res.error) return res.error;
    setGekozen(null);
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
  const metBeeld = (b: Bericht) => /^(https?:\/\/|\/)/.test(b.afbeelding);

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Nieuws</h1>
          <p className="adm-sub">{`${items.length} bericht${items.length === 1 ? "" : "en"}${verborgen ? `, ${verborgen} verborgen` : ""}`}</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setGekozen("nieuw")}><IconPlus /> Nieuw bericht</button>
      </header>

      <div className="adm-toolbar">
        <span />
        <div className="adm-search">
          <IconSearch />
          <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek in berichten" aria-label="Zoek in berichten" />
        </div>
      </div>

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">Het nieuws kon niet worden geladen</p><p>{loadError}</p></div>
        ) : zichtbaar.length === 0 && zoek ? (
          <div className="adm-empty"><p className="adm-empty-title">Niets gevonden voor &ldquo;{zoek}&rdquo;</p></div>
        ) : (
          <ul className="adm-cards">
            {!zoek && (
              <li>
                <button className="adm-card-nieuw" style={{ width: "100%", height: "100%" }} onClick={() => setGekozen("nieuw")}>
                  <IconPlus /> Nieuw bericht
                </button>
              </li>
            )}
            {zichtbaar.map((b, i) => (
              <li key={b.id} className="adm-card" data-hidden={!b.gepubliceerd || undefined}
                style={{ animationDelay: `${Math.min(i, 8) * 30 + 60}ms` }} onClick={() => setGekozen(String(b.id))}>
                <div className="adm-card-beeld">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {metBeeld(b) && <img src={b.afbeelding} alt="" loading="lazy" />}
                </div>
                <div className="adm-card-body">
                  <div className="adm-meta"><span>{b.datum}</span><span>{b.categorie}</span></div>
                  <button className="adm-title" onClick={(e) => { e.stopPropagation(); setGekozen(String(b.id)); }}>{b.titel}</button>
                  {b.intro && <p className="adm-card-tekst">{b.intro}</p>}
                </div>
                <div className="adm-card-foot">
                  {b.gepubliceerd ? <span className="adm-pill adm-pill--brand">Op de website</span> : <span className="adm-pill">Verborgen</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (open === "nieuw" || bericht) && (
        <NieuwsDrawer
          key={open}
          bericht={bericht}
          sluitend={sluitend}
          onClose={() => setGekozen(null)}
          onSave={save}
          onDelete={bericht ? remove : undefined}
          acties={bericht?.gepubliceerd && (
            <a className="adm-icon-btn" href={`/nieuws/${bericht.slug}`} target="_blank" rel="noopener" title="Bekijk op de website" aria-label="Bekijk op de website"><IconEye size={16} /></a>
          )}
        />
      )}
      {toast}
    </div>
  );
}
