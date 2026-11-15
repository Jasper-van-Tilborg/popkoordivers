-- Een bestand kan verborgen zijn voor leden: bijvoorbeeld een oudere versie van
-- een opname die het koor wil bewaren, terwijl de leden er maar één zien.
-- Beheerders zien alles; leden alleen wat zichtbaar is.
ALTER TABLE bestanden ADD COLUMN zichtbaar boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "bestanden_select_auth" ON bestanden;
CREATE POLICY "bestanden_select_auth" ON bestanden FOR SELECT TO authenticated
  USING (zichtbaar OR mag_beheren());
