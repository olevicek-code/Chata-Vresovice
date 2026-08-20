"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, CalendarCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-forest-dark text-cream">
      {/* Placeholder "photo" backdrop – swap for a real photo of the cottage */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,143,94,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(47,74,60,0.6),transparent_40%),linear-gradient(160deg,#1d2f26,#2f4a3c_55%,#3c5745)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M0 0h120v120H0z' fill='none'/%3E%3Cpath d='M20 100 L60 20 L100 100 Z' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
        }}
      />

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
