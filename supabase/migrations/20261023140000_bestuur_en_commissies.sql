-- Bestuur en commissies, los van accounts: niet iedereen in een commissie heeft
-- een account, en een wisseling in het bestuur hoort niet aan een login te hangen.
-- Eén groep is het bestuur; daarnaast commissies en overige taken.

CREATE TYPE groep_soort AS ENUM ('bestuur', 'commissie', 'overig');

CREATE TABLE groepen (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  naam              text NOT NULL,
  soort             groep_soort NOT NULL DEFAULT 'commissie',
  toelichting       text,          -- bijv. de datum van het weekend
  contactpersoon_id bigint,        -- een lid van het bestuur
  volgorde          int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX groepen_een_bestuur ON groepen (soort) WHERE soort = 'bestuur';

CREATE TABLE groepsleden (
  id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  groep_id bigint NOT NULL REFERENCES groepen(id) ON DELETE CASCADE,
  naam     text NOT NULL,
  functie  text,                   -- "Voorzitter", "dirigent", "extern", "Materialen", ...
  volgorde int NOT NULL DEFAULT 0
);
CREATE INDEX groepsleden_groep ON groepsleden (groep_id, volgorde);

ALTER TABLE groepen ADD CONSTRAINT groepen_contactpersoon_fk
  FOREIGN KEY (contactpersoon_id) REFERENCES groepsleden(id) ON DELETE SET NULL;

-- Ingelogde leden lezen; redacteuren en beheerders schrijven
ALTER TABLE groepen ENABLE ROW LEVEL SECURITY;
ALTER TABLE groepsleden ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groepen_lezen" ON groepen FOR SELECT TO authenticated USING (true);
CREATE POLICY "groepen_schrijven_beheer" ON groepen FOR ALL TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());
CREATE POLICY "groepsleden_lezen" ON groepsleden FOR SELECT TO authenticated USING (true);
CREATE POLICY "groepsleden_schrijven_beheer" ON groepsleden FOR ALL TO authenticated USING (mag_beheren()) WITH CHECK (mag_beheren());

-- Het bestuur stond eerder als functie op een account; die kolom was nog overal leeg.
ALTER TABLE profiles DROP COLUMN bestuursfunctie;
