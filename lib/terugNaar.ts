// Na het inloggen terug naar de pagina waar iemand eigenlijk heen wilde.
// Alleen paden binnen de eigen leden- of beheeromgeving, zodat ?next= nooit
// naar een andere site kan sturen. De admin alleen voor admins en redacteuren.

const BEHEER = ["admin", "redacteur"];

export function terugNaar(next: string | null | undefined, rol: string | null | undefined) {
  const beheer = BEHEER.includes(rol ?? "");
  const standaard = beheer ? "/admin" : "/leden";
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return standaard;
  if (/^\/leden\/login(\/|\?|$)/.test(next)) return standaard;
  if (/^\/leden(\/|\?|$)/.test(next)) return next;
  if (beheer && /^\/admin(\/|\?|$)/.test(next)) return next;
  return standaard;
}
