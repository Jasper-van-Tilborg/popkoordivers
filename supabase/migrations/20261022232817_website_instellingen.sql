-- Gegevens die op meerdere plekken op de website staan, aan te passen in de admin.
CREATE TABLE website_instellingen (
  id                int  PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- altijd precies één rij
  repetitie_dag     text NOT NULL DEFAULT 'Dinsdag',
  repetitie_tijd    text NOT NULL DEFAULT '19:30 – 21:30',
  repetitie_locatie text NOT NULL DEFAULT 'CCGR De Schakel',
  repetitie_adres   text NOT NULL DEFAULT 'Kerkstraat 104, 5126 GD Gilze',
  email             text NOT NULL DEFAULT 'popkoordivers@gmail.com',
  facebook          text NOT NULL DEFAULT 'https://www.facebook.com/p/Popkoor-Divers-100066853672465/?locale=nl_NL',
  instagram         text NOT NULL DEFAULT 'https://www.instagram.com/popkoordivers/',
  youtube           text NOT NULL DEFAULT 'https://www.youtube.com/@popkoordivers',
  sponsorkliks      text NOT NULL DEFAULT 'https://www.sponsorkliks.com/products/shops.php?club=13468&cn=nl&ln=nl',
  updated_at        timestamptz NOT NULL DEFAULT now()
);

INSERT INTO website_instellingen (id) VALUES (1);

ALTER TABLE website_instellingen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instellingen_select_public" ON website_instellingen
  FOR SELECT USING (true);

CREATE POLICY "instellingen_update_admin" ON website_instellingen
  FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin') WITH CHECK (get_user_rol() = 'admin');
