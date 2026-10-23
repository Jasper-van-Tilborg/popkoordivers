// Wat er staat terwijl een pagina van de admin laadt (loading.tsx). Zo verschijnt
// de nieuwe pagina meteen en kan de schuifbeweging beginnen; de inhoud komt erin
// zodra die er is. Dezelfde maten als de echte pagina, zodat niets verspringt.

const Blok = ({ w, h, r = 10 }: { w: number | string; h: number; r?: number }) => (
  <span className="adm-skel" style={{ display: "block", width: w, height: h, borderRadius: r }} />
);

export default function Skelet({ soort }: { soort: "werkblad" | "raster" | "overzicht" | "formulier" }) {
  return (
    <div className="adm-page adm-skelet" aria-busy="true" aria-label="Laden">
      <header className="adm-head">
        <div>
          <Blok w={220} h={40} />
          <div style={{ marginTop: 12 }}><Blok w={180} h={14} r={6} /></div>
        </div>
        {soort !== "overzicht" && soort !== "formulier" && <Blok w={168} h={42} />}
      </header>

      {soort === "werkblad" && (
        <>
          <div className="adm-toolbar"><Blok w={220} h={40} r={12} /><Blok w={260} h={40} /></div>
          <div className="adm-content">
            <div className="adm-wb">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Blok w="100%" h={50} r={14} />
                {[0, 1, 2, 3, 4].map((i) => <Blok key={i} w="100%" h={78} r={14} />)}
              </div>
              <Blok w="100%" h={420} r={16} />
            </div>
          </div>
        </>
      )}

      {soort === "raster" && (
        <div className="adm-content">
          <div className="adm-cards">{[0, 1, 2, 3].map((i) => <Blok key={i} w="100%" h={260} r={16} />)}</div>
        </div>
      )}

      {soort === "overzicht" && (
        <div className="adm-content">
          <div className="adm-acties">{[0, 1, 2, 3].map((i) => <Blok key={i} w="100%" h={72} r={14} />)}</div>
          <div className="adm-grid-overzicht">
            <Blok w="100%" h={300} r={16} />
            <Blok w="100%" h={300} r={16} />
          </div>
        </div>
      )}

      {soort === "formulier" && (
        <div className="adm-content">
          {[0, 1, 2].map((i) => (
            <div key={i} className="adm-instelling">
              <div><Blok w={140} h={20} r={6} /><div style={{ marginTop: 10 }}><Blok w="90%" h={14} r={6} /></div></div>
              <Blok w="100%" h={150} r={16} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
