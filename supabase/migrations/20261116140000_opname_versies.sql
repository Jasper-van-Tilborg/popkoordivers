-- Versies van een opname. Leden zien altijd de nieuwste: dat is het bestand in
-- bestanden zelf. Een nieuwe versie uploaden zet het vorige bestand hier neer,
-- zodat het bewaard blijft; alleen beheerders zien en beheren de eerdere versies.
-- bestanden.datum is bij opnames de datum van de huidige versie.

-- De schakelaar "zichtbaar voor leden" is vervangen door versies
DROP POLICY IF EXISTS "bestanden_select_auth" ON bestanden;
CREATE POLICY "bestanden_select_auth" ON bestanden FOR SELECT TO authenticated USING (true);
ALTER TABLE bestanden DROP COLUMN IF EXISTS zichtbaar;

CREATE TABLE opname_versies (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bestand_id bigint NOT NULL REFERENCES bestanden(id) ON DELETE CASCADE,
  r2_key     text NOT NULL,
  datum      date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX opname_versies_bestand_id ON opname_versies (bestand_id);

ALTER TABLE opname_versies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opname_versies_select_beheer" ON opname_versies FOR SELECT TO authenticated USING (mag_beheren());
CREATE POLICY "opname_versies_insert_beheer" ON opname_versies FOR INSERT TO authenticated WITH CHECK (mag_beheren());
CREATE POLICY "opname_versies_update_beheer" ON opname_versies FOR UPDATE TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());
CREATE POLICY "opname_versies_delete_beheer" ON opname_versies FOR DELETE TO authenticated USING (mag_beheren());
GRANT ALL ON opname_versies TO authenticated, service_role;
