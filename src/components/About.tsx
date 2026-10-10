import Image from "next/image";
import AnimatedSection from "./AnimatedSection";
import type { Photo } from "@/lib/photo-sections";
import {
  BedDouble,
  Users,
  WifiOff,
  Flame,
  Trees,
  UtensilsCrossed,
  Car,
  Dog,
} from "lucide-react";

const AMENITIES = [
  { icon: BedDouble, label: "2 ložnice, vhodné pro 4–6 osob" },
  { icon: UtensilsCrossed, label: "Plně vybavená kuchyně" },
  { icon: Flame, label: "Krb a venkovní ohniště" },
  { icon: WifiOff, label: "Momentálně bez Wi-Fi" },
  { icon: Car, label: "Vlastní parkování u chaty" },
  { icon: Dog, label: "Vstup se psem povolen" },
  { icon: Trees, label: "Výhled do vlastního ovocného sadu" },
  { icon: Users, label: "Ideální pro rodiny i skupiny přátel" },
];

export default function About({ photo }: { photo?: Photo }) {
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
            {/* Main photo is chosen on the admin page (Fotky → "Hlavní fotka
                v sekci O chatě"); until then, the photo from the purchase. */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
              <Image
                src={photo?.url ?? "/images/chata-koupe-2025.jpg"}
                alt={photo?.caption || "Chata Vřesovice"}
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <p className="text-base leading-relaxed text-stone">
              Chata Vřesovice je zděná chata v klidné chatové oblasti kousek
              od lesa, obklopená loukami. Z okna i z terasy je pěkný výhled
              do vlastního ovocného sadu – místo jako stvořené pro pomalá
              rána s kávou a večery beze spěchu.
            </p>
            <p className="mt-4 text-base leading-relaxed text-stone">
              Uvnitř na vás čeká útulně zařízený interiér s plně vybavenou
              kuchyní a krbem, u kterého se dá v chladnějších měsících
              strávit dlouhý večer. Wi-Fi tu momentálně není, takže je to
              skvělá příležitost si od internetu na pár dní odpočinout – ať
              už přijedete na víkend s rodinou, nebo na týden s partou
              přátel.
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
