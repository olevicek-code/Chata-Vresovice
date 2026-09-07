"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Gives its children a subtle 3D tilt that follows the cursor, like a
 * light-catching surface rather than a flat card.
 */
export default function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springConfig = { stiffness: 220, damping: 24, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => scale.set(1.03);
  const handleMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 700 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
