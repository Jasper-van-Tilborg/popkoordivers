"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteButton, Drawer, IconBack, IconStarSmall, IconTrash, IconUpload, Tabs, useNaijlen, useToast } from "../../_components/ui";
import { Vinkje } from "../../_components/velden";
import { uploadKlein, uploadNaarR2 } from "../../_components/upload";
import AlbumDrawer from "../AlbumDrawer";
import { fotoToevoegen, fotosToegevoegd, verwijderAlbum, verwijderFoto, wijzigAlbum, zetBijschrift, zetFotoVolgorde, zetImpressie, type AlbumInput } from "../actions";
import { VideoLijst, type AlbumKeuze, type Video } from "../Videos";

interface Foto { id: string; impressies: boolean; bijschrift: string | null; url: string; klein: string | null }
interface Upload { naam: string; voortgang: number; fout?: string }
type Actie = { soort: "impressie"; id: string; impressies: boolean } | { soort: "volgorde"; ids: string[] } | { soort: "bijschrift"; id: string; bijschrift: string | null };

// Eén foto groot, met het bijschrift en of hij op de website staat
function FotoVenster({ foto, nummer, aantal, sluitend, onClose, onBewaar, onVerwijder }: {
  foto: Foto;
  nummer: number;
  aantal: number;
  sluitend?: boolean;
  onClose: () => void;
  onBewaar: (bijschrift: string, impressie: boolean) => Promise<string | null>;
  onVerwijder: () => Promise<string | null>;
}) {
  const [bijschrift, setBijschrift] = useState(foto.bijschrift ?? "");
  const [impressie, setImpressie]   = useState(foto.impressies);
  const [busy, setBusy]             = useState<"save" | "delete" | null>(null);
  const [fout, setFout]             = useState("");
  const gewijzigd = bijschrift.trim() !== (foto.bijschrift ?? "") || impressie !== foto.impressies;

  async function bewaar() {
    setBusy("save");
    const f = await onBewaar(bijschrift, impressie);
    setBusy(null);
    if (f) setFout(f);
  }
  async function verwijder() {
    setBusy("delete");
    const f = await onVerwijder();
    setBusy(null);
    if (f) setFout(f);
  }

  return (
    <Drawer
      title={`Foto ${nummer} van ${aantal}`}
      onClose={busy ? () => {} : onClose}
      sluitend={sluitend}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            <DeleteButton onConfirm={verwijder} busy={busy === "delete"} />
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={!!busy}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={bewaar} disabled={!!busy || !gewijzigd}>{busy === "save" ? "Opslaan…" : "Opslaan"}</button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        <a className="adm-foto-groot" href={foto.url} target="_blank" rel="noopener">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt={foto.bijschrift ?? ""} />
        </a>
      </section>
      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="ft-bijschrift">Bijschrift</label>
          <input id="ft-bijschrift" className="adm-input" value={bijschrift} maxLength={200} onChange={(e) => setBijschrift(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && gewijzigd) bewaar(); }} />
        </div>
        <div className="adm-field adm-field--vinkje">
          <Vinkje checked={impressie} onChange={setImpressie}>Ook op de openbare website</Vinkje>
        </div>
      </section>
    </Drawer>
  );
}

