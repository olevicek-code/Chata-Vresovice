"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import FallingLeaves from "./FallingLeaves";

const MESSAGES = [
  "Ahoj! Bydlím tu v lese 🦊",
  "Šššt, jsem jen na návštěvě.",
  "Objevili jste mě!",
  "Tady dole je klid.",
];

/**
 * A small easter egg: a fox appears once, at a random spot, once you've
 * scrolled past a random point on the page – click it for a surprise.
 * Purely decorative and self-contained, safe to remove if it doesn't land.
 */
export default function HiddenFox() {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [found, setFound] = useState(false);
  const [message, setMessage] = useState("");
  const [leavesSeed, setLeavesSeed] = useState(0);
  const [showLeaves, setShowLeaves] = useState(false);
  const triggeredRef = useRef(false);
  const thresholdRef = useRef(0.25 + Math.random() * 0.45);

  useEffect(() => {
    function onScroll() {
      if (triggeredRef.current) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= thresholdRef.current) {
        triggeredRef.current = true;
        setPos({
          top: 90 + Math.random() * Math.max(window.innerHeight - 260, 100),
          left: 20 + Math.random() * Math.max(window.innerWidth - 140, 100),
        });
        setVisible(true);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!visible || found) return;
    const timer = setTimeout(() => setVisible(false), 9000);
    return () => clearTimeout(timer);
  }, [visible, found]);

  function handleClick() {
    setFound(true);
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setLeavesSeed((s) => s + 1);
    setShowLeaves(true);
    setTimeout(() => setVisible(false), 2600);
  }

  if (!pos) return null;

  return (
    <>
      {showLeaves && (
        <FallingLeaves seed={leavesSeed} onDone={() => setShowLeaves(false)} />
      )}
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Skrytá liška"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 80 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cream/90 text-2xl shadow-xl ring-2 ring-white/50"
        >
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            🦊
          </motion.span>
          {found && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest-dark px-3 py-1.5 text-xs font-medium text-cream shadow-lg"
            >
              {message}
            </motion.span>
          )}
        </motion.button>
      )}
    </>
  );
}
