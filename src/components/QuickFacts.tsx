"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { CalendarHeart, Users, BedDouble, MapPinned } from "lucide-react";

const FACTS = [
  { icon: CalendarHeart, value: 2025, prefix: "", suffix: "", label: "Chata je naše od roku" },
  { icon: Users, value: 10, prefix: "", suffix: "+", label: "hostů se pohodlně vejde" },
  { icon: BedDouble, value: 4, prefix: "", suffix: "", label: "ložnice k dispozici" },
  { icon: MapPinned, value: 9, prefix: "", suffix: " km", label: "od centra Kyjova" },
];

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

export default function QuickFacts() {
  return (
    <section className="bg-forest-dark py-16 text-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 sm:grid-cols-4">
        {FACTS.map(({ icon: Icon, value, prefix, suffix, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col items-center text-center"
          >
            <Icon className="h-6 w-6 text-wood-light" />
            <div className="mt-3 font-display text-3xl font-medium sm:text-4xl">
              {prefix}
              <Counter value={value} />
              {suffix}
            </div>
            <p className="mt-1 text-xs text-cream/70 sm:text-sm">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
