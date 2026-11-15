-- De soort van een album, om op de website te filteren (Over ons → Sfeer in beeld:
-- optredens, groepsfoto's, repetities). Een nieuw album is standaard een optreden.
ALTER TABLE albums ADD COLUMN soort text NOT NULL DEFAULT 'optreden'
  CHECK (soort IN ('optreden', 'groepsfoto', 'repetitie', 'overig'));

-- De albums van de oude site
UPDATE albums SET soort = 'groepsfoto' WHERE slug IN (
  'popkoor-divers-2026-2026-04-21',
  'groepsfoto-s-2023-2023-02-01',
  'fotoshoot-nick-luypen-fotografie-2019-03-01',
  'fotoreportage-the-lodge-gilze-2015-06-01',
  '5-jaar-popkoor-divers-in-de-steigers-2013-01-01',
  'popkoor-divers-in-de-schakel-2011-04-25'
);
UPDATE albums SET soort = 'overig' WHERE slug IN (
  'flyers-en-posters-2016-07-06',
  'uit-het-archief-2008-11-09'
);
