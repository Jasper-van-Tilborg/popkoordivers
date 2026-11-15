-- Media van de oude website: video's, bijschriften bij foto's en albums op datum.

-- Albums sorteren op de dag zelf. `datum` blijft de tekst die getoond wordt
-- ("14 januari 2024"); bij een import krijgen alle albums dezelfde created_at.
ALTER TABLE albums ADD COLUMN datum_sorteer date;
UPDATE albums SET datum_sorteer = created_at::date WHERE datum_sorteer IS NULL;

-- Wat er onder een foto stond op de oude site ("Optreden bij Gils Wès in de Hooikar")
ALTER TABLE fotos ADD COLUMN bijschrift text;

-- Video's: van YouTube (alleen de id) of zelf opgeslagen in R2 (privé bucket;
-- openbaar = ook een kopie in de openbare bucket, net als een impressie-foto).
-- Een video hoort optioneel bij een album.
CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titel text NOT NULL,
  datum date,
  album_id uuid REFERENCES albums(id) ON DELETE SET NULL,
  youtube_id text,
  r2_key text,
  openbaar boolean NOT NULL DEFAULT false,
  volgorde integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT videos_bron CHECK ((youtube_id IS NULL) <> (r2_key IS NULL))
);
CREATE INDEX videos_album_id_idx ON videos (album_id);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "videos_lezen_openbaar" ON videos FOR SELECT TO anon USING (openbaar);
CREATE POLICY "videos_lezen_leden" ON videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "videos_schrijven_beheer" ON videos FOR ALL TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());
GRANT SELECT ON videos TO anon;
GRANT ALL ON videos TO authenticated, service_role;
