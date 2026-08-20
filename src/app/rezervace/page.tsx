import type { Metadata } from "next";
import ReservationApp from "@/components/ReservationApp";

export const metadata: Metadata = {
  title: "Rezervace | Chata Vřesovice",
  description: "Vyberte si termín a odešlete žádost o rezervaci Chaty Vřesovice.",
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

        <div className="mt-10">
          <ReservationApp />
        </div>
      </div>
    </section>
  );
}
