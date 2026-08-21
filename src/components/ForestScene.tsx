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

// Builds one smoothly-tapered, gently bent leg silhouette (hip → knee →
// hoof) using rounded quadratic curves instead of straight segments, so legs
// read as an organic limb rather than a sharp-edged polygon.
function legPath(
  topX: number,
  topY: number,
  topW: number,
  kneeX: number,
  kneeY: number,
  kneeW: number,
  hoofX: number,
  hoofY: number,
  hoofW: number
) {
  const midTop = (topY + kneeY) / 2;
  const midBottom = (kneeY + hoofY) / 2;
  return `M${topX - topW / 2} ${topY}
    Q${topX - topW / 2 - 2} ${midTop} ${kneeX - kneeW / 2} ${kneeY}
    Q${kneeX - kneeW / 2 - 1} ${midBottom} ${hoofX - hoofW / 2} ${hoofY}
    L${hoofX + hoofW / 2} ${hoofY}
    Q${kneeX + kneeW / 2 + 1} ${midBottom} ${kneeX + kneeW / 2} ${kneeY}
    Q${topX + topW / 2 + 2} ${midTop} ${topX + topW / 2} ${topY}
    Z`;
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
  antlers = true,
}: {
  size?: number;
  top: string;
  duration: number;
  delay?: number;
  flip?: boolean;
  tone?: string;
  antlers?: boolean;
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
          {/* four legs – smoothly tapered from hip to hoof with a gentle
              bend at the knee/hock, overlapping generously into the body */}
          <path d={legPath(68, 80, 13, 63, 104, 7, 61, 128, 5)} />
          <path d={legPath(88, 84, 12, 87, 106, 6.5, 84, 128, 5)} />
          <path d={legPath(138, 78, 12, 142, 104, 6.5, 146, 128, 5)} />
          <path d={legPath(158, 75, 12, 165, 102, 6.5, 171, 128, 5)} />

          {/* smooth, simplified body – a single clean silhouette reads far
              more naturally than many small overlapping bumps */}
          <path
            d="M52 82
               C40 79 34 68 39 58
               C45 47 63 41 86 41
               C112 41 136 47 150 58
               C154 61 154 66 148 68
               C152 71 153 76 148 80
               C136 87 108 90 82 89
               C68 89 58 87 52 82 Z"
          />

          {/* neck + head, overlapping deep into the shoulder so it reads as
              one continuous animal rather than a glued-on piece */}
          <path
            d="M118 60
               C128 48 142 34 158 24
               C162 21 168 21 170 25
               C172 29 169 33 165 36
               C170 36 174 40 173 44
               C172 48 167 50 162 48
               C164 53 162 58 156 60
               C148 63 140 60 134 54
               C127 60 122 63 118 60 Z"
          />

          {/* muzzle */}
          <path d="M160 25 C167 20 176 19 181 23 C183 27 179 31 173 32 C167 33 162 29 160 25 Z" />

          {/* ear */}
          <path d="M144 29 C147 20 155 15 163 16 C159 23 152 28 144 29 Z" />

          {/* short white-tipped tail flag at the rump */}
          <path d="M46 60 C38 58 32 61 30 67 C36 69 43 67 48 62 Z" />

          {/* antlers – a few elegant branching tines (bucks only; does go
              without, which also reads correctly for a roe deer/srnka) */}
          {antlers && (
            <path
              d="M166 20 C165 9 160 0 152 -7 M166 20 C170 9 177 2 186 -2
                 M168 12 C173 6 180 3 186 4 M162 13 C157 6 149 3 142 4"
              stroke={tone}
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>
      </motion.svg>
    </motion.div>
  );
}

function Fox({
  size = 1,
  top,
  duration,
  delay = 0,
  flip = false,
  tone = "#3a2113",
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
      initial={{ x: "-20vw" }}
      animate={{ x: "120vw" }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <motion.svg
        viewBox="0 0 160 100"
        width={96 * size}
        height={60 * size}
        style={{
          transform: flip ? "scaleX(-1)" : undefined,
          filter: "drop-shadow(0 5px 8px rgba(0,0,0,0.25))",
        }}
        animate={{ y: [0, -4, 0, -2, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <g fill={tone}>
          {/* four legs, smoothly tapered with a gentle knee bend rather
              than sharp polygon corners, overlapping up into the body */}
          <path d={legPath(44, 57, 10, 41, 72, 5.5, 39, 90, 4)} />
          <path d={legPath(57, 61, 9, 55, 74, 5, 53, 90, 4)} />
          <path d={legPath(101, 53, 10, 106, 70, 5.5, 110, 89, 4)} />
          <path d={legPath(115, 51, 10, 121, 68, 5.5, 126, 88, 4)} />

          {/* smooth, simplified low-slung body */}
          <path
            d="M30 55
               C21 53 15 47 17 40
               C19 33 30 30 44 31
               C60 32 76 37 90 45
               C97 41 105 40 111 42
               C115 44 115 49 110 51
               C115 53 116 57 111 60
               C101 65 82 65 65 61
               C52 64 40 63 30 55 Z"
          />

          {/* head + pointed snout, overlapping deep into the body */}
          <path
            d="M84 44
               C95 37 106 31 117 27
               C121 25 126 27 125 31
               C124 35 119 37 114 38
               C118 39 120 43 117 46
               C113 50 106 49 101 45
               C95 49 89 47 84 44 Z"
          />

          {/* pointed ear */}
          <path d="M104 30 C106 22 113 16 121 16 C118 23 112 28 104 30 Z" />

          {/* bushy tail, curling up behind and overlapping into the rump */}
          <path d="M38 52 C22 51 9 43 8 30 C7 21 14 14 23 15 C18 24 20 35 28 43 C32 47 35 50 38 52 Z" />

          {/* lighter belly/chest marking, typical of a red fox */}
          <path
            d="M34 50 C43 54 54 56 64 54 C59 58 48 58 39 56 C36 55 34 53 34 50 Z"
            fill="#c98f5e"
            fillOpacity={0.4}
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
          {/* stag, with antlers */}
          <Deer top="71%" duration={30} size={1.4} />
          {/* srnka (doe) – same silhouette, no antlers, walking the other way */}
          <Deer top="76%" duration={38} size={0.85} delay={7} flip tone="#1c2c1f" antlers={false} />
          {/* liška (fox), trotting past a little quicker than the deer */}
          <Fox top="74%" duration={21} size={1} delay={3} />
          <Fox top="78%" duration={26} size={0.7} delay={16} flip tone="#2e1a0e" />
        </>
      )}

      {/* a calm stream along the bottom edge – soft-edged (no hard band),
          a believable teal-blue so it reads as water rather than a stripe
          of forest-green, with a blurred tree reflection and gentle ripples
          instead of a hard animated diagonal pattern */}
      <div
        className="absolute inset-x-0 bottom-0 h-[16%] overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 35%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 35%)",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#173229,#0c1f22_55%,#081619)]" />
        <div className="absolute inset-x-0 top-0 h-full scale-y-[-1] opacity-20 blur-[3px]">
          <TreeLine
            seedOffset={97}
            count={9}
            baseHeight={60}
            heightVariance={14}
            color="#132119"
            canopyColor="#182b1e"
          />
        </div>
        {/* gentle, slow-drifting ripples – soft curved highlights rather
            than a hard repeating pattern */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full opacity-40"
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
          height="100%"
        >
          {[14, 28, 44].map((y, i) => (
            <motion.path
              key={y}
              d={`M-50 ${y} Q0 ${y - 4} 50 ${y} T150 ${y} T250 ${y} T350 ${y} T450 ${y}`}
              stroke="rgba(201,201,168,0.35)"
              strokeWidth="1.4"
              fill="none"
              initial={{ x: 0 }}
              animate={{ x: [-80, 0] }}
              transition={{
                duration: 10 + i * 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </svg>
        {/* soft warm sun-glint drifting across the water */}
        <motion.div
          className="absolute inset-y-0 w-1/3 opacity-30 blur-md"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(230,168,101,0.5), transparent)",
          }}
          animate={{ x: ["-40%", "140%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* soft vignette so foreground text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0),rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
