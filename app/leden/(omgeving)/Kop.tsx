import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

// De kop bovenaan elke pagina van de ledenomgeving.
export function Kop({ titel, tekst, children }: { titel: string; tekst: string; children?: ReactNode }) {
  return (
    <section className="leden-kopvlak">
      <div className="leden-binnen">
        <Reveal>
          <h1>{titel}</h1>
          <p>{tekst}</p>
          {children}
        </Reveal>
      </div>
    </section>
  );
}

export function Sectie({ titel, aantal, id, children }: { titel?: string; aantal?: number; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="leden-section">
      <div className="leden-binnen">
        {titel && (
          <Reveal>
            <h2 className="leden-h2">{titel}{aantal ? <span className="leden-telling">{aantal}</span> : null}</h2>
          </Reveal>
        )}
        <Reveal delay={60}>{children}</Reveal>
      </div>
    </section>
  );
}
