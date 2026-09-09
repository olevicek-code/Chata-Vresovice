import Hero from "@/components/Hero";
import About from "@/components/About";
import History from "@/components/History";
import QuickFacts from "@/components/QuickFacts";
import Surroundings from "@/components/Surroundings";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import WaveDivider from "@/components/WaveDivider";
import { CHATA } from "@/lib/leaflet";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Chata Vřesovice",
  description:
    "Rodinná chata pro nezapomenutelné chvíle s rodinou a přáteli, v podhůří Chřibů kousek od Kyjova.",
  url: "https://www.chatavresovice.cz",
  image: "https://www.chatavresovice.cz/opengraph-image",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Vřesovice 569",
    addressLocality: "Vřesovice",
    addressCountry: "CZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: CHATA.lat,
    longitude: CHATA.lon,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, hand-written object above – no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <Hero />
      <About />
      <WaveDivider bg="var(--background)" wave="var(--background-alt)" />
      <History />
      <WaveDivider bg="var(--background-alt)" wave="var(--forest-dark)" />
      <QuickFacts />
      <WaveDivider bg="var(--forest-dark)" wave="var(--background-alt)" />
      <Surroundings />
      <WaveDivider bg="var(--background-alt)" wave="var(--background)" />
      <Gallery />
      <FAQ />
      <WaveDivider bg="var(--background)" wave="var(--forest-dark)" />
    </>
  );
}
