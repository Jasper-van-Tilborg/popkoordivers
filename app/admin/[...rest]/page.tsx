import { notFound } from "next/navigation";

// Een onbekend adres onder /admin: niet-gevonden binnen de admin, met de zijbalk erbij.
export default function Onbekend() {
  notFound();
}
