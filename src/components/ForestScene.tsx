"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Animated, interactive hero backdrop: a panoramic Chřiby hillside sinking
 * into haze, layered forest with swaying canopies, drifting fog, a
 * shimmering river, and wildlife (deer, fox, hare, wild boar, birds)
 * wandering through irregularly. Everything is drawn with SVG/CSS (no
 * external images needed) — swap it for real photography/video later if
 * you like.
 */

// Deterministic pseudo-random helper so every "organic" shape/timing looks
// varied but is stable between renders and identical on server + client
// (no Math.random – that would cause a hydration mismatch).
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

/** Wide, gently rolling ridge line (the Chřiby hills), smoothed through a
 * handful of seeded control points so it reads as a real skyline rather
 * than a repeating pattern. */
function HillRidge({
  seedOffset,
  baseline,
  amplitude,
  color,
  opacity,
}: {
  seedOffset: number;
  baseline: number;
  amplitude: number;
  color: string;
  opacity: number;
}) {
  const d = useMemo(() => {
    const segments = 7;
    const points = Array.from({ length: segments + 1 }, (_, i) => {
      const x = (i / segments) * 1000;
      const y = baseline + rand(seedOffset + i, -amplitude, amplitude);
      return { x, y };
    });
    let path = `M0 ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      path += ` Q${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    const last = points[points.length - 1];
    path += ` L1000 ${last.y.toFixed(1)} L1000 220 L0 220 Z`;
    return path;
  }, [seedOffset, baseline, amplitude]);

  return <path d={d} fill={color} opacity={opacity} />;
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

type Direction = "ltr" | "rtl";

function Deer({
  size = 1,
  top,
  duration,
  delay = 0,
  direction = "ltr",
  tone = "#152318",
  antlers = true,
}: {
  size?: number;
  top: string;
  duration: number;
  delay?: number;
  direction?: Direction;
  tone?: string;
  antlers?: boolean;
}) {
  const rtl = direction === "rtl";
  return (
    <motion.div
      className="absolute"
      style={{ top, left: 0, width: 0, height: 0 }}
      initial={{ x: rtl ? "125vw" : "-25vw" }}
      animate={{ x: rtl ? "-25vw" : "125vw" }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <motion.svg
        viewBox="0 0 220 140"
        width={110 * size}
        height={70 * size}
        style={{
          transform: rtl ? "scaleX(-1)" : undefined,
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
  direction = "ltr",
  tone = "#3a2113",
  diagonal = false,
}: {
  size?: number;
  top: string;
  duration: number;
  delay?: number;
  direction?: Direction;
  tone?: string;
  /** adds a slow diagonal drift, as if trotting deeper into the woods
   * rather than tracking a flat horizontal line */
  diagonal?: boolean;
}) {
  const rtl = direction === "rtl";
  return (
    <motion.div
      className="absolute"
      style={{ top, left: 0, width: 0, height: 0 }}
      initial={{ x: rtl ? "120vw" : "-20vw", y: 0, scale: 1 }}
      animate={{
        x: rtl ? "-20vw" : "120vw",
        y: diagonal ? [0, -22, -10] : 0,
        scale: diagonal ? [1, 0.82, 0.9] : 1,
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <motion.svg
        viewBox="0 0 160 100"
        width={96 * size}
        height={60 * size}
        style={{
          transform: rtl ? "scaleX(-1)" : undefined,
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

/** Zajíc – small, fast, low-detail silhouette; at this size and speed a
 * single running blob with a hop reads better than articulated legs. */
function Hare({
  size = 1,
  top,
  duration,
  delay = 0,
  direction = "ltr",
  tone = "#2a2018",
}: {
  size?: number;
  top: string;
  duration: number;
  delay?: number;
  direction?: Direction;
  tone?: string;
}) {
  const rtl = direction === "rtl";
  return (
    <motion.div
      className="absolute"
      style={{ top, left: 0, width: 0, height: 0 }}
      initial={{ x: rtl ? "115vw" : "-15vw" }}
      animate={{ x: rtl ? "-15vw" : "115vw" }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg
        viewBox="0 0 90 60"
        width={46 * size}
        height={30 * size}
        style={{
          transform: rtl ? "scaleX(-1)" : undefined,
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.25))",
        }}
        animate={{ y: [0, -9, 0], scaleY: [1, 0.88, 1] }}
        transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <path
          fill={tone}
          d="M15 40 C8 38 5 30 10 24 C16 18 28 17 38 21
             C40 12 44 4 50 2 C49 9 48 15 50 20
             C52 12 57 5 63 4 C61 11 59 17 58 22
             C68 20 78 24 83 30 C79 27 74 27 71 30
             C74 33 73 38 67 40 C52 45 30 45 15 40 Z"
        />
      </motion.svg>
    </motion.div>
  );
}

/** Divočák – stocky, low, glimpsed only briefly between the trees rather
 * than crossing the whole clearing. */
function Boar({
  size = 1,
  top,
  duration,
  delay = 0,
  direction = "ltr",
  tone = "#241c16",
}: {
  size?: number;
  top: string;
  duration: number;
  delay?: number;
  direction?: Direction;
  tone?: string;
}) {
  const rtl = direction === "rtl";
  return (
    <motion.div
      className="absolute"
      style={{ top, left: 0, width: 0, height: 0 }}
      initial={{ x: rtl ? "62vw" : "30vw", opacity: 0 }}
      animate={{ x: rtl ? "28vw" : "64vw", opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.svg
        viewBox="0 0 140 90"
        width={72 * size}
        height={46 * size}
        style={{
          transform: rtl ? "scaleX(-1)" : undefined,
          filter: "drop-shadow(0 5px 8px rgba(0,0,0,0.3))",
        }}
        animate={{ y: [0, -2, 0, -1, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <g fill={tone}>
          <path d={legPath(34, 60, 11, 32, 74, 7, 30, 84, 6)} />
          <path d={legPath(52, 62, 10, 52, 76, 6.5, 50, 84, 6)} />
          <path d={legPath(90, 58, 11, 94, 74, 7, 98, 84, 6)} />
          <path d={legPath(106, 56, 10, 110, 72, 6.5, 114, 84, 6)} />

          {/* stocky rounded body with a slightly bristled back ridge */}
          <path
            d="M18 58 C10 55 8 46 14 40 C20 34 34 30 50 30
               C48 24 54 18 64 16 C70 15 78 17 82 22
               C88 20 96 22 100 28 C106 26 112 28 114 34
               C110 36 106 36 104 34 C106 40 102 46 94 48
               C80 54 50 56 18 58 Z"
          />
          {/* pointed snout */}
          <path d="M12 44 C6 43 2 40 1 36 C5 35 10 37 13 41 Z" />
          {/* small alert ear */}
          <path d="M56 22 C56 16 60 12 66 11 C64 16 61 20 56 22 Z" />
        </g>
      </motion.svg>
    </motion.div>
  );
}

/** Minimal flapping bird mark, crossing high above the tree line. */
function Bird({
  top,
  duration,
  delay = 0,
  direction = "ltr",
  size = 1,
  tone = "rgba(20, 26, 20, 0.55)",
}: {
  top: string;
  duration: number;
  delay?: number;
  direction?: Direction;
  size?: number;
  tone?: string;
}) {
  const rtl = direction === "rtl";
  return (
    <motion.div
      className="absolute"
      style={{ top, left: 0, width: 0, height: 0 }}
      initial={{ x: rtl ? "110vw" : "-10vw" }}
      animate={{ x: rtl ? "-10vw" : "110vw", y: [0, -10, 0, 8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <motion.svg
        viewBox="0 0 40 16"
        width={26 * size}
        height={11 * size}
        style={{ transform: rtl ? "scaleX(-1)" : undefined }}
        animate={{ scaleY: [1, 0.35, 1] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <path
          d="M0 10 Q10 0 20 10 Q30 0 40 10"
          stroke={tone}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
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

/** Soft, slow-drifting mist patch used between the tree layers. */
function FogPatch({
  top,
  width,
  duration,
  delay,
  opacity = 1,
}: {
  top: string;
  width: number;
  duration: number;
  delay: number;
  opacity?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-[50%] blur-2xl"
      style={{
        top,
        width,
        height: width * 0.28,
        opacity,
        background:
          "radial-gradient(closest-side, rgba(245,242,232,0.55), rgba(245,242,232,0) 75%)",
      }}
      initial={{ x: "-30%" }}
      animate={{ x: "130%" }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** Thin foreground grass blades that sway in the wind and lead the
 * parallax (closest layer moves the most). */
function GrassField() {
  const blades = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const x = (i / 46) * 100 + rand(400 + i, -0.6, 0.6);
        const h = rand(420 + i, 9, 20);
        const w = rand(440 + i, 1.3, 2.6);
        return { x, h, w };
      }),
    []
  );

  return (
    <svg
      className="absolute bottom-0 left-0 w-full"
      viewBox="0 0 100 22"
      preserveAspectRatio="none"
      height={44}
      aria-hidden
    >
      {blades.map((b, i) => (
        <path
          key={i}
          d={`M${b.x} 22 Q${b.x - b.w} ${22 - b.h * 0.55} ${b.x - b.w * 0.2} ${22 - b.h}
              Q${b.x + b.w * 0.3} ${22 - b.h * 0.55} ${b.x} 22 Z`}
          fill="#0f1c14"
          opacity={0.85}
        />
      ))}
    </svg>
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

  // subtle device-tilt parallax on phones, on top of the mouse-driven one
  // above – both just push the same motion values, so whichever input is
  // actually available on the device wins.
  useEffect(() => {
    if (reduceMotion || typeof window === "undefined") return;
    if (!window.DeviceOrientationEvent) return;

    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      mx.set(Math.max(-1, Math.min(1, e.gamma / 25)));
      my.set(Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, [reduceMotion, mx, my]);

  const spring = { stiffness: 40, damping: 20 };
  const hillShift = useSpring(useTransform(mx, [-1, 1], [2, -2]), spring);
  const farShift = useSpring(useTransform(mx, [-1, 1], [8, -8]), spring);
  const farShiftY = useSpring(useTransform(my, [-1, 1], [2, -2]), spring);
  const midShift = useSpring(useTransform(mx, [-1, 1], [16, -16]), spring);
  const midShiftY = useSpring(useTransform(my, [-1, 1], [4, -4]), spring);
  const nearShift = useSpring(useTransform(mx, [-1, 1], [26, -26]), spring);
  const nearShiftY = useSpring(useTransform(my, [-1, 1], [6, -6]), spring);
  const grassShift = useSpring(useTransform(mx, [-1, 1], [40, -40]), spring);
  const grassShiftY = useSpring(useTransform(my, [-1, 1], [10, -10]), spring);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const swaySlow = reduceMotion
    ? { rotate: 0 }
    : { rotate: [-0.5, 0.5, -0.5] };
  const swayMed = reduceMotion
    ? { rotate: 0 }
    : { rotate: [-0.8, 0.8, -0.8] };
  const swayFast = reduceMotion
    ? { skewX: 0 }
    : { skewX: [-1.4, 1.4, -1.4] };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* sky – warm early-morning/evening light */}
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#162720_0%,#26402f_45%,#3d5a41_78%,#5c7a4e_100%)]" />

      {/* warm golden-hour glow near the horizon */}
      <div className="absolute inset-x-0 bottom-[18%] h-[45%] bg-[radial-gradient(60%_100%_at_72%_100%,rgba(230,168,101,0.35),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-[18%] h-[45%] bg-[radial-gradient(40%_80%_at_18%_100%,rgba(201,143,94,0.2),transparent_70%)]" />

      {/* very subtle dappled-light flicker, as if sun is filtering through
          moving branches */}
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 45% at 65% 28%, rgba(255,238,204,0.16), transparent 70%)",
          }}
          animate={{ opacity: [0.5, 1, 0.6, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* panoramic Chřiby hillside, sinking into atmospheric haze behind
          the forest */}
      <motion.div
        style={{ x: reduceMotion ? 0 : hillShift }}
        className="absolute bottom-[38%] left-[-5%] w-[130%] opacity-80"
      >
        <svg
          className="w-full"
          viewBox="0 0 1000 220"
          preserveAspectRatio="none"
          height={130}
        >
          <HillRidge seedOffset={5} baseline={70} amplitude={26} color="#5e7768" opacity={0.4} />
          <HillRidge seedOffset={19} baseline={110} amplitude={30} color="#4c6456" opacity={0.55} />
        </svg>
        {/* haze eating into the base of the hills for depth */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-transparent via-[#cfd8c8]/25 to-transparent" />
      </motion.div>

      {/* far, softly blurred tree line */}
      <motion.div
        style={{ x: reduceMotion ? 0 : farShift, y: reduceMotion ? 0 : farShiftY }}
        animate={swaySlow}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[30%] left-[-5%] w-[130%] origin-bottom opacity-70 blur-[1.5px]"
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

      {/* drifting fog between the layers */}
      {!reduceMotion && (
        <>
          <FogPatch top="24%" width={340} duration={52} delay={0} opacity={0.5} />
          <FogPatch top="33%" width={260} duration={68} delay={14} opacity={0.4} />
          <FogPatch top="20%" width={220} duration={60} delay={30} opacity={0.35} />
        </>
      )}

      {/* soft mist band between layers for depth */}
      <div className="absolute inset-x-0 bottom-[27%] h-16 bg-gradient-to-t from-transparent via-cream/10 to-transparent blur-md" />

      {/* mid tree line */}
      <motion.div
        style={{ x: reduceMotion ? 0 : midShift, y: reduceMotion ? 0 : midShiftY }}
        animate={swayMed}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[23%] left-[-5%] w-[130%] origin-bottom opacity-90"
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

      {/* birds crossing high above the canopy */}
      {!reduceMotion && (
        <>
          <Bird top="14%" duration={16} delay={4} direction="ltr" size={1} />
          <Bird top="21%" duration={20} delay={24} direction="rtl" size={0.8} />
        </>
      )}

      {/* fireflies drifting between the trees */}
      {!reduceMotion &&
        Array.from({ length: 9 }).map((_, i) => <Firefly key={i} index={i} />)}

      {/* near, darker tree line framing the bottom of the scene */}
      <motion.div
        style={{ x: reduceMotion ? 0 : nearShift, y: reduceMotion ? 0 : nearShiftY }}
        animate={swayMed}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[15%] left-[-5%] w-[130%] origin-bottom"
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

      {/* wildlife wandering along the clearing at the water's edge – each
          species has its own out-of-sync cycle length, so the mix of who's
          visible keeps drifting instead of repeating the same way twice,
          while staying to two or three animals on screen at once */}
      {!reduceMotion && (
        <>
          {/* jelen (stag), with antlers */}
          <Deer top="70%" duration={34} delay={0} size={1.4} />
          {/* divočák, glimpsed only briefly between the trees */}
          <Boar top="79%" duration={9} delay={8} direction="ltr" size={1} />
          {/* liška (fox), trotting past and drifting deeper into the woods */}
          <Fox top="74%" duration={20} delay={20} direction="ltr" size={1} diagonal />
          {/* srna (doe) with srnče (fawn) close behind, walking the other way */}
          <Deer
            top="76%"
            duration={40}
            delay={38}
            size={0.85}
            direction="rtl"
            tone="#1c2c1f"
            antlers={false}
          />
          <Deer
            top="77.5%"
            duration={40}
            delay={38.6}
            size={0.48}
            direction="rtl"
            tone="#22331f"
            antlers={false}
          />
          {/* zajíc, a quick dash across the clearing */}
          <Hare top="82%" duration={7} delay={55} direction="rtl" size={1} />
        </>
      )}

      {/* foreground grass, swaying and leading the parallax */}
      <motion.div
        style={{ x: reduceMotion ? 0 : grassShift, y: reduceMotion ? 0 : grassShiftY }}
        animate={swayFast}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 bottom-0 origin-bottom"
      >
        <GrassField />
      </motion.div>

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
