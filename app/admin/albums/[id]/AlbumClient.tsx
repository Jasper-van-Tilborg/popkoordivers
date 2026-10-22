"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBack, IconStarSmall, IconTrash, IconUpload, useToast } from "../../_components/ui";
import { uploadNaarR2 } from "../../_components/upload";
import AlbumDrawer from "../AlbumDrawer";
import { fotoToevoegen, verwijderAlbum, verwijderFoto, wijzigAlbum, zetFotoVolgorde, zetImpressie, type AlbumInput } from "../actions";

interface Foto { id: string; impressies: boolean; url: string }
interface Upload { naam: string; voortgang: number; fout?: string }
type Actie = { soort: "impressie"; id: string; impressies: boolean } | { soort: "volgorde"; ids: string[] };

export default function AlbumClient({ album, fotos }: {
  album: { id: string; slug: string; titel: string; datum: string };
  fotos: Foto[];
}) {
  const router = useRouter();
  const [toast, melding]      = useToast();
  const [bewerken, setBewerken] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag]       = useState(false);
  const [bezig, setBezig]     = useState<Set<string>>(new Set());
  const [bevestig, setBevestig] = useState<string | null>(null);
  const [, startTransition]   = useTransition();
  const [sleep, setSleep]     = useState<number | null>(null);
  const [lijst, pasToe] = useOptimistic(fotos, (state, a: Actie) =>
    a.soort === "impressie"
      ? state.map((f) => (f.id === a.id ? { ...f, impressies: a.impressies } : f))
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
          const key = await uploadNaarR2(beelden[i], { soort: "album", albumId: album.id }, (v) => zet(i, { voortgang: v * 0.95 }));
          const res = await fotoToevoegen(album.id, key);
          if (res.error) throw new Error(res.error);
          zet(i, { voortgang: 1 });
          gelukt++;
        } catch (e) {
          zet(i, { fout: e instanceof Error ? e.message : "Mislukt" });
        }
      }
    }
    await Promise.all([werker(), werker(), werker()]);

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
    <div>
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

      <div className="adm-content">
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
                className="adm-photo"
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" loading="lazy" />
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
      </div>

      {bewerken && (
        <AlbumDrawer
          album={{ titel: album.titel, datum: album.datum, totaal: lijst.length }}
          onClose={sluit}
          onSave={bewaar}
          onDelete={verwijderHeleAlbum}
        />
      )}
      {toast}
    </div>
  );
}
