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
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare-account van de R2-bucket |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 API-sleutel |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 API-geheim |
| `CLOUDFLARE_R2_BUCKET_NAME` | Naam van de bucket |
| `CLOUDFLARE_R2_PUBLIC_URL` | Publieke URL van de bucket (server) |
| `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL` | Publieke URL van de bucket (browser) |

## Structuur

- `app/` — pagina's. `app/leden` is de ledenomgeving, `app/admin` het admin dashboard.
- `app/api/` — uploads naar R2 en beheer van albums en foto's (alleen voor admins).
- `proxy.ts` — stuurt niet-ingelogde bezoekers van `/leden` en `/admin` naar de loginpagina.
- `lib/supabase/` — Supabase-clients voor browser, server en admin.
- `lib/r2.ts` — uploaden naar en verwijderen uit R2.
- `supabase/migrations/` — databaseschema als migraties. Nieuwe wijziging: `npx supabase migration new <naam>`, toepassen met `npx supabase db push`.
- `supabase/archief/` — oude SQL-scripts van vóór de migraties, alleen ter referentie.
