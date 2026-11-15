-- Het smoelenboek krijgt foto's: per persoon een portret (privé bucket, ± 800 px).
-- De portretten uit het album "Smoelenboek" (onderschrift "naam · stemgroep") gaan
-- naar de smoelenboekgroep in Wie is wie; het album verdwijnt van Foto's.
ALTER TABLE groepsleden ADD COLUMN foto_key text;

CREATE TEMP TABLE portretten AS
SELECT trim(split_part(bijschrift, ' · ', 1)) AS naam,
       nullif(trim(split_part(bijschrift, ' · ', 2)), '') AS stem,
       coalesce(klein_key, r2_key) AS foto_key
FROM fotos
WHERE album_id = '0a108100-7e75-4a73-aef2-6b834805c481' AND coalesce(trim(bijschrift), '') <> '';

-- Wie al in het smoelenboek staat, krijgt zijn foto (en stemgroep als er nog niets staat)
UPDATE groepsleden gl
SET foto_key = p.foto_key, functie = coalesce(gl.functie, p.stem)
FROM portretten p, groepen g
WHERE g.soort = 'smoelenboek' AND gl.groep_id = g.id AND lower(gl.naam) = lower(p.naam);

-- De rest komt erbij
INSERT INTO groepsleden (groep_id, naam, functie, volgorde, foto_key)
SELECT g.id, p.naam, p.stem, 0, p.foto_key
FROM portretten p, groepen g
WHERE g.soort = 'smoelenboek'
  AND NOT EXISTS (SELECT 1 FROM groepsleden gl WHERE gl.groep_id = g.id AND lower(gl.naam) = lower(p.naam));

-- Op alfabet, zoals de admin het smoelenboek ook opslaat
UPDATE groepsleden gl
SET volgorde = r.n
FROM (
  SELECT gl2.id, (row_number() OVER (ORDER BY gl2.naam))::int - 1 AS n
  FROM groepsleden gl2 JOIN groepen g ON g.id = gl2.groep_id
  WHERE g.soort = 'smoelenboek'
) r
WHERE gl.id = r.id;

-- Het album (de foto's gaan mee via ON DELETE CASCADE; de bestanden in R2 blijven,
-- de kleine versies worden nu door het smoelenboek gebruikt)
DELETE FROM albums WHERE id = '0a108100-7e75-4a73-aef2-6b834805c481';

DROP TABLE portretten;
