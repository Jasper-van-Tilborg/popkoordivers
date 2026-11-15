-- Het smoelenboek wordt een vaste groep in Wie is wie, naast het bestuur.
-- Een nieuwe enum-waarde mag pas na de commit gebruikt worden: daarom een eigen migratie.
ALTER TYPE groep_soort ADD VALUE IF NOT EXISTS 'smoelenboek';
