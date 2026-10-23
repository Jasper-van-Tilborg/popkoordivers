-- Drie niveaus: lid, redacteur (inhoud beheren) en admin (alles).
-- Een nieuwe enumwaarde moet in een eigen migratie, vóór hij gebruikt wordt.
ALTER TYPE user_rol ADD VALUE IF NOT EXISTS 'redacteur' BEFORE 'admin';
