import { notFound } from "next/navigation";

// Een onbekend adres onder /leden: niet-gevonden binnen de ledenomgeving (na het inloggen),
// in plaats van de 404 van de openbare site.
export default function Onbekend() {
  notFound();
}
