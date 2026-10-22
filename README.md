# Popkoor Divers

Website van Popkoor Divers uit Gilze: publieke site, ledenomgeving en admin dashboard.

- **Framework:** Next.js 16 (App Router)
- **Database en inloggen:** Supabase (Postgres + Auth)
- **Bestanden en foto's:** Cloudflare R2
- **Hosting:** Vercel

## Lokaal draaien

```bash
npm install
npm run dev
```

De site draait dan op http://localhost:3000.

## Omgevingsvariabelen

Zet deze in `.env.local` (lokaal) en in de projectinstellingen op Vercel.

| Variabele | Waarvoor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL van het Supabase-project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publieke sleutel, beveiligd met Row Level Security |
| `SUPABASE_SERVICE_ROLE_KEY` | Geheim. Alleen server-side, voor ledenbeheer in de admin |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare-account van de R2-buckets |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 API-sleutel, met lees- en schrijfrechten op beide buckets |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 API-geheim |
| `CLOUDFLARE_R2_BUCKET_NAME` | Openbare bucket (`popkoor-divers`) |
| `CLOUDFLARE_R2_PRIVATE_BUCKET_NAME` | Privé bucket voor de ledenomgeving (`popkoor-divers-leden`) |
| `CLOUDFLARE_R2_PUBLIC_URL` | Publieke URL van de openbare bucket |

## Structuur

- `app/` — pagina's. `app/leden` is de ledenomgeving, `app/admin` het admin dashboard.
- `proxy.ts` — stuurt niet-ingelogde bezoekers van `/leden` en `/admin` naar de loginpagina.
- `app/admin/*/actions.ts` — server actions: alles wat de admin wijzigt. Elke action begint met `requireAdmin()` uit `lib/auth.ts`.
- `lib/supabase/` — Supabase-clients voor browser, server en admin, getypeerd met `lib/database.types.ts`.
- `lib/r2.ts` — de twee R2-buckets: tijdelijke upload- en downloadlinks, kopiëren en verwijderen.
- `supabase/migrations/` — databaseschema als migraties. Nieuwe wijziging: `npx supabase migration new <naam>`, toepassen met `npx supabase db push`.
- `supabase/na-merge/` — opruimstap die pas mag als deze versie live staat (zie het bestand).
- `supabase/archief/` — oude SQL-scripts van vóór de migraties, alleen ter referentie.

Na een databasewijziging de types opnieuw maken: `npx supabase gen types typescript --linked > lib/database.types.ts`.

## Bestanden en foto's

Er zijn twee buckets in Cloudflare R2:

- **Openbaar** (`popkoor-divers`): alles wat op de publieke website staat, zoals foto's bij nieuws en impressiefoto's op `/media`.
- **Privé** (`popkoor-divers-leden`): alles uit de ledenomgeving, zoals albumfoto's, bladmuziek, nieuwsbrieven en ALV-stukken. Leden krijgen tijdelijke links die een uur geldig zijn.

Een albumfoto staat altijd in de privé bucket. Zet je hem in de admin op de website (de ster), dan komt er een kopie in de openbare bucket.

Uploads gaan rechtstreeks van de browser naar R2 met een tijdelijke uploadlink, zodat de limiet van 4,5 MB per verzoek op Vercel niet geldt. Daarvoor staat CORS aan op beide buckets.

## Keepalive

Een gratis Supabase-project wordt gepauzeerd na 7 dagen zonder verkeer. Daarom draait in Supabase de cron-job `keepalive` (elke dag om 03:00 UTC). Die doet via `pg_net` een verzoek op `/rest/v1/agenda`. De job staat niet in de migraties, omdat hij de API-sleutel bevat. Bekijken kan met `select * from cron.job;` in de SQL-editor.
