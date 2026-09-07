"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.button
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12, scale: visible ? 1 : 0.9 }}
      transition={{ duration: 0.2 }}
      whileHover={visible ? { scale: 1.06 } : undefined}
      whileTap={visible ? { scale: 0.94 } : undefined}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Zpět nahoru"
      aria-hidden={!visible}
      className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream shadow-lg ring-1 ring-black/10 hover:bg-forest-dark ${
        visible ? "" : "pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </motion.button>
  );
}
