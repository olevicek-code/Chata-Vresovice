"use client";

/**
 * Real-footage hero backdrop: a looping, cross-fading sequence of free
 * stock video clips (misty forested hills, a grazing doe, a fawn, birds
 * over the treeline) instead of drawn silhouettes, so the wildlife
 * actually reads as wildlife. A slow "Ken Burns" zoom keeps each clip from
 * feeling static, and everything sits under a warm color-grade + vignette
 * so the palette stays consistent across clips and the foreground text
 * stays legible.
 *
 * The two <video> elements are a manual cross-fade double-buffer, driven
 * entirely inside one mount effect (not React state) – this is frame-by-
 * frame media choreography, which React's render cycle isn't a good fit
 * for and only adds room for stale-closure bugs.
 *
 * Footage (Pexels License – free for commercial use, no attribution
 * required): pexels.com/video/15070555, /8553227, /9422693, /28588755
 */

import { useEffect, useRef, useState } from "react";

const SOURCES = {
  hills: "/videos/hills.mp4",
  deer: "/videos/deer.mp4",
  fawn: "/videos/fawn.mp4",
  birds: "/videos/birds.mp4",
} as const;

// The landscape anchors the scene; wildlife is a brief cutaway between
// returns to it, so the panorama stays the dominant, calming element.
const PLAYLIST: (keyof typeof SOURCES)[] = [
  "hills",
  "deer",
  "hills",
  "fawn",
  "hills",
  "birds",
];

export default function VideoScene() {
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    a.src = SOURCES[PLAYLIST[0]];

    if (reduceMotion) {
      // still show a real frame of the landscape, just frozen
      a.currentTime = 1;
      return;
    }

    a.play().catch(() => {});

    let step = 0;
    let front = a;
    let back = b;
    let cancelled = false;

    const showNext = () => {
      if (cancelled) return;
      step = (step + 1) % PLAYLIST.length;
      back.src = SOURCES[PLAYLIST[step]];
      back.currentTime = 0;
      back.play().catch(() => {});
      back.style.opacity = "1";
      front.style.opacity = "0";
      front.removeEventListener("ended", showNext);
      back.addEventListener("ended", showNext);
      [front, back] = [back, front];
    };

    a.addEventListener("ended", showNext);

    return () => {
      cancelled = true;
      a.removeEventListener("ended", showNext);
      b.removeEventListener("ended", showNext);
    };
  }, [reduceMotion]);

  const kenBurns = (delay: number) =>
    reduceMotion
      ? undefined
      : `ken-burns 24s ease-in-out ${delay}s infinite alternate`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-forest-dark">
      <video
        ref={aRef}
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out"
        style={{ opacity: 1, animation: kenBurns(0) }}
      />
      <video
        ref={bRef}
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out"
        style={{ opacity: 0, animation: kenBurns(0.4) }}
      />

      {/* warm color-grade so every clip reads as the same golden-hour
          palette, plus a bottom-weighted darkening for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/85 via-forest-dark/20 to-forest-dark/45 mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(60%_100%_at_72%_100%,rgba(230,168,101,0.3),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0),rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
