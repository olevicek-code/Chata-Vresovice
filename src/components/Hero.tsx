"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowDown, CalendarCheck, ChevronDown } from "lucide-react";
import ForestScene from "./ForestScene";
import MagneticButton from "./MagneticButton";
import TechHud from "./TechHud";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-forest-dark text-cream">
      {/* Animated forest + river backdrop with deer walking by the water.
          No photo needed – swap for a real photo later if you prefer. */}
      <ForestScene />

      {/* soft drifting aurora glow behind the headline – ties the "signal"
          accent into the hero without touching the forest illustration */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-signal/25 blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, 40, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-wood-light/20 blur-[100px]"
        animate={{ x: [0, -30, 0], y: [0, -25, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-32"
      >
        <motion.span
          variants={item}
          className="rounded-full border border-cream/30 px-4 py-1 text-xs font-medium uppercase tracking-widest text-cream/80"
        >
          Rodinná chata &middot; klid přírody
        </motion.span>

        <motion.h1
          variants={item}
          className="max-w-2xl font-display text-4xl font-medium leading-tight sm:text-6xl"
        >
          Chata Vřesovice
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg text-cream/85">
          Útočiště obklopené lesy a loukami – místo pro rodinu a přátele,
          kde čas ubíhá pomaleji. Poznejte chatu, její okolí a rezervujte si
          svůj termín.
        </motion.p>

        <motion.div variants={item} className="mt-4 flex flex-wrap items-center gap-4">
          <MagneticButton>
            <Link
              href="/rezervace"
              className="flex items-center gap-2 rounded-full bg-wood-light px-6 py-3 text-sm font-semibold text-forest-dark shadow-lg"
            >
              <CalendarCheck className="h-4 w-4" />
              Rezervovat pobyt
            </Link>
          </MagneticButton>
          <MagneticButton strength={0.25}>
            <a
              href="#o-chate"
              className="flex items-center gap-2 rounded-full border border-cream/40 px-6 py-3 text-sm font-medium text-cream/90 transition-colors hover:bg-cream/10"
            >
              Prohlédnout chatu
              <ArrowDown className="h-4 w-4" />
            </a>
          </MagneticButton>
        </motion.div>

        <motion.div variants={item} className="mt-4">
          <TechHud />
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute inset-x-0 bottom-6 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-cream/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
