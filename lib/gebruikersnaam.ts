// Inloggen kan met een e-mailadres of, voor wie dat niet heeft, met een
// gebruikersnaam. Supabase wil altijd een e-mailadres; een gebruikersnaam wordt
// daarom intern <naam>@DOMEIN. Dat domein bestaat niet (.invalid), dus er gaat
// nooit mail naartoe. Wachtwoord vergeten? Dan stelt een beheerder een nieuw in.

export const DOMEIN = "gebruiker.popkoordivers.invalid";

export const isGebruikersnaam = (s: string) => /^[a-z0-9][a-z0-9._-]{1,39}$/.test(s);
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Wat iemand intypt → het adres waarmee Supabase inlogt
export function naarInlog(invoer: string) {
  const s = invoer.trim().toLowerCase();
  return s.includes("@") ? s : `${s}@${DOMEIN}`;
}

// Het adres van een account → wat de gebruiker intypt (e-mailadres of gebruikersnaam)
export function inlognaam(email: string | null | undefined) {
  const s = email ?? "";
  return s.endsWith(`@${DOMEIN}`) ? s.slice(0, -DOMEIN.length - 1) : s;
}

// Een voorstel op basis van de naam: "Jan de Vries" → "jan.de.vries"
export const gebruikersnaamVoor = (naam: string) =>
  naam.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
