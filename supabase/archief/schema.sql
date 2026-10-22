-- ================================================================
-- Popkoor Divers — Supabase schema
-- Plak dit volledig in de Supabase SQL Editor en voer uit.
-- ================================================================


-- ----------------------------------------------------------------
-- 1. ENUM TYPES
-- ----------------------------------------------------------------

CREATE TYPE stemgroep_type AS ENUM ('Alt', 'Mezzo', 'Sopraan', 'Tenor', 'Bas');
CREATE TYPE media_type     AS ENUM ('audio', 'video');
CREATE TYPE user_rol       AS ENUM ('lid', 'admin');


-- ----------------------------------------------------------------
-- 2. PROFIELEN & ROLLEN
-- ----------------------------------------------------------------

-- Elke gebruiker uit auth.users krijgt automatisch een profiel.
-- Standaard rol is 'lid'. Admin wijzigt dit via het Supabase dashboard.
CREATE TABLE profiles (
  id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email     TEXT,
  rol       user_rol    NOT NULL DEFAULT 'lid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helperfunctie: geeft de rol van de ingelogde gebruiker terug.
-- Wordt gebruikt in RLS-policies.
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS user_rol AS $$
  SELECT rol FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger: maakt automatisch een profiel aan bij elke nieuwe gebruiker.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, rol)
  VALUES (NEW.id, NEW.email, 'lid');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ----------------------------------------------------------------
-- 3. TABELLEN
-- ----------------------------------------------------------------

