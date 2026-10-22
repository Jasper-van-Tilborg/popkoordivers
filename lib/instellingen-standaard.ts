import type { Tables } from "@/lib/database.types";

export type Instellingen = Omit<Tables<"website_instellingen">, "id" | "updated_at">;

// Als de database even niet bereikbaar is, blijft de site werken met deze waarden.
export const STANDAARD: Instellingen = {
  repetitie_dag: "Dinsdag",
  repetitie_tijd: "19:30 – 21:30",
  repetitie_locatie: "CCGR De Schakel",
  repetitie_adres: "Kerkstraat 104, 5126 GD Gilze",
  email: "popkoordivers@gmail.com",
  facebook: "https://www.facebook.com/p/Popkoor-Divers-100066853672465/?locale=nl_NL",
  instagram: "https://www.instagram.com/popkoordivers/",
  youtube: "https://www.youtube.com/@popkoordivers",
  sponsorkliks: "https://www.sponsorkliks.com/products/shops.php?club=13468&cn=nl&ln=nl",
};
