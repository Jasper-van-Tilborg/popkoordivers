-- Een kleine versie van elke foto (± 800 px) voor rasters en albumomslagen,
-- naast de grote. Staat in dezelfde bucket(s) als de grote foto.
ALTER TABLE fotos ADD COLUMN klein_key text;
