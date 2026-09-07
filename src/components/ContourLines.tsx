/**
 * Faint animated topographic contour lines, used as a decorative backdrop
 * for "data" sections to reinforce the mapped-terrain / HUD feel.
 */
export default function ContourLines() {
  const lines = [40, 90, 140, 190, 240];
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
      viewBox="0 0 800 300"
      preserveAspectRatio="none"
    >
      {lines.map((y, i) => (
        <path
          key={y}
          d={`M0 ${y} C 150 ${y - 30}, 300 ${y + 30}, 450 ${y} S 700 ${y - 25} 800 ${y}`}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={1}
          strokeDasharray="4 6"
          style={{ animation: `contour-drift ${8 + i * 2}s linear infinite` }}
        />
      ))}
    </svg>
  );
}
