"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#c98f5e", "#2f4a3c", "#8a5a3b", "#f2ede9", "#4a7059"];

/**
 * A small celebratory burst of leaf-like confetti pieces, used for the
 * reservation success moment. Pure CSS/SVG + framer-motion, no external
 * confetti library needed. Re-mount with a new `seed` to replay it.
 */
export default function Confetti({ seed }: { seed: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const r = (n: number) => Math.abs(Math.sin((seed + i) * 999 + n));
        return {
          x: (r(1) - 0.5) * 260,
          rotate: r(2) * 360,
          delay: r(3) * 0.15,
          color: COLORS[i % COLORS.length],
          size: 6 + r(4) * 6,
        };
      }),
    [seed]
  );

  return (
    <div className="pointer-events-none relative h-0 w-full overflow-visible">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: [0, -40, 60],
            rotate: p.rotate,
          }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          className="absolute left-1/2 top-0 rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
