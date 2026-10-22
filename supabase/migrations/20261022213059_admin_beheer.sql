-- Alles beheerbaar vanuit de admin.

-- Smoelenboek en bestuur komen voortaan uit de ledenlijst.
ALTER TABLE profiles
  ADD COLUMN bestuursfunctie text,
  ADD COLUMN in_smoelenboek  boolean NOT NULL DEFAULT true;

-- Admins mogen ook verborgen agenda-items en berichten lezen
-- (de publieke policies tonen alleen gepubliceerde rijen).
CREATE POLICY "agenda_select_admin" ON agenda
  FOR SELECT TO authenticated USING (get_user_rol() = 'admin');

CREATE POLICY "berichten_select_admin" ON berichten
  FOR SELECT TO authenticated USING (get_user_rol() = 'admin');

-- Bestanden konden niet worden aangepast (alleen toegevoegd en verwijderd).
CREATE POLICY "bestanden_update_admin" ON bestanden
  FOR UPDATE TO authenticated
  USING (get_user_rol() = 'admin') WITH CHECK (get_user_rol() = 'admin');
