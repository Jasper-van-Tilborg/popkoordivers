"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Drawer, DeleteButton, IconPlus, IconUpload, Switch, Tabs, formatDatum, useNaijlen } from "../_components/ui";
import { Datum, Keuze, Vinkje } from "../_components/velden";
import { uploadNaarR2 } from "../_components/upload";
import { maakVideo, verwijderVideo, videoLink, wijzigVideo, youtubeTitel, zetVideoOpenbaar } from "./actions";
import { youtubeId, youtubeThumb } from "./youtube";

// Video's: los (Foto's & video's → Losse video's) of bij een album (tab Video's).

export interface Video {
  id: string;
  titel: string;
  datum: string | null;
  album_id: string | null;
  youtube_id: string | null;
  r2_key: string | null;
  openbaar: boolean;
}
export interface AlbumKeuze { id: string; titel: string; datum: string }

const IconFilm = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></svg>
);

function Voorbeeld({ v }: { v: Pick<Video, "youtube_id" | "r2_key"> }) {
  return (
    <span className="adm-thumb adm-video-thumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {v.youtube_id ? <img src={youtubeThumb(v.youtube_id)} alt="" loading="lazy" /> : <IconFilm />}
    </span>
  );
}

function VideoVenster({ video, albums, albumId, sluitend, onClose, onDone }: {
  video: Video | null;
  albums: AlbumKeuze[];
  albumId: string | null;
  sluitend?: boolean;
  onClose: () => void;
  onDone: (melding: string) => void;
}) {
  const [bron, setBron]           = useState<"youtube" | "bestand">("youtube");
  const [link, setLink]           = useState("");
  const [file, setFile]           = useState<File | null>(null);
  const [titel, setTitel]         = useState(video?.titel ?? "");
  const [datum, setDatum]         = useState(video?.datum ?? "");
  const [album, setAlbum]         = useState(video ? video.album_id ?? "" : albumId ?? "");
  const [openbaar, setOpenbaar]   = useState(video?.openbaar ?? false);
  const [busy, setBusy]           = useState<"save" | "delete" | null>(null);
  const [voortgang, setVoortgang] = useState<number | null>(null);
  const [fout, setFout]           = useState("");
  const [bekijk, setBekijk]       = useState<string | null>(null);

  const id = youtubeId(link);
  const input = () => ({ titel, datum: datum || null, albumId: album || null, openbaar });

  async function plak(waarde: string) {
    setLink(waarde);
    const nieuw = youtubeId(waarde);
    if (nieuw && !titel.trim()) {
      const t = await youtubeTitel(waarde);
      if (t) setTitel((huidig) => huidig || t);
    }
  }

  async function opslaan() {
    setFout("");
    if (!titel.trim()) return setFout("Geef de video een titel.");
    setBusy("save");
    try {
      if (video) {
        const res = await wijzigVideo(video.id, input());
        if (res.error) throw new Error(res.error);
        onDone("Video opgeslagen");
      } else if (bron === "youtube") {
        if (!id) throw new Error("Plak de link van een YouTube-video.");
        const res = await maakVideo(input(), { youtube: link });
        if (res.error) throw new Error(res.error);
        onDone("Video toegevoegd");
      } else {
        if (!file) throw new Error("Kies een videobestand.");
        setVoortgang(0);
        const key = await uploadNaarR2(file, { soort: "video" }, setVoortgang);
        const res = await maakVideo(input(), { key });
        if (res.error) throw new Error(res.error);
        onDone("Video toegevoegd");
      }
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Opslaan lukte niet.");
    }
    setBusy(null);
    setVoortgang(null);
  }

  async function verwijder() {
    if (!video) return;
    setBusy("delete");
    const res = await verwijderVideo(video.id);
    setBusy(null);
    if (res.error) setFout(`Verwijderen lukte niet: ${res.error}`);
    else onDone("Video verwijderd");
  }

  async function toon() {
    if (!video?.r2_key) return;
    setBekijk(await videoLink(video.id));
  }

  return (
    <Drawer
      title={video ? video.titel : "Video toevoegen"}
      onClose={busy ? () => {} : onClose}
      sluitend={sluitend}
      footer={
        <>
          {fout && <p className="adm-server-err" role="alert">{fout}</p>}
          <div className="adm-foot-actions">
            {video && <DeleteButton onConfirm={verwijder} busy={busy === "delete"} />}
            <span className="adm-spacer" />
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={!!busy}>Annuleren</button>
            <button type="button" className="adm-btn adm-btn--primary" onClick={opslaan} disabled={!!busy}>
              {busy === "save" ? (voortgang !== null ? `Uploaden… ${Math.round(voortgang * 100)}%` : "Opslaan…") : video ? "Opslaan" : "Toevoegen"}
            </button>
          </div>
        </>
      }
    >
      <section className="adm-fieldset">
        {video ? (
          video.youtube_id ? (
            <div className="adm-video-groot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youtubeThumb(video.youtube_id)} alt="" />
              <a className="adm-btn adm-btn--ghost adm-btn--small" href={`https://youtu.be/${video.youtube_id}`} target="_blank" rel="noopener">Op YouTube bekijken</a>
            </div>
          ) : bekijk ? (
            <video className="adm-video-speler" src={bekijk} controls autoPlay playsInline />
          ) : (
            <button type="button" className="adm-lied-drop" onClick={toon}><IconFilm /> <span><strong>Video bekijken</strong></span></button>
          )
        ) : (
          <>
            <Tabs label="Soort video" value={bron} onChange={setBron} items={[{ id: "youtube", label: "YouTube-link" }, { id: "bestand", label: "Bestand uploaden" }]} />
            {bron === "youtube" ? (
              <div className="adm-field" style={{ marginTop: 14 }}>
                <label htmlFor="vd-link">Link</label>
                <input id="vd-link" className="adm-input" value={link} onChange={(e) => plak(e.target.value)} placeholder="https://youtu.be/…" inputMode="url" />
                {link && !id && <p className="adm-err">Dit is geen YouTube-link.</p>}
                {id && (
                  <div className="adm-video-groot" style={{ marginTop: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={youtubeThumb(id)} alt="" />
                  </div>
                )}
              </div>
            ) : (
              <label className="adm-drop" style={{ marginTop: 14 }}>
                <IconUpload />
                {file ? <span><strong>{file.name}</strong> ({(file.size / 1_000_000).toFixed(0)} MB)</span> : <span><strong>Kies een videobestand</strong> (mp4)</span>}
                <input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" hidden onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setFile(f); if (!titel.trim()) setTitel(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")); }
                }} />
              </label>
            )}
            {voortgang !== null && <div className="adm-progress" style={{ marginTop: 12 }}><div style={{ width: `${Math.round(voortgang * 100)}%` }} /></div>}
          </>
        )}
      </section>

      <section className="adm-fieldset">
        <div className="adm-field">
          <label htmlFor="vd-titel">Titel</label>
          <input id="vd-titel" className="adm-input" value={titel} onChange={(e) => setTitel(e.target.value)} />
        </div>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="vd-datum">Datum</label>
            <Datum id="vd-datum" value={datum} onChange={setDatum} />
          </div>
          <div className="adm-field">
            <label htmlFor="vd-album">Album</label>
            <Keuze id="vd-album" value={album} onChange={setAlbum}
              opties={[{ value: "", label: "Geen album" }, ...albums.map((a) => ({ value: a.id, label: a.titel, hint: a.datum }))]} />
          </div>
        </div>
        <div className="adm-field adm-field--vinkje">
          <Vinkje checked={openbaar} onChange={setOpenbaar}>Ook op de openbare website</Vinkje>
        </div>
      </section>
    </Drawer>
  );
}

