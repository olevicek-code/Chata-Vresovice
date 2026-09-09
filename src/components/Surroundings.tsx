import AnimatedSection from "./AnimatedSection";
import AttractionsExplorer from "./AttractionsExplorer";
import ChribyTrails from "./ChribyTrails";
import TrailPlanner from "./TrailPlanner";
import LocationMap from "./LocationMap";

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

        <AnimatedSection delay={0.1} className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            Pro pěší turisty
          </p>
          <h3 className="mt-2 font-display text-2xl font-medium text-forest-dark sm:text-3xl">
            20 tipů na túru po Chřibech
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-stone">
            Vrcholy, skály, studánky i zřícenina hradu v okolních lesích –
            rozklikněte si místo pro popis, na mapě se vám zvýrazní.
          </p>
          <div className="mt-6">
            <ChribyTrails />
          </div>
          <div className="mt-6">
            <TrailPlanner />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="mt-12">
          <LocationMap />
          <p className="mt-2 text-center text-xs text-stone/70">
            Chata Vřesovice, Vřesovice 569 – podhůří Chřibů, cca 9 km od
            Kyjova.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
