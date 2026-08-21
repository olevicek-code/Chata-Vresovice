import AnimatedSection from "./AnimatedSection";
import { Home, Sprout, ImagePlus } from "lucide-react";

export default function History() {
  return (
    <section id="historie" className="bg-[#f2ede9] py-24">
      <div className="mx-auto max-w-4xl px-5">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            Historie chaty
          </p>
          <h2 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
            Náš příběh teprve začíná
          </h2>
          <p className="mt-4 max-w-2xl text-base text-stone">
            Tahle sekce poroste společně s chatou – s každou další sezónou
            sem přibude nová kapitola, fotky z rekonstrukce i vzpomínky na
            první pobyty.
          </p>
        </AnimatedSection>

        <div className="mt-14 space-y-10 border-l-2 border-forest/20 pl-8 sm:pl-10">
          <AnimatedSection className="relative">
            <span className="absolute -left-[calc(2rem+7px)] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest ring-4 ring-[#f2ede9] sm:-left-[calc(2.5rem+7px)]" />
            <div className="rounded-2xl bg-background p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-dark">
                  2025
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-wood">
                  <Home className="h-4 w-4" />
                  Chata je naše
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl text-forest-dark">
                Koupili jsme Chatu Vřesovice
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                V roce 2025 jsme si splnili sen a stali se majiteli chaty ve
                Vřesovicích. Teprve poznáváme každý kout pozemku i okolí –
                brzy sem doplníme vyprávění o tom, jak vše začalo, fotky z
                předání a první dojmy.
              </p>
              {/* Placeholder photo slot – nahraďte skutečnou fotkou z předání/koupě */}
              <div className="mt-5 flex aspect-[16/9] w-full max-w-md items-center justify-center rounded-xl bg-gradient-to-br from-wood-light/25 via-forest/10 to-forest/20 text-center text-stone">
                <div>
                  <ImagePlus className="mx-auto h-8 w-8 text-forest" />
                  <p className="mt-2 text-xs">
                    Sem časem přibude fotka z koupě chaty
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="relative">
            <span className="absolute -left-[calc(2rem+7px)] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-dashed border-forest/40 bg-[#f2ede9] ring-4 ring-[#f2ede9] sm:-left-[calc(2.5rem+7px)]" />
            <div className="rounded-2xl border-2 border-dashed border-forest/25 bg-forest/[0.03] p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-dark">
                  2026 a dál
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-wood">
                  <Sprout className="h-4 w-4" />
                  Další kapitoly teprve píšeme
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl text-forest-dark/70">
                Sem přibude vaše další vzpomínka
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                Rekonstrukce, první letní večery, zimní víkendy s rodinou –
                jakmile se to stane, najde to místo právě tady. Tento rámeček
                je zatím prázdný a čeká na text i fotky.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
