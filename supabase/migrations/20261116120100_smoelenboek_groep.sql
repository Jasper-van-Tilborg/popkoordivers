-- Het smoelenboek los van accounts, net als het bestuur: één groep met namen,
-- beheerd in Admin → Wie is wie. Wie nu in het smoelenboek staat, gaat mee (op naam).
CREATE UNIQUE INDEX groepen_een_smoelenboek ON groepen (soort) WHERE soort = 'smoelenboek';

WITH g AS (
  INSERT INTO groepen (naam, soort, volgorde) VALUES ('Smoelenboek', 'smoelenboek', 0) RETURNING id
)
INSERT INTO groepsleden (groep_id, naam, volgorde)
SELECT g.id, trim(p.naam), (row_number() OVER (ORDER BY trim(p.naam)))::int - 1
FROM g, profiles p
WHERE p.in_smoelenboek AND coalesce(trim(p.naam), '') <> '';

-- profiles.in_smoelenboek wordt niet meer gebruikt. De kolom blijft staan tot de
-- nieuwe code live staat (de oude leest hem nog); daarna mag hij weg.
