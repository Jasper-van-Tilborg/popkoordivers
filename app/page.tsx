import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Performances from "@/components/Performances";
import JoinUs from "@/components/JoinUs";
import WhatWeDo from "@/components/WhatWeDo";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Performances />
        <JoinUs />
        <WhatWeDo />
      </main>
      <Footer />
    </>
  );
}
