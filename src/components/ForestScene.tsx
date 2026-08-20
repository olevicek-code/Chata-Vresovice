"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Animated, interactive hero backdrop: layered illustrated forest, a warm
 * golden-hour glow, a shimmering river with reflection, drifting fireflies
 * and deer walking along the water's edge. Everything is drawn with SVG/CSS
 * (no external images needed) — swap it for a real photo later if you like.
 */

// Deterministic pseudo-random helper so the tree line looks organic but is
// stable between renders (no Math.random flashing on every re-render).
function seeded(n: number) {
  return (Math.sin(n * 12.9898) * 43758.5453) % 1;
}
function rand(seed: number, min: number, max: number) {
  const v = Math.abs(seeded(seed));
  return min + (v - Math.floor(v)) * (max - min);
}

function TreeLine({
  seedOffset,
  count,
  baseHeight,
  heightVariance,
  color,
  width = 800,
  canopyColor,
}: {
  seedOffset: number;
  count: number;
  baseHeight: number;
  heightVariance: number;
  color: string;
  canopyColor: string;
  width?: number;
}) {
  const trees = useMemo(() => {
    const spacing = width / count;
    return Array.from({ length: count }, (_, i) => {
      const cx = i * spacing + rand(seedOffset + i, -6, 6) + spacing / 2;
      const h = baseHeight + rand(seedOffset + i * 2, -heightVariance, heightVariance);
      const w = spacing * rand(seedOffset + i * 3, 0.55, 0.85);
      return { cx, h, w };
    });
  }, [seedOffset, count, baseHeight, heightVariance, width]);

  return (
    <svg
      className="absolute bottom-0 left-0 w-full"
      viewBox={`0 0 ${width} ${baseHeight + heightVariance + 20}`}
      preserveAspectRatio="none"
      height={baseHeight + heightVariance + 20}
    >
      {trees.map((t, i) => {
        const top = baseHeight + heightVariance + 20 - t.h;
        const tierH = t.h * 0.34;
        return (
          <g key={i}>
            {/* trunk sliver */}
            <rect
              x={t.cx - t.w * 0.04}
              y={top + t.h * 0.55}
              width={t.w * 0.08}
              height={t.h * 0.5}
              fill={color}
            />
            {/* three stacked conifer tiers – pointed apex, gently concave
                sides, widening toward the base for a classic pine silhouette */}
            {[0, 1, 2].map((tier) => {
              const tierTop = top + tier * tierH * 0.62;
              const tierW = t.w * (0.42 + tier * 0.32);
              const tierBottom = tierTop + tierH * 1.15;
              return (
                <path
                  key={tier}
                  d={`M${t.cx} ${tierTop}
                      Q${t.cx - tierW * 0.12} ${tierTop + tierH * 0.6}, ${t.cx - tierW / 2} ${tierBottom}
                      L${t.cx + tierW / 2} ${tierBottom}
                      Q${t.cx + tierW * 0.12} ${tierTop + tierH * 0.6}, ${t.cx} ${tierTop} Z`}
                  fill={tier === 0 ? canopyColor : color}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Deer({
  size = 1,
  top,
  duration,
  delay = 0,
  flip = false,
  tone = "#152318",
}: {
  size?: number;
  top: string;
  duration: number;
  delay?: number;
  flip?: boolean;
  tone?: string;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ top, left: 0, width: 0, height: 0 }}
      initial={{ x: "-25vw" }}
      animate={{ x: "125vw" }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <motion.svg
        viewBox="0 0 220 140"
        width={110 * size}
        height={70 * size}
        style={{
          transform: flip ? "scaleX(-1)" : undefined,
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))",
        }}
        animate={{ y: [0, -3, 0, -1.5, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <g fill={tone}>
          {/* hind leg (back) */}
          <path d="M70 96 C66 106 60 112 55 124 C58 126 63 126 65 123 C70 113 74 104 78 97 Z" />
          {/* front leg (back) */}
          <path d="M148 94 C150 105 146 113 141 125 C144 127 149 127 151 124 C156 112 158 102 157 93 Z" />
          {/* hind leg (front) */}
          <path d="M84 98 C82 109 79 116 76 126 C79 128 84 128 86 125 C90 114 92 105 93 97 Z" />
          {/* front leg (front) */}
          <path d="M162 92 C166 103 165 112 163 124 C166 126 171 126 173 123 C176 111 176 101 173 91 Z" />

          {/* tail */}
          <path d="M60 68 C52 68 47 72 45 78 C50 79 56 77 61 73 Z" />

          {/* body */}
          <path
            d="M58 78
               C46 74 40 64 44 54
               C48 45 62 40 78 41
               C96 42 112 47 124 55
               C134 50 146 46 156 47
               C164 48 168 53 166 58
               C171 59 176 62 177 67
               C177 71 172 73 166 72
               C168 78 166 84 160 87
               C165 89 168 93 166 97
               C160 99 152 96 148 91
               C138 96 122 98 108 96
               C104 100 96 101 90 98
               C78 100 66 97 58 90
               C52 88 50 83 58 78 Z"
          />

          {/* neck + head, held slightly low as if grazing/walking */}
          <path
            d="M150 55
               C158 46 166 36 172 27
               C174 24 178 23 180 26
               C182 29 180 33 177 36
               C182 35 187 37 188 41
               C189 45 185 48 180 47
               C183 51 182 56 178 58
               C173 61 168 59 166 55
               C161 61 155 63 150 60 Z"
          />

          {/* muzzle */}
          <path d="M178 26 C183 22 189 21 193 24 C195 27 192 31 187 32 C183 33 179 30 178 26 Z" />

          {/* ear */}
          <path d="M166 30 C170 24 176 22 180 25 C177 30 172 32 166 30 Z" />

          {/* antlers – a few elegant branching tines */}
          <path
            d="M181 22 C180 12 176 4 170 -2 M181 22 C184 12 189 6 196 3
               M183 15 C187 10 192 8 197 9 M178 16 C174 10 168 7 162 8"
            stroke={tone}
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
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
      className="absolute h-1.5 w-1.5 rounded-full bg-wood-light shadow-[0_0_6px_2px_rgba(201,143,94,0.8)]"
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
  const treeShiftFar = useSpring(useTransform(mx, [-1, 1], [8, -8]), {
    stiffness: 40,
    damping: 20,
  });
  const treeShiftMid = useSpring(useTransform(mx, [-1, 1], [16, -16]), {
    stiffness: 40,
    damping: 20,
  });
  const treeShiftNear = useSpring(useTransform(mx, [-1, 1], [26, -26]), {
    stiffness: 40,
    damping: 20,
  });

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* sky */}
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#162720_0%,#26402f_45%,#3d5a41_78%,#5c7a4e_100%)]" />

      {/* warm golden-hour glow near the horizon */}
      <div className="absolute inset-x-0 bottom-[18%] h-[45%] bg-[radial-gradient(60%_100%_at_72%_100%,rgba(230,168,101,0.35),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-[18%] h-[45%] bg-[radial-gradient(40%_80%_at_18%_100%,rgba(201,143,94,0.2),transparent_70%)]" />

      {/* far, softly blurred tree line */}
      <motion.div
        style={{ x: reduceMotion ? 0 : treeShiftFar }}
        className="absolute bottom-[30%] left-[-5%] w-[130%] opacity-70 blur-[1.5px]"
      >
        <TreeLine
          seedOffset={1}
          count={16}
          baseHeight={90}
          heightVariance={22}
          color="#33503d"
          canopyColor="#3c5c44"
        />
      </motion.div>

      {/* soft mist band between layers for depth */}
      <div className="absolute inset-x-0 bottom-[27%] h-16 bg-gradient-to-t from-transparent via-cream/10 to-transparent blur-md" />

      {/* mid tree line */}
      <motion.div
        style={{ x: reduceMotion ? 0 : treeShiftMid }}
        className="absolute bottom-[23%] left-[-5%] w-[130%] opacity-90"
      >
        <TreeLine
          seedOffset={41}
          count={13}
          baseHeight={130}
          heightVariance={28}
          color="#213827"
          canopyColor="#294331"
        />
      </motion.div>

      {/* fireflies drifting between the trees */}
      {!reduceMotion &&
        Array.from({ length: 9 }).map((_, i) => <Firefly key={i} index={i} />)}

      {/* near, darker tree line framing the bottom of the scene */}
      <motion.div
        style={{ x: reduceMotion ? 0 : treeShiftNear }}
        className="absolute bottom-[15%] left-[-5%] w-[130%]"
      >
        <TreeLine
          seedOffset={97}
          count={9}
          baseHeight={170}
          heightVariance={40}
          color="#132119"
          canopyColor="#182b1e"
        />
      </motion.div>

      {/* deer walking along the clearing at the water's edge, in front of
          the near tree line so they stay clearly visible */}
      {!reduceMotion && (
        <>
          <Deer top="71%" duration={30} size={1.4} />
          <Deer top="76%" duration={38} size={0.85} delay={7} flip tone="#1c2c1f" />
        </>
      )}

      {/* water, with a soft mirrored reflection of the tree line + shimmer */}
      <div className="absolute inset-x-0 bottom-0 h-[17%] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0f1c15,#081310)]" />
        <div className="absolute inset-x-0 top-0 h-full scale-y-[-1] opacity-25 blur-[2px]">
          <TreeLine
            seedOffset={97}
            count={9}
            baseHeight={60}
            heightVariance={14}
            color="#132119"
            canopyColor="#182b1e"
          />
        </div>
        <motion.div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg, rgba(230,168,101,0.3) 0px, rgba(230,168,101,0.3) 2px, transparent 2px, transparent 40px)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPositionX: ["0%", "100%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* soft vignette so foreground text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0),rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