// De lijst met video's, met een knop om er een toe te voegen. Met albumId: de video's van dat album.
export function VideoLijst({ videos, albums, albumId = null, startId, melding }: {
  videos: Video[];
  albums: AlbumKeuze[];
  albumId?: string | null;
  startId?: string;
  melding: (m: string) => void;
}) {
  const [venster, setVenster]   = useState<{ video: Video | null } | null>(startId && videos.some((v) => v.id === startId) ? { video: videos.find((v) => v.id === startId)! } : null);
  const [toon, sluitend]        = useNaijlen(venster);
  const [, startTransition]     = useTransition();
  const [lijst, zetOpenbaar]    = useOptimistic(videos, (s, a: { id: string; aan: boolean }) => s.map((v) => (v.id === a.id ? { ...v, openbaar: a.aan } : v)));
  const albumNaam = (id: string | null) => albums.find((a) => a.id === id)?.titel;

  function wissel(v: Video) {
    const aan = !v.openbaar;
    startTransition(async () => {
      zetOpenbaar({ id: v.id, aan });
      const res = await zetVideoOpenbaar(v.id, aan);
      melding(res.error ? `Lukte niet: ${res.error}` : aan ? "Video staat nu op de website" : "Video staat niet meer op de website");
    });
  }

  return (
    <>
      <div className="adm-video-kop">
        <button className="adm-btn adm-btn--primary" onClick={() => setVenster({ video: null })}><IconPlus /> Video toevoegen</button>
      </div>
      {lijst.length === 0 ? (
        <div className="adm-empty">
          <p className="adm-empty-title">{albumId ? "Nog geen video's bij dit album" : "Nog geen losse video's"}</p>
        </div>
      ) : (
        <ul className="adm-list">
          {lijst.map((v) => (
            <li key={v.id} className="adm-row adm-row--thumb" onClick={() => setVenster({ video: v })}>
              <Voorbeeld v={v} />
              <div className="adm-main-col">
                <button className="adm-title" onClick={(e) => { e.stopPropagation(); setVenster({ video: v }); }}>{v.titel}</button>
                <div className="adm-meta">
                  {v.datum && <span>{formatDatum(v.datum)}</span>}
                  <span>{v.youtube_id ? "YouTube" : "Eigen video"}</span>
                  {!albumId && albumNaam(v.album_id) && <span>{albumNaam(v.album_id)}</span>}
                </div>
              </div>
              <div className="adm-actions" onClick={(e) => e.stopPropagation()}>
                <Switch checked={v.openbaar} onChange={() => wissel(v)} label={`${v.titel} op de openbare website`} />
                <span className="adm-status">{v.openbaar ? "Website" : "Leden"}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {toon && (
        <VideoVenster
          key={toon.video?.id ?? "nieuw"}
          video={toon.video}
          albums={albums}
          albumId={albumId}
          sluitend={sluitend}
          onClose={() => setVenster(null)}
          onDone={(m) => { setVenster(null); melding(m); }}
        />
      )}
    </>
  );
}
