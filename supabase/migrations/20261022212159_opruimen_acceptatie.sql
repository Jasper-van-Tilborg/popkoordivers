-- Opruimen vóór de acceptatiefase.

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
DROP TYPE  IF EXISTS media_type;      -- hoorde alleen bij media
DROP TABLE IF EXISTS sponsors;        -- leeg, de footer linkt direct naar SponsorKliks

-- ── 3. Testberichten op /nieuws ────────────────────────────────────────────────
DELETE FROM berichten WHERE slug IN ('Test', 'hoi');
