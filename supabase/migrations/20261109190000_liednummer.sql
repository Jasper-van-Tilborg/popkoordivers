-- Liednummer bij een opname: het nummer waarmee het koor een lied in de map
-- terugvindt (op de oude site stond het achter de naam, bv. "... Alt Piano 030").
-- De opnames sorteren erop; de admin vult het in bij een nieuwe opname.
ALTER TABLE bestanden ADD COLUMN liednummer smallint CHECK (liednummer > 0);
