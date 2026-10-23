// Wat er staat terwijl een pagina van de admin nog laadt (loading.tsx). Net als
// in het dashboard van de briefing-tool: de echte kop van de pagina staat er
// meteen, met een rustige melding eronder; de inhoud komt erin zodra die er is.
// Meestal zie je dit niet: de zijbalk haalt elke pagina vooraf al op.

export default function Skelet({ titel, knop, wat }: { titel: string; knop?: string; wat: string }) {
  return (
    <div className="adm-page adm-skelet" aria-busy="true">
      <header className="adm-head">
        <div>
          <h1>{titel}</h1>
          <p className="adm-sub">&nbsp;</p>
        </div>
        {knop && (
          <button className="adm-btn adm-btn--primary" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            {knop}
          </button>
        )}
      </header>
      <div className="adm-content">
        <p className="adm-laden" role="status">{wat} ophalen…</p>
      </div>
    </div>
  );
}
