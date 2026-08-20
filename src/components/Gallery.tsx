"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const PLACEHOLDER_IMAGES = [
  { label: "Exteriér chaty", gradient: "from-forest/40 via-wood-light/30 to-forest/10" },
  { label: "Obývací pokoj s krbem", gradient: "from-wood/40 via-wood-light/20 to-background" },
  { label: "Ložnice", gradient: "from-forest/30 via-background to-wood-light/30" },
  { label: "Kuchyň", gradient: "from-wood-light/40 via-forest/10 to-forest/30" },
  { label: "Zahrada a terasa", gradient: "from-forest/50 via-forest/10 to-wood-light/20" },
  { label: "Výhled do okolí", gradient: "from-wood-light/30 via-forest/20 to-forest/40" },
];

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + PLACEHOLDER_IMAGES.length) % PLACEHOLDER_IMAGES.length
    );
  const next = () =>
    setActiveIndex((i) =>
      i === null ? null : (i + 1) % PLACEHOLDER_IMAGES.length
    );

  return (
    <section id="galerie" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-5">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            Galerie
          </p>
          <h2 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
            Chata v obrazech
          </h2>
          <p className="mt-4 max-w-2xl text-base text-stone">
            Zatím ukázkové náhledy – jakmile budou k dispozici skutečné
            fotografie, snadno je zde nahradíte.
          </p>
        </AnimatedSection>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PLACEHOLDER_IMAGES.map((img, i) => (
            <AnimatedSection key={img.label} delay={i * 0.04}>
              <button
                onClick={() => setActiveIndex(i)}
                className={`group relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${img.gradient} text-center transition-transform hover:scale-[1.02]`}
              >
                <ImageIcon className="h-7 w-7 text-forest-dark/60" />
                <span className="px-3 text-xs font-medium text-forest-dark/80">
                  {img.label}
                </span>
              </button>
            </AnimatedSection>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
            onClick={close}
          >
            <button
              aria-label="Zavřít"
              className="absolute right-6 top-6 text-cream/80 hover:text-cream"
              onClick={close}
            >
              <X className="h-7 w-7" />
            </button>

            <button
              aria-label="Předchozí"
              className="absolute left-4 text-cream/80 hover:text-cream sm:left-8"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft className="h-9 w-9" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`flex aspect-[4/3] w-full max-w-xl flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br ${PLACEHOLDER_IMAGES[activeIndex].gradient} text-center`}
            >
              <ImageIcon className="h-10 w-10 text-forest-dark/60" />
              <p className="font-medium text-forest-dark/90">
                {PLACEHOLDER_IMAGES[activeIndex].label}
              </p>
            </motion.div>

            <button
              aria-label="Další"
              className="absolute right-4 text-cream/80 hover:text-cream sm:right-8"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
