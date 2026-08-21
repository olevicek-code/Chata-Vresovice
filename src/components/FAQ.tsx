"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const ITEMS = [
  {
    q: "V kolik hodin je příjezd a odjezd?",
    a: "Standardně počítáme s příjezdem od 15:00 a odjezdem do 10:00, ale u rodiny a přátel jsme samozřejmě flexibilní – stačí se domluvit předem přes rezervační formulář nebo telefonicky.",
  },
  {
    q: "Je možné vzít s sebou psa?",
    a: "Ano, vstup se psem je u nás povolený. Dejte nám prosím vědět předem, ať víme, kolik chlupatých hostů se na chatu chystá.",
  },
  {
    q: "Kde můžeme zaparkovat?",
    a: "Přímo u chaty je vlastní parkovací místo, takže s autem dojedete až na místo bez starostí o parkování v okolí.",
  },
  {
    q: "Je na chatě k dispozici Wi-Fi?",
    a: "Ano, na chatě je Wi-Fi připojení, takže i při odpočinku v přírodě zůstanete v případě potřeby v kontaktu.",
  },
  {
    q: "Jak funguje rezervace?",
    a: "Rezervace zatím slouží především pro rodinu a přátele. Vyberete si termín v kalendáři, odešlete žádost a my se vám ozveme s potvrzením – žádný automatický systém plateb zatím není potřeba.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-5">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            Časté dotazy
          </p>
          <h2 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
            Než se zeptáte
          </h2>
        </AnimatedSection>

        <div className="mt-10 space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <AnimatedSection key={item.q} delay={i * 0.04}>
                <div className="overflow-hidden rounded-2xl bg-forest/5 ring-1 ring-black/5">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-forest-dark">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-forest"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-stone">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
