-- Eenmalige import van agenda & nieuws van www.popkoordivers.nl (WordPress REST API, opgehaald 6-10-2026).
-- Veilig om vaker te draaien: bestaande records worden overgeslagen (WHERE NOT EXISTS),
-- bestaande agenda-items worden alleen aangevuld waar velden leeg zijn.
-- Draaien in de Supabase SQL-editor.

BEGIN;

-- ── Agenda: bestaande komende optredens aanvullen ──────────────────────────────

UPDATE agenda
SET locatie = 'De Schakel, Gilze'
WHERE datum_sorteer = '2026-11-07'
  AND (locatie IS NULL OR locatie = '');

UPDATE agenda
SET beschrijving = 'Een eigen optreden van Popkoor Divers met gastoptredens in De Schakel in Gilze.'
WHERE datum_sorteer = '2026-11-07'
  AND (beschrijving IS NULL OR beschrijving = '');

UPDATE agenda
SET beschrijving = 'Wij zijn uitgenodigd om deel te nemen aan het jubileum van de Zonnebloem.'
WHERE datum_sorteer = '2026-12-12'
  AND (beschrijving IS NULL OR beschrijving = '');

-- ── Agenda: afgelopen optredens (archief) ──────────────────────────────────────

INSERT INTO agenda (titel, datum, datum_sorteer, locatie, label, beschrijving, gepubliceerd)
SELECT 'Middelburg VÓLkoren', '6 juni 2026', '2026-06-06', 'Middelburg', 'Festival',
       'Het grootste korenfestival van de provincie Zeeland.', true
WHERE NOT EXISTS (
  SELECT 1 FROM agenda WHERE datum_sorteer = '2026-06-06' AND titel ILIKE '%lkoren%'
);

INSERT INTO agenda (titel, datum, datum_sorteer, locatie, label, beschrijving, gepubliceerd)
SELECT 'ABG-Korendag', '19 april 2026', '2026-04-19', NULL, NULL,
       'Een korendag georganiseerd door diverse koren uit de ABG-gemeentes. Ook wij, Popkoor Divers, doen daar aan mee.', true
WHERE NOT EXISTS (
  SELECT 1 FROM agenda WHERE datum_sorteer = '2026-04-19' AND titel ILIKE '%korendag%'
);

-- ── Nieuws ─────────────────────────────────────────────────────────────────────

INSERT INTO berichten (slug, titel, datum, categorie, intro, inhoud, afbeelding, gepubliceerd, created_at)
SELECT 'afscheid-neil-als-dirigent',
       'Afscheid Neil als dirigent',
       '6 maart 2025',
       'Nieuws',
       'Laatste repetitie met Neil Pelkmans als dirigent, 25-02-2025.',
       'Afscheidsvideo Tribute to Neil: https://www.youtube.com/watch?v=fJ0Wj3KXIQY',
       'https://www.popkoordivers.nl/wp-content/uploads/2025/03/481224844_957472816491165_4290860721707606518_n.jpg',
       true,
       '2025-03-06 05:40:47+01'
WHERE NOT EXISTS (SELECT 1 FROM berichten WHERE slug = 'afscheid-neil-als-dirigent');

INSERT INTO berichten (slug, titel, datum, categorie, intro, inhoud, afbeelding, gepubliceerd, created_at)
SELECT 'jubileumweekend-2024',
       'Jubileumweekend 2024',
       '3 juli 2024',
       'Nieuws',
       'Video''s van ons jubileumweekend 2024.',
       'Optreden Mooi Man Koor Festival: https://www.youtube.com/watch?v=2FQ-dK5y9OM' || E'\n\n' ||
       'Compilatie filmpjes: https://www.youtube.com/watch?v=_F6-ZFWIjnI' || E'\n\n' ||
       'Impressie jubileumweekend deel 1: https://www.youtube.com/watch?v=MAoZYM17sHo' || E'\n\n' ||
       'Impressie jubileumweekend deel 2: https://www.youtube.com/watch?v=BKiVnvlsPCc',
       '',
       true,
       '2024-07-03 08:11:45+02'
WHERE NOT EXISTS (SELECT 1 FROM berichten WHERE slug = 'jubileumweekend-2024');

INSERT INTO berichten (slug, titel, datum, categorie, intro, inhoud, afbeelding, gepubliceerd, created_at)
SELECT 'tenoren-zijn-van-harte-welkom',
       'Tenoren zijn van harte welkom',
       '7 september 2022',
       'Nieuws',
       'Heb jij ooit in een koor gezongen en wil je weer beginnen? Of nog nooit gedaan, maar altijd al de wens gehad?',
       'Neem nu contact op met Popkoor Divers (popkoordivers@gmail.com) en spreek af om een keer te komen mee repeteren! Meer info onder tab – Lid worden. Je bent van harte welkom.',
       '',
       true,
       '2022-09-07 20:25:00+02'
WHERE NOT EXISTS (SELECT 1 FROM berichten WHERE slug = 'tenoren-zijn-van-harte-welkom');

COMMIT;
