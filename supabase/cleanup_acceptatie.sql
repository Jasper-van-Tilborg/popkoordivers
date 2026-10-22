-- Opruimen vóór de acceptatiefase.
-- Draaien in de Supabase SQL-editor. Alles gebeurt in één transactie.

BEGIN;

-- ── 1. Bug: uploaden via Admin → Bestanden faalt ───────────────────────────────
-- Deze kolommen stammen uit de tijd van Supabase Storage en zijn verplicht,
-- maar de admin vult ze niet meer in (bestanden staan nu op R2 via r2_key).
ALTER TABLE bestanden
  DROP COLUMN storage_path,
  DROP COLUMN bucket,
  DROP COLUMN bestandsnaam;

-- ── 2. Tabellen die nergens meer gebruikt worden (allemaal leeg of testdata) ──
DROP TABLE IF EXISTS choreo;          -- 4 rijen seed-data, niet in de code
DROP TABLE IF EXISTS nieuwsbrieven;   -- 6 rijen seed-data, vervangen door bestanden
DROP TABLE IF EXISTS opnames;         -- 4 rijen seed-data, vervangen door bestanden
DROP TABLE IF EXISTS media;           -- leeg, vervangen door albums/fotos
DROP TABLE IF EXISTS sponsors;        -- leeg, de footer linkt direct naar SponsorKliks

-- ── 3. Agenda-labels zijn uit de website gehaald ───────────────────────────────
ALTER TABLE agenda
  DROP COLUMN label,
  DROP COLUMN label_kleur;

-- ── 4. Testberichten op /nieuws ────────────────────────────────────────────────
DELETE FROM berichten WHERE slug IN ('Test', 'hoi');

-- ── 5. Policies op Supabase Storage (bestanden staan op R2) ────────────────────
DROP POLICY IF EXISTS "fotos_select_public"          ON storage.objects;
DROP POLICY IF EXISTS "fotos_insert_admin"           ON storage.objects;
DROP POLICY IF EXISTS "nieuwsbrieven_select_auth"    ON storage.objects;
DROP POLICY IF EXISTS "nieuwsbrieven_insert_admin"   ON storage.objects;
DROP POLICY IF EXISTS "liedjes_select_auth"          ON storage.objects;
DROP POLICY IF EXISTS "liedjes_insert_admin"         ON storage.objects;
DROP POLICY IF EXISTS "media_select_auth"            ON storage.objects;
DROP POLICY IF EXISTS "media_insert_admin"           ON storage.objects;

COMMIT;

-- De vier lege buckets (fotos, liedjes, media, nieuwsbrieven) verwijder je
-- daarna via Storage in het Supabase-dashboard; via SQL mag dat niet meer.
