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
 * Footage (Pexels License – free for commercial use, no attribution
 * required): pexels.com/video/15070555, /8553227, /9422693, /28588755
 */

import { useCallback, useEffect, useRef, useState } from "react";

const SOURCES: Record<string, string> = {
  hills: "/videos/hills.mp4",
  deer: "/videos/deer.mp4",
  fawn: "/videos/fawn.mp4",
  birds: "/videos/birds.mp4",
};

// The landscape anchors the scene; wildlife is a brief cutaway between
// returns to it, so the panorama stays the dominant, calming element.
const PLAYLIST = ["hills", "deer", "hills", "fawn", "hills", "birds"] as const;

export default function VideoScene() {
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [frontLayer, setFrontLayer] = useState<"a" | "b">("a");
  const stepRef = useRef(0);

  const advance = useCallback(() => {
    const incomingLayer = frontLayer === "a" ? "b" : "a";
    stepRef.current = (stepRef.current + 1) % PLAYLIST.length;
    const nextKey = PLAYLIST[stepRef.current];
    const incomingEl = incomingLayer === "a" ? videoARef.current : videoBRef.current;
    if (incomingEl) {
      incomingEl.src = SOURCES[nextKey];
      incomingEl.currentTime = 0;
      incomingEl.play().catch(() => {});
    }
    setFrontLayer(incomingLayer);
  }, [frontLayer]);

  useEffect(() => {
    const a = videoARef.current;
    if (!a) return;
    a.src = SOURCES[PLAYLIST[0]];
    if (reduceMotion) {
      // still show a real frame of the landscape, just frozen
      a.currentTime = 1;
      a.pause();
    } else {
      a.play().catch(() => {});
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const current = frontLayer === "a" ? videoARef.current : videoBRef.current;
    if (!current) return;
    current.addEventListener("ended", advance);
    return () => current.removeEventListener("ended", advance);
  }, [frontLayer, advance, reduceMotion]);

  const kenBurns = (delay: number) =>
    reduceMotion
      ? undefined
      : `ken-burns 24s ease-in-out ${delay}s infinite alternate`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-forest-dark">
      <video
        ref={videoARef}
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out"
        style={{
          opacity: frontLayer === "a" ? 1 : 0,
          animation: kenBurns(0),
        }}
      />
      <video
        ref={videoBRef}
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out"
        style={{
          opacity: frontLayer === "b" ? 1 : 0,
          animation: kenBurns(0.4),
        }}
      />

      {/* warm color-grade so every clip reads as the same golden-hour
          palette, plus a bottom-weighted darkening for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/85 via-forest-dark/20 to-forest-dark/45 mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(60%_100%_at_72%_100%,rgba(230,168,101,0.3),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0),rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
