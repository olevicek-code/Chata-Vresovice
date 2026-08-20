"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Animated, interactive hero backdrop: layered forest silhouettes, a shimmering
 * river, fireflies and a couple of deer walking along the water's edge.
 * Everything here is drawn with SVG/CSS (no external images), so it needs no
 * photos to look alive — swap it for a real photo later if you prefer.
 */

function Deer({
  size = 1,
  top,
  duration,
  delay = 0,
  flip = false,
}: {
  size?: number;
  top: string;
  duration: number;
  delay?: number;
  flip?: boolean;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ top, left: 0, width: 0, height: 0 }}
      initial={{ x: "-15vw" }}
      animate={{ x: "115vw" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.svg
        viewBox="0 0 64 40"
        width={64 * size}
        height={40 * size}
        style={{ transform: flip ? "scaleX(-1)" : undefined }}
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <g fill="#14231a" fillOpacity={0.85}>
          {/* body */}
          <ellipse cx="30" cy="22" rx="14" ry="7" />
          {/* neck + head */}
          <path d="M41 18 L47 8 L50 9 L46 19 Z" />
          <circle cx="49" cy="8" r="2.6" />
          {/* antlers */}
          <path
            d="M48 6 L45 1 M48 6 L51 1 M50 6 L53 2"
            stroke="#14231a"
            strokeWidth="1"
            fill="none"
          />
          {/* legs (simple walk pose) */}
          <path d="M20 27 L18 37 M26 28 L25 38 M34 28 L36 38 M40 27 L42 37" stroke="#14231a" strokeWidth="2.4" strokeLinecap="round" />
          {/* tail */}
          <path d="M17 19 L13 21" stroke="#14231a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </motion.svg>
    </motion.div>
  );
}

function Firefly({ index }: { index: number }) {
  const seed = useMemo(() => {
    const r = (n: number) => (Math.sin(index * 999 + n) + 1) / 2;
    return {
      left: `${5 + r(1) * 90}%`,
      top: `${45 + r(2) * 40}%`,
      dur: 3 + r(3) * 4,
      delay: r(4) * 4,
    };
  }, [index]);

  return (
    <motion.span
      className="absolute h-1.5 w-1.5 rounded-full bg-wood-light"
      style={{ left: seed.left, top: seed.top }}
      animate={{ opacity: [0, 0.9, 0], y: [0, -14, 0] }}
      transition={{
        duration: seed.dur,
        delay: seed.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function ForestScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const treeShiftFar = useSpring(useTransform(mx, [-1, 1], [6, -6]), {
    stiffness: 40,
    damping: 20,
  });
  const treeShiftNear = useSpring(useTransform(mx, [-1, 1], [14, -14]), {
    stiffness: 40,
    damping: 20,
  });

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* sky */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#1d2f26,#2f4a3c_55%,#3c5745)]" />

      {/* distant tree line */}
      <motion.svg
        style={{ x: reduceMotion ? 0 : treeShiftFar }}
        className="absolute bottom-[22%] left-0 w-[110%] opacity-60"
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
        height="120"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M${i * 60} 120 L${i * 60 + 20} 40 L${i * 60 + 40} 120 Z`}
            fill="#243b30"
          />
        ))}
      </motion.svg>

      {/* nearer tree line */}
      <motion.svg
        style={{ x: reduceMotion ? 0 : treeShiftNear }}
        className="absolute bottom-[18%] left-0 w-[115%] opacity-90"
        viewBox="0 0 800 160"
        preserveAspectRatio="none"
        height="160"
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <path
            key={i}
            d={`M${i * 78} 160 L${i * 78 + 26} 30 L${i * 78 + 52} 160 Z`}
            fill="#1a2c22"
          />
        ))}
      </motion.svg>

      {/* fireflies */}
      {!reduceMotion &&
        Array.from({ length: 8 }).map((_, i) => <Firefly key={i} index={i} />)}

      {/* deer walking along the tree line */}
      {!reduceMotion && (
        <>
          <Deer top="66%" duration={26} size={1} />
          <Deer top="70%" duration={32} size={0.7} delay={4} flip />
        </>
      )}

      {/* water */}
      <div className="absolute inset-x-0 bottom-0 h-[18%] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#12211a,#0b1712)]" />
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg, rgba(201,143,94,0.25) 0px, rgba(201,143,94,0.25) 2px, transparent 2px, transparent 40px)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPositionX: ["0%", "100%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* soft vignette so foreground text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,0,0,0),rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}
