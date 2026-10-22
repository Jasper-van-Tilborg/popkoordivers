import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Performances from "@/components/Performances";
import WhatWeDo from "@/components/WhatWeDo";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("agenda")
    .select("id, titel, datum, datum_sorteer, tijd, locatie, beschrijving, link")
    .eq("gepubliceerd", true)
    .or(`datum_sorteer.is.null,datum_sorteer.gte.${today}`)
    .order("datum_sorteer", { ascending: true, nullsFirst: false })
    .limit(2);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Performances events={events ?? []} />
        <WhatWeDo />
      </main>
      <Footer />
    </>
  );
}
