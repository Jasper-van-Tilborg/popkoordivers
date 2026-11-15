import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

// De kop bovenaan elke pagina van de ledenomgeving.
export function Kop({ titel, tekst, children }: { titel: string; tekst?: string; children?: ReactNode }) {
  return (
    <section className="leden-kopvlak">
      <div className="leden-binnen">
        <Reveal direct>
          <h1>{titel}</h1>
          {tekst && <p>{tekst}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

// direct: voor een sectie bovenaan de pagina, die meteen binnenkomt (zie Reveal)
export function Sectie({ titel, aantal, id, direct, children }: { titel?: string; aantal?: number; id?: string; direct?: boolean; children: ReactNode }) {
  return (
    <section id={id} className="leden-section">
      <div className="leden-binnen">
        {titel && (
          <Reveal direct={direct}>
            <h2 className="leden-h2">{titel}{aantal ? <span className="leden-telling">{aantal}</span> : null}</h2>
          </Reveal>
        )}
        <Reveal direct={direct} delay={60}>{children}</Reveal>
      </div>
    </section>
  );
}
