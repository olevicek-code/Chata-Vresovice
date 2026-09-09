import type { Metadata } from "next";
import { Users } from "lucide-react";
import ReservationApp from "@/components/ReservationApp";

export const metadata: Metadata = {
  title: "Rezervace | Chata Vřesovice",
  description: "Vyberte si termín a odešlete žádost o rezervaci Chaty Vřesovice.",
  alternates: {
    canonical: "/rezervace",
  },
};

export default function RezervacePage() {
  return (
    <section className="bg-forest/5 py-20">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-wood">
          Rezervace
        </p>
        <h1 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
          Rezervujte si svůj pobyt
        </h1>
        <p className="mt-4 max-w-2xl text-base text-stone">
          Vyplňte formulář a vyberte termín v kalendáři. Žádost o rezervaci
          zatím slouží pro rodinu a přátele – po odeslání se s vámi
          spojíme a termín potvrdíme.
        </p>

        <div className="mt-6 flex max-w-2xl items-start gap-3 rounded-xl bg-wood-light/15 px-5 py-4 ring-1 ring-wood-light/30">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-wood" />
          <div>
            <p className="text-sm font-semibold text-forest-dark">
              Zatím jen pro rodinu, přátele a známé
            </p>
            <p className="mt-1 text-sm text-stone">
              Chatu si zatím neveřejňujeme jako klasický pronájem – je
              především pro nás a lidi, které známe. Pokud nás znáte a máte
              o pobyt zájem, vyberte si termín v kalendáři a napište nám,
              rádi se s vámi domluvíme.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-wood">
              Volný termín: dle domluvy
            </p>
          </div>
        </div>

        <div className="mt-10">
          <ReservationApp />
        </div>
      </div>
    </section>
  );
}
