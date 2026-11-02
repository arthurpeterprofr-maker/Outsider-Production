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
import { Films } from "../components/Films";
import { Intro } from "../components/Intro";
import { Press } from "../components/Press";
import { Commercials } from "../components/Commercials";
import { PreviewBanner } from "../components/PreviewBanner";

export default function Home() {
  return (
    <main className="bg-[#050505] text-white" data-testid="home-page">
      <SmoothScroll />
      <Intro />
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Founders />
      <Films />
      <Commercials />
      <Press />
      <Manifesto />
      <Vision />
      <Expertise />
      <Contact />
      <Footer />
      <PreviewBanner />
    </main>
  );
}
