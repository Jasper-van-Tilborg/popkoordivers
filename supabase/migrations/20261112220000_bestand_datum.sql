-- Datum van een document: wanneer een nieuwsbrief uitkwam, of de datum van de
-- ALV waar een stuk bij hoort. Nieuwsbrieven en ALV-stukken sorteren erop (en
-- niet op created_at, want bij een import krijgen alle bestanden dezelfde tijd).
-- Opnames en choreografie gebruiken hem niet.
ALTER TABLE bestanden ADD COLUMN datum date;
