"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, CalendarCheck } from "lucide-react";
import ForestScene from "./ForestScene";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-forest-dark text-cream">
      {/* Animated forest + river backdrop with deer walking by the water.
          No photo needed – swap for a real photo later if you prefer. */}
      <ForestScene />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-32">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-full border border-cream/30 px-4 py-1 text-xs font-medium uppercase tracking-widest text-cream/80"
        >
          Rodinná chata &middot; klid přírody
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-2xl font-display text-4xl font-medium leading-tight sm:text-6xl"
        >
          Chata Vřesovice
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-xl text-lg text-cream/85"
        >
          Útočiště obklopené lesy a loukami – místo pro rodinu a přátele,
          kde čas ubíhá pomaleji. Poznejte chatu, její okolí a rezervujte si
          svůj termín.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-4 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/rezervace"
            className="flex items-center gap-2 rounded-full bg-wood-light px-6 py-3 text-sm font-semibold text-forest-dark shadow-lg transition-transform hover:scale-[1.03]"
          >
            <CalendarCheck className="h-4 w-4" />
            Rezervovat pobyt
          </Link>
          <a
            href="#o-chate"
            className="flex items-center gap-2 rounded-full border border-cream/40 px-6 py-3 text-sm font-medium text-cream/90 transition-colors hover:bg-cream/10"
          >
            Prohlédnout chatu
            <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
