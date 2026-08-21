import Hero from "@/components/Hero";
import About from "@/components/About";
import History from "@/components/History";
import QuickFacts from "@/components/QuickFacts";
import Surroundings from "@/components/Surroundings";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import WaveDivider from "@/components/WaveDivider";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <WaveDivider bg="var(--background)" wave="#f2ede9" />
      <History />
      <WaveDivider bg="#f2ede9" wave="var(--forest-dark)" />
      <QuickFacts />
      <WaveDivider bg="var(--forest-dark)" wave="#f2ede9" />
      <Surroundings />
      <WaveDivider bg="#f2ede9" wave="var(--background)" />
      <Gallery />
      <FAQ />
      <WaveDivider bg="var(--background)" wave="var(--forest-dark)" />
    </>
  );
}
