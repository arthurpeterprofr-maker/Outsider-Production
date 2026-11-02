import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Marquee } from "../components/Marquee";
import { About } from "../components/About";
import { Founders } from "../components/Founders";
import { Manifesto } from "../components/Manifesto";
import { Vision } from "../components/Vision";
import { Expertise } from "../components/Expertise";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { SmoothScroll } from "../lib/smooth";

export default function Home() {
  return (
    <main className="bg-[#050505] text-white" data-testid="home-page">
      <SmoothScroll />
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Founders />
      <Manifesto />
      <Vision />
      <Expertise />
      <Contact />
      <Footer />
    </main>
  );
}
