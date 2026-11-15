import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Een optreden als .ics, zodat je het in je eigen agenda zet (Apple, Google, Outlook).
// Zonder herkenbare tijd wordt het een hele dag; zonder eindtijd duurt het 2 uur.

const tekst = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// Regels langer dan 75 tekens vouwen (RFC 5545)
function vouw(regel: string) {
  const delen: string[] = [];
  let rest = regel;
  while (rest.length > 74) { delen.push(rest.slice(0, 74)); rest = rest.slice(74); }
  delen.push(rest);
  return delen.join("\r\n ");
}

const tweeCijfers = (n: number) => String(n).padStart(2, "0");
const utcStempel = (d: Date) =>
  `${d.getUTCFullYear()}${tweeCijfers(d.getUTCMonth() + 1)}${tweeCijfers(d.getUTCDate())}T${tweeCijfers(d.getUTCHours())}${tweeCijfers(d.getUTCMinutes())}00Z`;

// Tijd in Nederland (zomer- of wintertijd) omzetten naar een echt moment
function nederlandseTijd(datum: string, uur: number, minuut: number) {
  const [j, m, d] = datum.split("-").map(Number);
  const gok = Date.UTC(j, m - 1, d, uur, minuut);
  const delen = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(new Date(gok));
  const w = (t: string) => Number(delen.find((p) => p.type === t)?.value);
  const zoAlsAmsterdam = Date.UTC(w("year"), w("month") - 1, w("day"), w("hour"), w("minute"));
  return new Date(gok - (zoAlsAmsterdam - gok));
}

export async function GET(request: NextRequest, ctx: RouteContext<"/agenda/[id]/ics">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("agenda")
    .select("id, titel, datum_sorteer, tijd, locatie, beschrijving")
    .eq("id", Number(id))
    .eq("gepubliceerd", true)
    .single();

  if (!event?.datum_sorteer) return new Response("Niet gevonden", { status: 404 });

  const datum: string = event.datum_sorteer;
  const tijden = [...(event.tijd ?? "").matchAll(/(\d{1,2})[:.](\d{2})/g)].map((t) => [Number(t[1]), Number(t[2])]);

  let wanneer: string[];
  if (tijden.length === 0) {
    const volgende = new Date(`${datum}T12:00:00Z`);
    volgende.setUTCDate(volgende.getUTCDate() + 1);
    wanneer = [
      `DTSTART;VALUE=DATE:${datum.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${volgende.toISOString().slice(0, 10).replace(/-/g, "")}`,
    ];
  } else {
    const begin = nederlandseTijd(datum, tijden[0][0], tijden[0][1]);
    let eind = tijden[1] ? nederlandseTijd(datum, tijden[1][0], tijden[1][1]) : new Date(begin.getTime() + 2 * 3_600_000);
    if (eind <= begin) eind = new Date(eind.getTime() + 24 * 3_600_000); // loopt over middernacht
    wanneer = [`DTSTART:${utcStempel(begin)}`, `DTEND:${utcStempel(eind)}`];
  }

  const pagina = `${request.nextUrl.origin}/agenda/${event.id}`;
  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Popkoor Divers//Agenda//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:agenda-${event.id}@popkoordivers`,
    `DTSTAMP:${utcStempel(new Date())}`,
    ...wanneer,
    `SUMMARY:${tekst(`Popkoor Divers: ${event.titel}`)}`,
    ...(event.locatie ? [`LOCATION:${tekst(event.locatie)}`] : []),
    `DESCRIPTION:${tekst([event.beschrijving, pagina].filter(Boolean).join("\n\n"))}`,
    `URL:${pagina}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const bestandsnaam = `popkoor-divers-${event.titel.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || event.id}.ics`;

  return new Response(regels.map(vouw).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${bestandsnaam}"`,
      "Cache-Control": "no-store",
    },
  });
}
