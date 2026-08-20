import AnimatedSection from "./AnimatedSection";
import { Mountain, Waves, Bike, Landmark, Footprints, Fish } from "lucide-react";

const ACTIVITIES = [
  {
    icon: Footprints,
    title: "Turistické stezky",
    text: "Značené trasy pro pěší výlety do okolních lesů a na vyhlídky, vhodné i pro rodiny s dětmi.",
  },
  {
    icon: Bike,
    title: "Cyklovýlety",
    text: "Síť cyklotras v okolí nabízí projížďky různé náročnosti – od klidných úseků až po náročnější terén.",
  },
  {
    icon: Waves,
    title: "Koupání a rybaření",
    text: "Blízké rybníky a řeka lákají k odpočinku u vody, osvěžení i k rybaření.",
  },
  {
    icon: Mountain,
    title: "Vyhlídky",
    text: "Několik přírodních vyhlídkových bodů v pěší dostupnosti s výhledem do kraje.",
  },
  {
    icon: Landmark,
    title: "Památky a obce",
    text: "Okolní vesnice a městečka s historickými památkami, útulnými hostinci a místními trhy.",
  },
  {
    icon: Fish,
    title: "Místní gastronomie",
    text: "Restaurace a hospůdky v okolí, kde lze vyzkoušet tradiční českou kuchyni.",
  },
];

export default function Surroundings() {
  return (
    <section id="okoli" className="bg-forest/5 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            Okolí
          </p>
          <h2 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
            Příroda na dosah
          </h2>
          <p className="mt-4 max-w-2xl text-base text-stone">
            Chata je obklopena krajinou plnou lesů, luk a klidných vesnic.
            Ať máte rádi aktivní dovolenou, nebo jen chcete vypnout, okolí
            nabízí vyžití pro každého.
          </p>
        </AnimatedSection>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map(({ icon: Icon, title, text }, i) => (
            <AnimatedSection key={title} delay={i * 0.05}>
              <div className="h-full rounded-2xl bg-background p-6 shadow-sm ring-1 ring-black/5">
                <Icon className="h-8 w-8 text-forest" />
                <h3 className="mt-4 font-display text-lg text-forest-dark">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  {text}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.15} className="mt-12">
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
            {/* Placeholder map location – nahraďte skutečnými souřadnicemi chaty */}
            <iframe
              title="Mapa okolí chaty"
              className="h-80 w-full"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=15.35%2C49.75%2C15.65%2C49.95&layer=mapnik"
            />
          </div>
          <p className="mt-2 text-center text-xs text-stone/70">
            Orientační mapa – po upřesnění adresy chaty nahraďte skutečnou
            pozicí.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
