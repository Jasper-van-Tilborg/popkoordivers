-- Pas toepassen nadat de branch acceptatie-voorbereiding op main staat en live is.
-- De oude code op main gebruikt deze tabellen en kolommen nog.
--
-- Toepassen:  mv supabase/na-merge/opruimen_oude_tabellen.sql \
--               supabase/migrations/$(date -u +%Y%m%d%H%M%S)_opruimen_oude_tabellen.sql
--             npx supabase db push

-- Labels zijn uit de agenda gehaald
ALTER TABLE agenda
  DROP COLUMN label,
  DROP COLUMN label_kleur;

-- Vervangen door de ledenlijst (bestuur, smoelenboek), Bestanden (liedjes)
-- en het agenda-archief (oude optredens). Bevatten alleen verzonnen testdata.
DROP TABLE IF EXISTS bestuur;
DROP TABLE IF EXISTS smoelenboek;
DROP TABLE IF EXISTS liedjes;
DROP TABLE IF EXISTS oude_optredens;

-- Elk bestand staat op R2
ALTER TABLE bestanden ALTER COLUMN r2_key SET NOT NULL;
