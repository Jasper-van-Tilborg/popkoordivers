"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VideoSpeler from "@/components/VideoSpeler";
import { DeleteButton, IconBack, IconDownload, IconUpload, formatDatum, useNaijlen, useToast } from "../../../_components/ui";
import { uploadNaarR2 } from "../../../_components/upload";
import { bestandToevoegen, verwijderBestand, vervangBestand } from "../../actions";
import { nr, openBestand, soort, type Document } from "../../documenten";
import ChoreoLiedVenster from "../ChoreoLiedVenster";
import { choreoHref, type ChoreoLied } from "../liedjes";

type Soort = "video" | "tekst";
const ACCEPT: Record<Soort, string> = { video: "video/*", tekst: ".docx,.doc,.pdf" };
const LABEL: Record<Soort, string> = { video: "Video", tekst: "Beschrijving" };

// De pagina van één choreolied: de video om te bekijken en de beschrijving om te lezen.
export default function ChoreoLiedClient({ lied, liedjes, videoUrls, teksten }: {
  lied: ChoreoLied;
  liedjes: ChoreoLied[];
  videoUrls: Record<number, string | null>;
  teksten: Record<number, string | null>;
}) {
  const router = useRouter();
  const [bewerk, setBewerk] = useState<true | null>(null);
  const [toonBewerk, sluitend] = useNaijlen(bewerk);
  // Wat er nu omhoog gaat: een nieuw bestand bij een soort, of een vervanging van een bestand
  const [bezig, setBezig] = useState<{ waar: Soort | number; voortgang: number } | null>(null);
  const [toast, melding] = useToast();

  async function upload(waar: Soort | number, f: File | undefined) {
    if (!f || bezig) return;
    setBezig({ waar, voortgang: 0 });
    try {
      const key = await uploadNaarR2(f, { soort: "bestand", categorie: "choreo" }, (v) => setBezig({ waar, voortgang: v }));
      const res = typeof waar === "number"
        ? await vervangBestand(waar, key)
        : await bestandToevoegen(key, { naam: lied.titel, categorie: "choreo", stemgroep: null, liednummer: lied.nummer, datum: null });
      if (res.error) throw new Error(res.error);
      melding(typeof waar === "number" ? "Bestand vervangen" : `${LABEL[waar]} toegevoegd`);
    } catch (e) {
      melding(e instanceof Error ? e.message : "Uploaden lukte niet");
    }
    setBezig(null);
  }

  async function openen(d: Document, opslaan: boolean) {
    if (!(await openBestand(d.id, opslaan))) melding("Dit bestand kon niet worden geopend");
  }

  async function weg(d: Document) {
    const res = await verwijderBestand(d.id);
    if (res.error) melding(`Verwijderen lukte niet: ${res.error}`);
    else melding(`${soort(d.ext) === "Video" ? "Video" : "Beschrijving"} verwijderd`);
  }

  const voortgang = (waar: Soort | number) =>
    bezig?.waar === waar && <div className="adm-progress"><div style={{ width: `${Math.round(bezig.voortgang * 100)}%` }} /></div>;

  const blok = (wat: Soort, d: Document) => (
    <section key={d.id} className="adm-blok adm-choreo-blok">
      <div className="adm-blok-kop">
        <h2>{LABEL[wat]}{d.naam !== lied.titel && <span className="adm-choreo-naam">{d.naam}</span>}</h2>
        <span className="adm-choreo-soort">{soort(d.ext)} · {formatDatum(d.created_at.slice(0, 10))}</span>
      </div>
      <div className="adm-choreo-inhoud">
        {wat === "video" ? (
          videoUrls[d.id]
            ? <VideoSpeler titel={d.naam} src={videoUrls[d.id]} className="adm-choreo-video" />
            : <p className="adm-blok-leeg">Deze video kon niet worden geladen.</p>
        ) : teksten[d.id] ? (
          <div className="adm-doc-tekst" dangerouslySetInnerHTML={{ __html: teksten[d.id]! }} />
        ) : (
          <p className="adm-blok-leeg">{d.ext === "docx" ? "Deze beschrijving kon niet worden gelezen." : `${soort(d.ext)}-bestand; open het om het te lezen.`}</p>
        )}
        {voortgang(d.id)}
      </div>
      <div className="adm-choreo-acties">
        {wat === "tekst" && !teksten[d.id] && <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => openen(d, false)}>Openen</button>}
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => openen(d, true)}><IconDownload /> Downloaden</button>
        <label className="adm-btn adm-btn--ghost adm-btn--small" data-disabled={!!bezig || undefined}>
          <IconUpload /> {bezig?.waar === d.id ? `Uploaden… ${Math.round(bezig.voortgang * 100)}%` : "Vervangen"}
          <input type="file" hidden accept={ACCEPT[wat]} disabled={!!bezig} onChange={(e) => { upload(d.id, e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        <span className="adm-spacer" />
        <DeleteButton onConfirm={() => weg(d)} />
      </div>
    </section>
  );

  const leeg = (wat: Soort) => (
    <section key={wat} className="adm-blok adm-choreo-blok">
      <div className="adm-blok-kop"><h2>{LABEL[wat]}</h2></div>
      <div className="adm-choreo-inhoud">
        <label
          className="adm-drop"
          data-disabled={!!bezig || undefined}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); upload(wat, e.dataTransfer.files[0]); }}
        >
          <IconUpload />
          <span>{bezig?.waar === wat ? `Uploaden… ${Math.round(bezig.voortgang * 100)}%` : <><strong>{wat === "video" ? "Video toevoegen" : "Beschrijving toevoegen"}</strong> of sleep het bestand hierheen</>}</span>
          <input type="file" accept={ACCEPT[wat]} disabled={!!bezig} onChange={(e) => { upload(wat, e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {voortgang(wat)}
      </div>
    </section>
  );

  const aantal = lied.videos.length + lied.beschrijvingen.length;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <Link href="/admin/bestanden/choreo" className="adm-head-back"><IconBack /> Alle choreografie</Link>
          <h1>{lied.nummer && <span className="adm-head-nr">{nr(lied.nummer)}</span>}{lied.titel}</h1>
          <p className="adm-sub">{aantal} {aantal === 1 ? "bestand" : "bestanden"}</p>
        </div>
        <div className="adm-head-actions">
          <button className="adm-btn adm-btn--ghost" onClick={() => setBewerk(true)}>Lied bewerken</button>
        </div>
      </header>

      <div className="adm-content">
        <div className="adm-choreo">
          <div className="adm-choreo-kolom">
            {lied.videos.length ? lied.videos.map((d) => blok("video", d)) : leeg("video")}
          </div>
          <div className="adm-choreo-kolom">
            {lied.beschrijvingen.length ? lied.beschrijvingen.map((d) => blok("tekst", d)) : leeg("tekst")}
          </div>
        </div>
      </div>

      {toonBewerk && (
        <ChoreoLiedVenster
          lied={lied}
          liedjes={liedjes}
          sluitend={sluitend}
          onClose={() => setBewerk(null)}
          onDone={(m, sleutel) => {
            setBewerk(null);
            melding(m);
            if (!sleutel) router.push("/admin/bestanden/choreo");
            else if (sleutel !== lied.sleutel) router.replace(choreoHref(sleutel));
          }}
        />
      )}
      {toast}
    </div>
  );
}
