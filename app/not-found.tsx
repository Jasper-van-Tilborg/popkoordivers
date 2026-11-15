import type { Metadata } from "next";
import NietGevonden from "./_fout/NietGevonden";

export const metadata: Metadata = { title: "Pagina niet gevonden — Popkoor Divers" };

export default function NotFound() {
  return <NietGevonden />;
}