-- Nieuws (publiek leesbaar)
CREATE TABLE berichten (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug         TEXT        NOT NULL UNIQUE,
  titel        TEXT        NOT NULL,
  datum        TEXT        NOT NULL,          -- bijv. "12 oktober 2026"
  categorie    TEXT        NOT NULL DEFAULT 'Nieuws',
  intro        TEXT        NOT NULL,
  inhoud       TEXT        NOT NULL,          -- alinea's gescheiden door \n\n
  afbeelding   TEXT        NOT NULL,          -- seed voor picsum / later: storage path
  gepubliceerd BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Liedjes per stemgroep (alleen leden)
CREATE TABLE liedjes (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titel      TEXT             NOT NULL,
  componist  TEXT,
  stemgroep  stemgroep_type   NOT NULL,
  pdf_url    TEXT,                            -- Supabase Storage URL
  volgorde   INT              NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ      NOT NULL DEFAULT now()
);

-- Nieuwsbrieven (alleen leden)
CREATE TABLE nieuwsbrieven (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  datum      TEXT        NOT NULL,            -- bijv. "Oktober 2026"
  titel      TEXT        NOT NULL,
  pdf_url    TEXT,                            -- Supabase Storage URL
  volgorde   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bestuur (alleen leden)
CREATE TABLE bestuur (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  naam       TEXT        NOT NULL,
  rol        TEXT        NOT NULL,
  initialen  TEXT        NOT NULL,
  foto_url   TEXT,                            -- Supabase Storage URL
  volgorde   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Smoelenboek / ledenlijst (alleen leden)
CREATE TABLE smoelenboek (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  naam       TEXT             NOT NULL,
  stemgroep  stemgroep_type   NOT NULL,
  initialen  TEXT             NOT NULL,
  foto_url   TEXT,                            -- Supabase Storage URL
  created_at TIMESTAMPTZ      NOT NULL DEFAULT now()
);

-- Opnames (alleen leden)
CREATE TABLE opnames (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titel      TEXT        NOT NULL,
  datum      TEXT        NOT NULL,
  type       media_type  NOT NULL DEFAULT 'video',
  url        TEXT,                            -- YouTube URL of Storage URL
  volgorde   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Choreo (alleen leden)
CREATE TABLE choreo (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titel      TEXT        NOT NULL,
  lied       TEXT        NOT NULL,
  url        TEXT,                            -- YouTube URL of Storage URL
  volgorde   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Oude optredens (alleen leden)
CREATE TABLE oude_optredens (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titel          TEXT        NOT NULL,
  datum          TEXT        NOT NULL,
  locatie        TEXT        NOT NULL,
  youtube_id     TEXT,                        -- bijv. "dQw4w9WgXcQ"
  afbeelding_url TEXT,                        -- Supabase Storage URL
  volgorde       INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ----------------------------------------------------------------

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE berichten      ENABLE ROW LEVEL SECURITY;
ALTER TABLE liedjes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE nieuwsbrieven  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestuur        ENABLE ROW LEVEL SECURITY;
ALTER TABLE smoelenboek    ENABLE ROW LEVEL SECURITY;
ALTER TABLE opnames        ENABLE ROW LEVEL SECURITY;
ALTER TABLE choreo         ENABLE ROW LEVEL SECURITY;
ALTER TABLE oude_optredens ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────────────
-- Iedereen ziet zijn eigen profiel
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Admin ziet alle profielen (om rollen te kunnen beheren via de app)
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT TO authenticated
  USING (get_user_rol() = 'admin');

-- Alleen admin mag rollen wijzigen
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin')
  WITH CHECK (get_user_rol() = 'admin');

-- ── Berichten ─────────────────────────────────────────────────────
-- Iedereen leest gepubliceerde berichten
CREATE POLICY "berichten_select_public"
  ON berichten FOR SELECT
  USING (gepubliceerd = true);

-- Admin mag alles schrijven
CREATE POLICY "berichten_insert_admin"
  ON berichten FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'admin');

CREATE POLICY "berichten_update_admin"
  ON berichten FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin')
  WITH CHECK (get_user_rol() = 'admin');

CREATE POLICY "berichten_delete_admin"
  ON berichten FOR DELETE TO authenticated
  USING (get_user_rol() = 'admin');

-- ── Leden-tabellen (lezen = alle leden; schrijven = alleen admin) ──

CREATE POLICY "liedjes_select_auth"
  ON liedjes FOR SELECT TO authenticated USING (true);
CREATE POLICY "liedjes_insert_admin"
  ON liedjes FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "liedjes_update_admin"
  ON liedjes FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "liedjes_delete_admin"
  ON liedjes FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

CREATE POLICY "nieuwsbrieven_select_auth"
  ON nieuwsbrieven FOR SELECT TO authenticated USING (true);
CREATE POLICY "nieuwsbrieven_insert_admin"
  ON nieuwsbrieven FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "nieuwsbrieven_update_admin"
  ON nieuwsbrieven FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "nieuwsbrieven_delete_admin"
  ON nieuwsbrieven FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

CREATE POLICY "bestuur_select_auth"
  ON bestuur FOR SELECT TO authenticated USING (true);
CREATE POLICY "bestuur_insert_admin"
  ON bestuur FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "bestuur_update_admin"
  ON bestuur FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "bestuur_delete_admin"
  ON bestuur FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

CREATE POLICY "smoelenboek_select_auth"
  ON smoelenboek FOR SELECT TO authenticated USING (true);
CREATE POLICY "smoelenboek_insert_admin"
  ON smoelenboek FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "smoelenboek_update_admin"
  ON smoelenboek FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "smoelenboek_delete_admin"
  ON smoelenboek FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

CREATE POLICY "opnames_select_auth"
  ON opnames FOR SELECT TO authenticated USING (true);
CREATE POLICY "opnames_insert_admin"
  ON opnames FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "opnames_update_admin"
  ON opnames FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "opnames_delete_admin"
  ON opnames FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

CREATE POLICY "choreo_select_auth"
  ON choreo FOR SELECT TO authenticated USING (true);
CREATE POLICY "choreo_insert_admin"
  ON choreo FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "choreo_update_admin"
  ON choreo FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "choreo_delete_admin"
  ON choreo FOR DELETE TO authenticated USING (get_user_rol() = 'admin');

CREATE POLICY "oude_optredens_select_auth"
  ON oude_optredens FOR SELECT TO authenticated USING (true);
CREATE POLICY "oude_optredens_insert_admin"
  ON oude_optredens FOR INSERT TO authenticated WITH CHECK (get_user_rol() = 'admin');
CREATE POLICY "oude_optredens_update_admin"
  ON oude_optredens FOR UPDATE TO authenticated USING (get_user_rol() = 'admin');
CREATE POLICY "oude_optredens_delete_admin"
  ON oude_optredens FOR DELETE TO authenticated USING (get_user_rol() = 'admin');


-- ----------------------------------------------------------------
-- 5. STORAGE BUCKETS
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('nieuwsbrieven', 'nieuwsbrieven', false, 10485760,  ARRAY['application/pdf']),
  ('liedjes',       'liedjes',       false, 10485760,  ARRAY['application/pdf']),
  ('fotos',         'fotos',         true,  5242880,   ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('media',         'media',         false, 524288000, ARRAY['video/mp4', 'audio/mpeg', 'audio/mp3', 'video/quicktime']);

-- Fotos zijn publiek
CREATE POLICY "fotos_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos');

-- Admin mag fotos uploaden
CREATE POLICY "fotos_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos' AND get_user_rol() = 'admin');

-- Leden mogen nieuwsbrieven downloaden; admin mag uploaden
CREATE POLICY "nieuwsbrieven_select_auth"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'nieuwsbrieven');
CREATE POLICY "nieuwsbrieven_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'nieuwsbrieven' AND get_user_rol() = 'admin');

-- Leden mogen liedjes-PDFs downloaden; admin mag uploaden
CREATE POLICY "liedjes_select_auth"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'liedjes');
CREATE POLICY "liedjes_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'liedjes' AND get_user_rol() = 'admin');

-- Leden mogen media bekijken; admin mag uploaden
CREATE POLICY "media_select_auth"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media');
CREATE POLICY "media_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND get_user_rol() = 'admin');


-- ----------------------------------------------------------------
-- 6. SEED DATA — berichten (nieuws)
-- ----------------------------------------------------------------

INSERT INTO berichten (slug, titel, datum, categorie, intro, inhoud, afbeelding) VALUES

('najaarsconcert-2026-kaartjes',
 'Najaarsconcert 2026 — kaartjes nu te koop',
 '12 oktober 2026', 'Concert',
 'Op zaterdag 7 november staan we weer op het podium van De Schakel in Gilze. Bestel nu je kaartjes voor een onvergetelijke avond vol popmuziek.',
 'Popkoor Divers is er klaar voor. Na maanden repeteren, zwoegen en genieten is het eindelijk zo ver: het najaarsconcert 2026 staat voor de deur. Op zaterdag 7 november openen de deuren van De Schakel in Gilze om 19:30 uur. Het concert begint om 20:00 uur.

Dit jaar heeft dirigent Tom Mordang een gevarieerd programma samengesteld dat oud en jong zal aanspreken. Van nostalgische jaren ''80 klassiekers tot hedendaagse hits — er is voor ieder wat wils. De vijf stemgroepen van Divers staan dit seizoen sterker dan ooit, en ook de begeleiding is van hoog niveau.

Kaartjes zijn beschikbaar via onze website en bij de kassa op de avond zelf (onder voorbehoud van beschikbaarheid). We raden aan om op tijd te reserveren, want de zaal is snel vol.

Meer informatie over het programma, de gastoptredens en de locatie volgt binnenkort. Houd onze website en sociale media in de gaten voor updates.',
 'divers-concert-1'),

('nieuwe-leden-gezocht',
 'Popkoor Divers zoekt nieuwe stemmen',
 '3 september 2026', 'Leden',
 'We zijn op zoek naar enthousiaste zangers en zangeressen die ons koor komen versterken. Geen auditie, gewoon een avond meezingen.',
 'Popkoor Divers groeit en bloeit — en daar zijn we trots op. Maar we zijn altijd op zoek naar nieuwe gezichten en stemmen die ons koor nog mooier maken.

Of je nu jarenlang in een koor hebt gezongen of gewoon graag zingt onder de douche — je bent van harte welkom om een avond te komen proeven. Er is geen auditie en geen drempel. Gewoon binnenlopen op een dinsdagavond om 20:00 uur bij De Schakel in Gilze.

We hebben momenteel plekken beschikbaar in vrijwel alle stemgroepen: alt, mezzo, sopraan, tenor en bas. Dirigent Tom Mordang zorgt ervoor dat je je snel thuis voelt en de juiste plek vindt.

Wil je weten hoe het er bij ons aan toe gaat? Neem dan contact op via info@popkoordivers.nl of meld je aan via ons contactformulier. We horen graag van je.',
 'divers-leden-1'),

('volkoren-festival-middelburg',
 'Divers op VÓLkoren festival in Middelburg',
 '18 juni 2026', 'Optreden',
 'In juni trok Popkoor Divers naar Middelburg voor het grootste korenfestival van Zeeland. Een dag om nooit te vergeten.',
 'Het VÓLkoren festival in Middelburg is een van de meest bijzondere ervaringen die een koor kan meemaken. Tientallen koren, duizenden bezoekers en één ding dat iedereen verbindt: de liefde voor zingen.

Popkoor Divers was dit jaar uitgenodigd als een van de deelnemende koren en we hebben er volop van genoten. De dag begon vroeg — om 9:00 uur vertrokken we vanuit Gilze — maar de energie was al meteen aanwezig. Onderweg zong het halve busje al mee.

Op het festivalterrein was het een drukte van jewelste. We hebben twee sets gespeeld: een om 13:00 uur op het hoofdpodium en een om 16:30 uur op het intieme theaterpodium. Beide optredens werden enthousiast ontvangen door het publiek.

Bijzonder was ook de spontane samenwerking met een koor uit België in de pauze. Gewoon op een bankje, a-capella, twee koren die samen een nummer improviseerden. Dat is de magie van dit soort evenementen.

We kijken nu al uit naar de volgende editie.',
 'divers-festival-1'),

('kerstconcert-petruskerk',
 'Kerstconcert in de Petruskerk — sfeervolle avond',
 '21 december 2025', 'Concert',
 'De Petruskerk in Gilze was de perfecte setting voor ons jaarlijkse kerstconcert. Een warme avond vol muziek en saamhorigheid.',
 'Er gaat niets boven zingen in een kerk met kaarslicht. Het kerstconcert van Popkoor Divers in de Petruskerk van Gilze was ook dit jaar weer een avond om in te kaderen.

De kerk zat tot de nok toe vol met vrienden, familie en muziekliefhebbers. Samen met onze pianist en een speciale gastsolist brachten we een programma van klassieke kerstliederen en moderne poparrangementen.

Hoogtepunt van de avond was de gezamenlijke uitvoering van ''Hallelujah'' door Leonard Cohen — het publiek in de zaal zong gewoon mee. Spontaan, warm en ontroerend.

Na het concert was er gelegenheid om na te praten bij glühwein en warme chocolademelk. Precies waar december voor is.

Dank aan iedereen die er was en aan de vrijwilligers die alles hebben georganiseerd. Tot volgend jaar!',
 'divers-kerk-1'),

('jubileum-zonnebloem-tilburg',
 'Gastoptreden bij jubileum Zonnebloem Tilburg',
 '6 december 2025', 'Optreden',
 'Uitgenodigd voor het jubileum van Zonnebloem Tilburg — een bijzonder optreden voor een bijzonder publiek in een warme sfeer.',
 'Niet elk optreden is hetzelfde, en dat is maar goed ook. Het gastoptreden bij het 40-jarig jubileum van Zonnebloem Tilburg was een van die avonden die je niet snel vergeet.

Zonnebloem is een organisatie die zich inzet voor mensen met een lichamelijke beperking. Het jubileum werd gevierd in een feestzaal in Tilburg, met een publiek dat onze muziek met open armen ontving.

We speelden een set van ongeveer 45 minuten, afgewisseld met korte verhalende stukjes over het koor. De reacties waren overweldigend — er werden tranen gelachen én gehuild, wat ons betreft een teken dat de muziek echt is aangekomen.

Zonnebloem heeft ons na afloop bedankt met een prachtige bos bloemen en een hartelijk applaus dat nog minuten aanhield. Het gevoel dat je met muziek iets kunt betekenen voor mensen — dat is waarom we dit doen.',
 'divers-zonnebloem-1'),

('nieuw-seizoen-2026-2027',
 'Nieuw seizoen van start — dit staat op het programma',
 '2 september 2025', 'Nieuws',
 'Het nieuwe seizoen is begonnen en de agenda is gevuld. Een overzicht van wat Popkoor Divers het komende jaar op de planning heeft staan.',
 'Na de zomerstop zijn we weer fris en fruitig van start gegaan. Dinsdagavond was de eerste repetitie van het nieuwe seizoen, en het enthousiasme was om te snijden.

Dirigent Tom Mordang heeft het programma voor het komende jaar al grotendeels uitgestippeld. We werken toe naar het najaarsconcert in november, een kerstoptreden in december en — als alles goed gaat — een deelname aan een korenfestival in het voorjaar.

Nieuw dit seizoen is de uitbreiding van de tenorgroep. We hebben drie nieuwe mannen kunnen verwelkomen die het koor een rijkere klank geven. Ook is er een nieuwe pianiste die ons begeleid naast de vaste band.

De sfeer in De Schakel was op de eerste avond meteen al goed. Nieuwe gezichten, vertrouwde stemmen en de gedeelde passie voor popmuziek — dat is Divers.

Ben je benieuwd en wil je een keer meeproeven? Kom gewoon langs op een dinsdagavond. Je bent altijd welkom.',
 'divers-seizoen-1');


-- ----------------------------------------------------------------
-- 7. SEED DATA — ledenomgeving
-- ----------------------------------------------------------------

INSERT INTO liedjes (titel, componist, stemgroep, volgorde) VALUES
  ('Dancing Queen',             'ABBA',              'Alt',    1),
  ('Bohemian Rhapsody',         'Queen',             'Alt',    2),
  ('I Will Survive',            'Gloria Gaynor',     'Alt',    3),
  ('Rolling in the Deep',       'Adele',             'Alt',    4),
  ('Proud Mary',                'Tina Turner',       'Alt',    5),
  ('Total Eclipse of the Heart','Bonnie Tyler',      'Mezzo',  1),
  ('I Will Always Love You',    'Whitney Houston',   'Mezzo',  2),
  ('Valerie',                   'Amy Winehouse',     'Mezzo',  3),
  ('Somebody That I Used to Know','Gotye',           'Mezzo',  4),
  ('Stay With Me',              'Sam Smith',         'Mezzo',  5),
  ('Angels',                    'Robbie Williams',   'Sopraan',1),
  ('Don''t Stop Me Now',        'Queen',             'Sopraan',2),
  ('Perfect',                   'Ed Sheeran',        'Sopraan',3),
  ('Shallow',                   'Lady Gaga',         'Sopraan',4),
  ('Fix You',                   'Coldplay',          'Sopraan',5),
  ('Hey Jude',                  'The Beatles',       'Tenor',  1),
  ('With or Without You',       'U2',                'Tenor',  2),
  ('Uptown Funk',               'Bruno Mars',        'Tenor',  3),
  ('Mr. Brightside',            'The Killers',       'Tenor',  4),
  ('Seven Nation Army',         'The White Stripes', 'Tenor',  5),
  ('Under Pressure',            'Queen & David Bowie','Bas',   1),
  ('Don''t Stop Believin''',    'Journey',           'Bas',    2),
  ('Wonderwall',                'Oasis',             'Bas',    3),
  ('Sweet Child O''Mine',       'Guns N'' Roses',    'Bas',    4),
  ('Living on a Prayer',        'Bon Jovi',          'Bas',    5);

INSERT INTO nieuwsbrieven (datum, titel, volgorde) VALUES
  ('Oktober 2026',   'Nieuwsbrief herfst 2026',  1),
  ('Juni 2026',      'Nieuwsbrief zomer 2026',    2),
  ('Maart 2026',     'Nieuwsbrief voorjaar 2026', 3),
  ('December 2025',  'Nieuwsbrief winter 2025',   4),
  ('September 2025', 'Nieuwsbrief herfst 2025',   5),
  ('Mei 2025',       'Nieuwsbrief zomer 2025',    6);

INSERT INTO bestuur (naam, rol, initialen, volgorde) VALUES
  ('Annemarie de Groot', 'Voorzitter',       'AG', 1),
  ('Peter van den Berg', 'Secretaris',       'PB', 2),
  ('Marieke Smits',      'Penningmeester',   'MS', 3),
  ('Tom Mordang',        'Dirigent',         'TM', 4),
  ('Linda Jansen',       'Ledencoördinator', 'LJ', 5),
  ('Hans Willems',       'PR & Communicatie','HW', 6);

INSERT INTO smoelenboek (naam, stemgroep, initialen) VALUES
  ('Anna Bakker',       'Alt',     'AB'),
  ('Marjan de Vries',   'Alt',     'MV'),
  ('Sanne Hendriks',    'Alt',     'SH'),
  ('Ria Peeters',       'Mezzo',   'RP'),
  ('Carla Vermeer',     'Mezzo',   'CV'),
  ('Joke van Dam',      'Mezzo',   'JD'),
  ('Lisa van der Meer', 'Sopraan', 'LM'),
  ('Emma Bos',          'Sopraan', 'EB'),
  ('Floor Mulder',      'Sopraan', 'FM'),
  ('Jan de Boer',       'Tenor',   'JB'),
  ('Erik Lammers',      'Tenor',   'EL'),
  ('Rob van Leeuwen',   'Tenor',   'RL'),
  ('Gerard Kuipers',    'Bas',     'GK'),
  ('Frank Hofman',      'Bas',     'FH'),
  ('Kees van Wijk',     'Bas',     'KW');

INSERT INTO opnames (titel, datum, type, volgorde) VALUES
  ('Najaarsconcert 2025 — volledige opname', 'November 2025', 'video', 1),
  ('VÓLkoren Festival — set 1',              'Juni 2025',     'video', 2),
  ('Kerstconcert 2024 — Hallelujah',         'December 2024', 'audio', 3),
  ('Jubileum 15 jaar — hoogtepunten',        'November 2023', 'video', 4);

INSERT INTO choreo (titel, lied, volgorde) VALUES
  ('Choreo Dancing Queen',     'Dancing Queen — ABBA',           1),
  ('Choreo Uptown Funk',       'Uptown Funk — Bruno Mars',       2),
  ('Choreo I Will Survive',    'I Will Survive — Gloria Gaynor', 3),
  ('Choreo Don''t Stop Me Now','Don''t Stop Me Now — Queen',     4);

INSERT INTO oude_optredens (titel, datum, locatie, volgorde) VALUES
  ('Najaarsconcert 2025', 'November 2025', 'De Schakel, Gilze', 1),
  ('VÓLkoren Festival',   'Juni 2025',     'Middelburg',         2),
  ('Kerstconcert 2024',   'December 2024', 'Petruskerk, Gilze',  3),
  ('Jubileum 15 jaar',    'November 2023', 'De Schakel, Gilze',  4),
  ('Zomerborrel 2023',    'Juni 2023',     'De Schakel, Gilze',  5),
  ('Koningsdag 2023',     'April 2023',    'Centrum Gilze',      6);
