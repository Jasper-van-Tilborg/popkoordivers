"use client";

// Een document (Word) om op de site te lezen, in hetzelfde venster als de speler.
// Zonder html wordt de tekst nog opgehaald.
export default function Lezer({ kop, details, html, onSluit, onDownload }: {
  kop: string; details?: string; html: string | null; onSluit: () => void;
  // Met een downloadknop in de kop, naast het kruisje
  onDownload?: () => void;
}) {
  return (
    <>
      <div className="speler-kop">
        <div className="speler-koptekst">
          <p className="speler-titel">{kop}</p>
          {details && <p className="speler-details">{details}</p>}
        </div>
        <div className="speler-kopknoppen">
          {onDownload && (
            <button type="button" className="speler-sluit" onClick={onDownload} aria-label={`Downloaden: ${kop}`} title="Downloaden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" /></svg>
            </button>
          )}
          <button type="button" className="speler-sluit" onClick={onSluit} aria-label="Sluiten">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>
      {html === null ? (
        <div className="lezer lezer--laden" aria-busy="true">
          <span /><span /><span /><span />
        </div>
      ) : (
        // De html komt van mammoth (bestandTekst): tekst is ge-escaped, links zijn nagekeken
        <div className="lezer" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </>
  );
}
