import AnimatedSection from "./AnimatedSection";
import {
  BedDouble,
  Users,
  Wifi,
  Flame,
  Trees,
  UtensilsCrossed,
  Car,
  Dog,
} from "lucide-react";

const AMENITIES = [
  { icon: BedDouble, label: "4 ložnice, lůžka pro až 10 osob" },
  { icon: UtensilsCrossed, label: "Plně vybavená kuchyně" },
  { icon: Flame, label: "Krb a venkovní ohniště" },
  { icon: Wifi, label: "Wi-Fi připojení" },
  { icon: Car, label: "Vlastní parkování u chaty" },
  { icon: Dog, label: "Vstup se psem povolen" },
  { icon: Trees, label: "Zahrada s výhledem do lesa" },
  { icon: Users, label: "Ideální pro rodiny i skupiny přátel" },
];

export default function About() {
  return (
    <section id="o-chate" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-5">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            O chatě
          </p>
          <h2 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
            Prostor, kde se dobře dýchá
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid gap-12 md:grid-cols-2 md:items-center">
          <AnimatedSection delay={0.05}>
            {/* Placeholder photo – nahraďte skutečnou fotografií interiéru/exteriéru */}
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-wood-light/30 via-forest/10 to-forest/30 text-center text-stone">
              <div>
                <Trees className="mx-auto h-10 w-10 text-forest" />
                <p className="mt-3 text-sm">
                  Zde bude fotografie chaty
                  <br />
                  (nahraďte vlastním obrázkem)
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <p className="text-base leading-relaxed text-stone">
              Chata Vřesovice je dřevěná roubenka obklopená vzrostlými
              stromy, jen kousek od lesa a lučin plných zeleně. Ať přijedete
              na víkend s rodinou, nebo na týden s partou přátel, najdete zde
              dost místa k pohodlnému pobytu i klidu na oddech.
            </p>
            <p className="mt-4 text-base leading-relaxed text-stone">
              Interiér kombinuje útulnost dřevěné chalupy s moderním
              vybavením – od plně zařízené kuchyně po krb, u kterého lze
              strávit dlouhé večery.
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {AMENITIES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-forest/5 px-4 py-3 text-sm text-forest-dark"
                >
                  <Icon className="h-5 w-5 shrink-0 text-forest" />
                  {label}
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
