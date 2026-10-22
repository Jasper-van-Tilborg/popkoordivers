"use client";

import { useCallback, useMemo, useOptimistic, useState, useTransition } from "react";
import { IconEye } from "@/components/icons";
import { IconPlus, IconSearch, Switch, useToast } from "../_components/ui";
import NieuwsDrawer, { type Bericht } from "./NieuwsDrawer";
import { bewaarBericht, verwijderBericht, zetBerichtZichtbaar, type BerichtInput } from "./actions";

type DrawerState = { bericht: Bericht | null };

export default function NieuwsClient({ items, loadError }: { items: Bericht[]; loadError?: string }) {
  const [zoek, setZoek]     = useState("");
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [toast, melding]    = useToast();
  const [, startTransition] = useTransition();
  const [lijst, zetOptimistisch] = useOptimistic(items, (state, u: { id: number; gepubliceerd: boolean }) =>
    state.map((i) => (i.id === u.id ? { ...i, gepubliceerd: u.gepubliceerd } : i))
  );

  const zichtbaar = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    return lijst.filter((b) => !q || b.titel.toLowerCase().includes(q) || b.intro.toLowerCase().includes(q));
  }, [lijst, zoek]);

  const sluit = useCallback(() => setDrawer(null), []);

  async function save(input: BerichtInput) {
    const id = drawer?.bericht?.id ?? null;
    const res = await bewaarBericht(id, input);
    if (res.error) return res.error;
    setDrawer(null);
    melding(id ? "Wijzigingen opgeslagen" : "Bericht geplaatst");
    return null;
  }

  async function remove() {
    if (!drawer?.bericht) return null;
    const res = await verwijderBericht(drawer.bericht.id);
    if (res.error) return res.error;
    setDrawer(null);
    melding("Bericht verwijderd");
    return null;
  }

  function togglePublish(b: Bericht) {
    const nieuw = !b.gepubliceerd;
    startTransition(async () => {
      zetOptimistisch({ id: b.id, gepubliceerd: nieuw });
      const res = await zetBerichtZichtbaar(b.id, nieuw);
      melding(res.error ? "Zichtbaarheid wijzigen lukte niet. Probeer het opnieuw." : nieuw ? `"${b.titel}" staat online` : `"${b.titel}" is verborgen`);
    });
  }

  const verborgen = lijst.filter((b) => !b.gepubliceerd).length;

  return (
    <div>
      <header className="adm-head">
        <div>
          <h1>Nieuws</h1>
          <p className="adm-sub">{`${lijst.length} bericht${lijst.length === 1 ? "" : "en"}${verborgen ? `, ${verborgen} verborgen` : ""}`}</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setDrawer({ bericht: null })}><IconPlus /> Nieuw bericht</button>
      </header>

      {lijst.length > 5 && (
        <div className="adm-toolbar">
          <span />
          <div className="adm-search">
            <IconSearch />
            <input type="search" value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek in berichten" aria-label="Zoek in berichten" />
          </div>
        </div>
      )}

      <div className="adm-content">
        {loadError ? (
          <div className="adm-empty"><p className="adm-empty-title">Het nieuws kon niet worden geladen</p><p>{loadError}</p></div>
        ) : zichtbaar.length === 0 ? (
          <div className="adm-empty">
            {zoek ? (
              <p className="adm-empty-title">Niets gevonden voor &ldquo;{zoek}&rdquo;</p>
            ) : (
              <>
                <p className="adm-empty-title">Nog geen nieuwsberichten</p>
                <p>Vertel bezoekers over optredens, nieuwe leden of andere hoogtepunten.</p>
                <button className="adm-btn adm-btn--primary" onClick={() => setDrawer({ bericht: null })}>Nieuw bericht</button>
              </>
            )}
          </div>
        ) : (
          <ul className="adm-list">
            {zichtbaar.map((b) => (
              <li key={b.id} className="adm-row adm-row--thumb" data-hidden={!b.gepubliceerd || undefined} onClick={() => setDrawer({ bericht: b })}>
                <span className="adm-thumb">
                  {/^(https?:\/\/|\/)/.test(b.afbeelding) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.afbeelding} alt="" loading="lazy" />
                  )}
                </span>
                <div className="adm-main-col">
                  <button className="adm-title" onClick={(e) => { e.stopPropagation(); setDrawer({ bericht: b }); }}>{b.titel}</button>
                  <div className="adm-meta"><span>{b.datum}</span></div>
                </div>
                <div className="adm-actions" onClick={(e) => e.stopPropagation()}>
                  <Switch checked={b.gepubliceerd} onChange={() => togglePublish(b)} label={`${b.titel} zichtbaar op de website`} />
                  <span className="adm-status">{b.gepubliceerd ? "Online" : "Verborgen"}</span>
                  {b.gepubliceerd ? (
                    <a className="adm-icon-btn" href={`/nieuws/${b.slug}`} target="_blank" rel="noopener" title="Bekijk op de website" aria-label={`Bekijk ${b.titel} op de website`}>
                      <IconEye size={16} />
                    </a>
                  ) : (
                    <span className="adm-icon-btn adm-icon-btn--off" aria-hidden="true"><IconEye size={16} /></span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {drawer && (
        <NieuwsDrawer
          key={drawer.bericht?.id ?? "new"}
          bericht={drawer.bericht}
          onClose={sluit}
          onSave={save}
          onDelete={drawer.bericht ? remove : undefined}
        />
      )}
      {toast}
    </div>
  );
}