export default function AlbumClient({ album, fotos, videos, albums, startTab }: {
  album: { id: string; slug: string; titel: string; datum: string; soort: string };
  fotos: Foto[];
  videos: Video[];
  albums: AlbumKeuze[];
  startTab: "fotos" | "videos";
}) {
  const router = useRouter();
  const [tab, setTab]         = useState(startTab);
  const [open, setOpen]       = useState<string | null>(null);
  const [toonFoto, fotoSluit] = useNaijlen(open);
  const [toast, melding]      = useToast();
  const [bewerken, setBewerken] = useState(false);
  const [toonBewerken, sluitend] = useNaijlen(bewerken ? true : null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag]       = useState(false);
  const [bezig, setBezig]     = useState<Set<string>>(new Set());
  const [bevestig, setBevestig] = useState<string | null>(null);
  const [, startTransition]   = useTransition();
  const [sleep, setSleep]     = useState<number | null>(null);
  // Foto's die er bij het openen al waren; alles daarna is nieuw en popt in
  const [bekend] = useState(() => new Set(fotos.map((f) => f.id)));
  const [lijst, pasToe] = useOptimistic(fotos, (state, a: Actie) =>
    a.soort === "impressie" ? state.map((f) => (f.id === a.id ? { ...f, impressies: a.impressies } : f))
    : a.soort === "bijschrift" ? state.map((f) => (f.id === a.id ? { ...f, bijschrift: a.bijschrift } : f))
    : a.ids.map((id) => state.find((f) => f.id === id)).filter((f): f is Foto => !!f)
  );

  const sluit = useCallback(() => setBewerken(false), []);
  const aantalImpressies = lijst.filter((f) => f.impressies).length;
  const uploading = uploads.some((u) => u.voortgang < 1 && !u.fout);

  async function uploadAlles(files: FileList | File[]) {
    const beelden = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!beelden.length) { melding("Kies foto's (jpg, png of webp)."); return; }

    setUploads(beelden.map((f) => ({ naam: f.name, voortgang: 0 })));
    const zet = (i: number, u: Partial<Upload>) => setUploads((all) => all.map((x, j) => (j === i ? { ...x, ...u } : x)));

    // Drie tegelijk: snel genoeg, zonder de verbinding te verstoppen
    let volgende = 0;
    let gelukt = 0;
    async function werker() {
      while (volgende < beelden.length) {
        const i = volgende++;
        try {
          const key = await uploadNaarR2(beelden[i], { soort: "album", albumId: album.id }, (v) => zet(i, { voortgang: v * 0.9 }));
          const klein = await uploadKlein(beelden[i], album.id);
          const res = await fotoToevoegen(album.id, key, klein);
          if (res.error) throw new Error(res.error);
          zet(i, { voortgang: 1 });
          gelukt++;
        } catch (e) {
          zet(i, { fout: e instanceof Error ? e.message : "Mislukt" });
        }
      }
    }
    await Promise.all([werker(), werker(), werker()]);

    if (gelukt) fotosToegevoegd(album.id, gelukt);
    router.refresh();
    const mislukt = beelden.length - gelukt;
    melding(mislukt ? `${gelukt} foto's toegevoegd, ${mislukt} mislukt` : `${gelukt} foto${gelukt === 1 ? "" : "'s"} toegevoegd`);
    if (!mislukt) setUploads([]);
  }

  function toggleImpressie(f: Foto) {
    const aan = !f.impressies;
    startTransition(async () => {
      pasToe({ soort: "impressie", id: f.id, impressies: aan });
      const res = await zetImpressie(f.id, aan);
      melding(res.error ? `Lukte niet: ${res.error}` : aan ? "Foto staat nu op de website" : "Foto staat niet meer op de website");
    });
  }

  function verplaats(van: number, naar: number) {
    if (van === naar || naar < 0 || naar >= lijst.length) return;
    const ids = lijst.map((f) => f.id);
    const [id] = ids.splice(van, 1);
    ids.splice(naar, 0, id);
    startTransition(async () => {
      pasToe({ soort: "volgorde", ids });
      const res = await zetFotoVolgorde(album.id, ids);
      if (res.error) melding(`Volgorde opslaan lukte niet: ${res.error}`);
    });
  }

  async function verwijder(f: Foto) {
    if (bevestig !== f.id) { setBevestig(f.id); return; }
    setBevestig(null);
    setBezig((s) => new Set(s).add(f.id));
    const res = await verwijderFoto(f.id);
    setBezig((s) => { const n = new Set(s); n.delete(f.id); return n; });
    melding(res.error ? `Verwijderen lukte niet: ${res.error}` : "Foto verwijderd");
  }

  // Vanuit het venster van één foto: bijschrift en/of website
  async function bewaarFoto(f: Foto, bijschrift: string, impressie: boolean): Promise<string | null> {
    const nieuw = bijschrift.trim() || null;
    if (nieuw !== f.bijschrift) {
      const res = await zetBijschrift(f.id, bijschrift);
      if (res.error) return res.error;
      startTransition(() => pasToe({ soort: "bijschrift", id: f.id, bijschrift: nieuw }));
    }
    if (impressie !== f.impressies) {
      const res = await zetImpressie(f.id, impressie);
      if (res.error) return res.error;
    }
    setOpen(null);
    melding("Foto opgeslagen");
    return null;
  }

  async function verwijderUitVenster(f: Foto): Promise<string | null> {
    const res = await verwijderFoto(f.id);
    if (res.error) return res.error;
    setOpen(null);
    melding("Foto verwijderd");
    return null;
  }

  async function bewaar(input: AlbumInput) {
    const res = await wijzigAlbum(album.id, input);
    if (res.error) return res.error;
    setBewerken(false);
    melding("Album bijgewerkt");
    return null;
  }

  async function verwijderHeleAlbum() {
    const res = await verwijderAlbum(album.id);
    if (res.error) return res.error;
    router.push("/admin/albums");
    return null;
  }

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <Link href="/admin/albums" className="adm-head-back"><IconBack /> Alle albums</Link>
          <h1>{album.titel}</h1>
          <p className="adm-sub">
            {album.datum}. {lijst.length} foto{lijst.length === 1 ? "" : "'s"}, waarvan {aantalImpressies} op de openbare website.
          </p>
        </div>
        <div className="adm-head-actions">
          {aantalImpressies > 0 && <a className="adm-btn adm-btn--ghost" href={`/media/${album.slug}`} target="_blank" rel="noopener">Bekijk op de website</a>}
          <button className="adm-btn adm-btn--ghost" onClick={() => setBewerken(true)}>Album bewerken</button>
        </div>
      </header>

      <div className="adm-toolbar">
        <Tabs label="Foto's of video's" value={tab} onChange={setTab}
          items={[{ id: "fotos", label: "Foto's", count: lijst.length }, { id: "videos", label: "Video's", count: videos.length }]} />
      </div>

      <div className="adm-content">
        {tab === "videos" ? (
          <VideoLijst videos={videos} albums={albums} albumId={album.id} melding={melding} />
        ) : (<>
        <label
          htmlFor="al-upload"
          className="adm-drop"
          data-drag={drag || undefined}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (!uploading) uploadAlles(e.dataTransfer.files); }}
          style={{ marginBottom: 20 }}
        >
          <IconUpload />
          <span><strong>Foto&apos;s toevoegen</strong>: kies ze of sleep ze hierheen. Je kunt er meerdere tegelijk kiezen.</span>
          <span className="adm-hint" style={{ margin: 0 }}>Grote foto&apos;s worden automatisch verkleind.</span>
        </label>
        <input id="al-upload" type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => { if (e.target.files) uploadAlles(e.target.files); e.target.value = ""; }} />

        {uploads.length > 0 && (
          <ul className="adm-list" style={{ marginBottom: 20 }} aria-live="polite">
            {uploads.map((u, i) => (
              <li key={i} className="adm-row adm-row--plain" style={{ cursor: "default" }}>
                <div className="adm-main-col">
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{u.naam}</span>
                  {u.fout
                    ? <p className="adm-err">{u.fout}</p>
                    : <div className="adm-progress" style={{ marginTop: 8 }}><div style={{ width: `${Math.round(u.voortgang * 100)}%` }} /></div>}
                </div>
                <span className="adm-status">{u.fout ? "Mislukt" : u.voortgang >= 1 ? "Klaar" : `${Math.round(u.voortgang * 100)}%`}</span>
              </li>
            ))}
          </ul>
        )}

        {lijst.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty-title">Dit album is nog leeg</p>
            <p>Voeg hierboven foto&apos;s toe. Ze zijn eerst alleen voor leden te zien.</p>
          </div>
        ) : (
          <>
          <p className="adm-hint" style={{ margin: "0 0 12px" }}>Sleep foto&apos;s of gebruik de pijltjes om de volgorde te veranderen. Zo staan ze ook op de website; de eerste foto met een ster is de omslag.</p>
          <ul className="adm-photos" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {lijst.map((f, i) => (
              <li
                key={f.id}
                className={bekend.has(f.id) ? "adm-photo" : "adm-photo adm-photo--nieuw"}
                data-busy={bezig.has(f.id) || undefined}
                data-sleep={sleep === i || undefined}
                draggable
                onDragStart={(e) => { setSleep(i); e.dataTransfer.effectAllowed = "move"; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (sleep !== null) verplaats(sleep, i); setSleep(null); }}
                onDragEnd={() => setSleep(null)}
              >
                <div className="adm-photo-move">
                  <button className="adm-photo-btn adm-photo-btn--icon" onClick={() => verplaats(i, i - 1)} disabled={i === 0} aria-label="Eén plek naar voren">‹</button>
                  <button className="adm-photo-btn adm-photo-btn--icon" onClick={() => verplaats(i, i + 1)} disabled={i === lijst.length - 1} aria-label="Eén plek naar achteren">›</button>
                </div>
                <button type="button" className="adm-photo-open" onClick={() => setOpen(f.id)} aria-label={`Foto ${i + 1} openen${f.bijschrift ? `: ${f.bijschrift}` : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.klein ?? f.url} alt="" loading="lazy" draggable={false} />
                </button>
                {f.bijschrift && <span className="adm-photo-bijschrift">{f.bijschrift}</span>}
                <div className="adm-photo-tools">
                  <button
                    className="adm-photo-btn"
                    aria-pressed={f.impressies}
                    onClick={() => toggleImpressie(f)}
                    title={f.impressies ? "Haal van de openbare website" : "Zet op de openbare website"}
                  >
                    <IconStarSmall filled={f.impressies} /> {f.impressies ? "Op website" : "Website"}
                  </button>
                  <button
                    className="adm-photo-btn adm-photo-btn--icon"
                    style={bevestig === f.id ? { width: "auto", padding: "0 10px", background: "#DC2626", color: "#fff" } : undefined}
                    onClick={() => verwijder(f)}
                    onBlur={() => setBevestig(null)}
                    aria-label={bevestig === f.id ? "Ja, foto verwijderen" : "Foto verwijderen"}
                    disabled={bezig.has(f.id)}
                  >
                    {bevestig === f.id ? "Verwijderen?" : <IconTrash />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          </>
        )}
        </>)}
      </div>

      {toonFoto && (() => {
        const i = lijst.findIndex((f) => f.id === toonFoto);
        const f = lijst[i];
        return f ? (
          <FotoVenster key={f.id} foto={f} nummer={i + 1} aantal={lijst.length} sluitend={fotoSluit}
            onClose={() => setOpen(null)} onBewaar={(b, imp) => bewaarFoto(f, b, imp)} onVerwijder={() => verwijderUitVenster(f)} />
        ) : null;
      })()}

      {toonBewerken && (
        <AlbumDrawer
          sluitend={sluitend}
          album={{ titel: album.titel, datum: album.datum, soort: album.soort, totaal: lijst.length }}
          onClose={sluit}
          onSave={bewaar}
          onDelete={verwijderHeleAlbum}
        />
      )}
      {toast}
    </div>
  );
}
