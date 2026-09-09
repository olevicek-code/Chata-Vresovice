import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
} from "lucide-react";

/** Shared Open-Meteo weather-code helpers (icon, label, accent color) used
 * by both the hero HUD and the 7-day forecast, so the two stay visually
 * consistent instead of drifting apart. */
export function weatherIcon(code: number, isDay: boolean) {
  if (code === 0) return isDay ? Sun : Moon;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code >= 45 && code <= 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

/** Icon color shifts with the actual condition – amber sun, blue rain,
 * pale cyan snow, grey fog/cloud – so it visibly reacts instead of just
 * swapping a same-colored glyph. */
export function weatherColor(code: number, isDay: boolean) {
  if (code === 0) return isDay ? "#fbbf24" : "#a5b4fc";
  if (code <= 2) return isDay ? "#f2c675" : "#93c5fd";
  if (code === 3) return "#cbd5c8";
  if (code >= 45 && code <= 48) return "#9ca3af";
  if (code >= 51 && code <= 67) return "#5eb8e0";
  if (code >= 71 && code <= 86) return "#d6ecf5";
  if (code >= 95) return "#f0a35e";
  return "#55e0a8";
}

export function weatherLabel(code: number) {
  if (code === 0) return "Jasno";
  if (code <= 2) return "Polojasno";
  if (code === 3) return "Zataženo";
  if (code >= 45 && code <= 48) return "Mlha";
  if (code >= 51 && code <= 67) return "Déšť";
  if (code >= 71 && code <= 86) return "Sníh";
  if (code >= 95) return "Bouřka";
  return "Načítám";
}

const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

const MOON_PHASES = [
  { max: 0.03, emoji: "🌑", label: "Nov" },
  { max: 0.22, emoji: "🌒", label: "Dorůstající srpek" },
  { max: 0.28, emoji: "🌓", label: "První čtvrt" },
  { max: 0.47, emoji: "🌔", label: "Dorůstající měsíc" },
  { max: 0.53, emoji: "🌕", label: "Úplněk" },
  { max: 0.72, emoji: "🌖", label: "Couvající měsíc" },
  { max: 0.78, emoji: "🌗", label: "Poslední čtvrt" },
  { max: 0.97, emoji: "🌘", label: "Couvající srpek" },
  { max: 1.01, emoji: "🌑", label: "Nov" },
];

/** Simple synodic-month approximation – no astronomy API needed, just a
 * known reference new moon and the ~29.53-day cycle length. Accurate to
 * well within a day, plenty for a "how's tonight looking" indicator. */
export function moonPhaseInfo(date: Date) {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86400000;
  let phase = (diffDays % SYNODIC_MONTH_DAYS) / SYNODIC_MONTH_DAYS;
  if (phase < 0) phase += 1;

  // 0 at new moon, 1 at full moon, back to 0 – how much of the sky glow
  // the moon adds, which matters more for stargazing than its shape.
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const found = MOON_PHASES.find((p) => phase <= p.max) ?? MOON_PHASES[MOON_PHASES.length - 1];

  return { phase, illumination, emoji: found.emoji, label: found.label };
}

export type StargazingTier = "great" | "good" | "ok" | "poor";

/** Combines tonight's cloud cover with how bright the moon is to give a
 * plain-language read on whether it's worth stepping outside to look up –
 * a small, honest payoff for a cottage that has no Wi-Fi to scroll on. */
export function stargazingQuality(
  cloudCoverPercent: number,
  moonIllumination: number
): { label: string; tier: StargazingTier } {
  const clearSky = 1 - cloudCoverPercent / 100;
  const darkSky = 1 - moonIllumination;
  const score = clearSky * 0.6 + darkSky * 0.4;

  if (clearSky < 0.3) return { label: "Zataženo, dnes moc ne", tier: "poor" };
  if (score > 0.75) return { label: "Ideální noc na hvězdy", tier: "great" };
  if (score > 0.55) return { label: "Dobrá noc na pozorování hvězd", tier: "good" };
  return { label: "Jasno, ale svítí měsíc", tier: "ok" };
}
