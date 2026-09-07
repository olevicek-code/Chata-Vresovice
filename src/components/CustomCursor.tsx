"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight custom cursor: a fast dot plus a lagging ring that expands
 * over links/buttons. Only activates on fine-pointer devices with no
 * reduced-motion preference, so touch users and accessibility settings are
 * never affected.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!isFinePointer || prefersReducedMotion) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let targetX = ringX;
    let targetY = ringY;
    let raf = requestAnimationFrame(tick);

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      dotRef.current?.style.setProperty("--x", `${targetX}px`);
      dotRef.current?.style.setProperty("--y", `${targetY}px`);
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "a, button, input, textarea, [data-cursor-hover]"
      );
      ringRef.current?.classList.toggle("cursor-ring--active", Boolean(interactive));
    }

    function tick() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ringRef.current?.style.setProperty("--x", `${ringX}px`);
      ringRef.current?.style.setProperty("--y", `${ringY}px`);
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} aria-hidden className="cursor-dot" />
      <div ref={ringRef} aria-hidden className="cursor-ring" />
    </>
  );
}
