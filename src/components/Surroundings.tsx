import AnimatedSection from "./AnimatedSection";
import AttractionsExplorer from "./AttractionsExplorer";

export default function Surroundings() {
  return (
    <section id="okoli" className="bg-forest/5 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            Okolí
          </p>
          <h2 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
            Vřesovice u Kyjova a jejich okolí
          </h2>
          <p className="mt-4 max-w-2xl text-base text-stone">
            Chata stojí v podhůří Chřibů, kousek od Kyjova, v krajině, které
            se pro její zvlněné vinice a sady přezdívá „Moravské Toskánsko&quot;.
            Vyberte si kategorii a proklikejte si tipy na výlet – od
            rozhleden a skalních zřícenin až po vinné sklepy a přírodní
            koupání.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.05} className="mt-10">
          <AttractionsExplorer />
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="mt-12">
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
            <iframe
              title="Mapa okolí Vřesovic u Kyjova"
              className="h-80 w-full"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=17.05%2C48.98%2C17.38%2C49.14&layer=mapnik&marker=49.059051%2C17.215106"
            />
          </div>
          <p className="mt-2 text-center text-xs text-stone/70">
            Vřesovice u Kyjova (49.059, 17.215) – podhůří Chřibů, cca 9 km od
            Kyjova.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
