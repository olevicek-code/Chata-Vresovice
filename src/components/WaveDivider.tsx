/**
 * A soft organic divider between two sections, used instead of a hard
 * straight edge so the page reads more like a natural landscape than a
 * stack of rectangles.
 *
 * `bg` is the color of the section ABOVE the divider (it fills the whole
 * strip), `wave` is the color of the section BELOW (it fills the curved
 * shape rising up from the bottom edge) — together they blend the two
 * sections with a gentle hill-like line instead of a ruler-straight cut.
 */
export default function WaveDivider({
  bg,
  wave,
  flip = false,
}: {
  bg: string;
  wave: string;
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden
      className="relative h-10 w-full overflow-hidden sm:h-16"
      style={{ backgroundColor: bg, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 55 C 220 85, 380 20, 620 50 C 840 78, 1000 15, 1240 48 C 1340 62, 1400 55, 1440 45 L1440 100 L0 100 Z"
          fill={wave}
        />
      </svg>
    </div>
  );
}
