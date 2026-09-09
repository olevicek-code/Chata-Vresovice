"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const LEAF_COLORS = ["#c98f5e", "#8a5a3b", "#4a7059", "#2f4a3c", "#dba876"];

/**
 * A gentle page-wide flurry of falling leaves – the reward for finding the
 * hidden fox. Separate from Confetti (a small localized burst for the
 * reservation success moment); this one drifts down across the whole
 * viewport instead, then unmounts itself via onDone.
 */
export default function FallingLeaves({
  seed,
  onDone,
}: {
  seed: number;
  onDone?: () => void;
}) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const r = (n: number) => Math.abs(Math.sin((seed + i) * 999 + n));
        return {
          left: r(1) * 100,
          delay: r(2) * 1.4,
          duration: 4.5 + r(3) * 3,
          drift: (r(4) - 0.5) * 140,
          size: 12 + r(5) * 10,
          rotate: (r(6) - 0.5) * 720,
          color: LEAF_COLORS[i % LEAF_COLORS.length],
        };
      }),
    [seed]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {leaves.map((leaf, i) => (
        <motion.span
          key={i}
          initial={{ y: "-10vh", x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: "110vh",
            x: leaf.drift,
            opacity: [0, 1, 1, 0],
            rotate: leaf.rotate,
          }}
          transition={{ duration: leaf.duration, delay: leaf.delay, ease: "easeIn" }}
          onAnimationComplete={i === leaves.length - 1 ? onDone : undefined}
          className="absolute top-0"
          style={{
            left: `${leaf.left}%`,
            width: leaf.size,
            height: leaf.size * 0.75,
            backgroundColor: leaf.color,
            borderRadius: "0 70% 0 70%",
          }}
        />
      ))}
    </div>
  );
}
