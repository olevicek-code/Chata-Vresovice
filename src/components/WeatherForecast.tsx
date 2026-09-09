"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { CloudDrizzle, Sparkles } from "lucide-react";
import { CHATA } from "@/lib/leaflet";
import {
  moonPhaseInfo,
  stargazingQuality,
  weatherColor,
  weatherIcon,
  weatherLabel,
  type StargazingTier,
} from "@/lib/weather";

type DayForecast = {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  precipProb: number;
};

type Stargazing = {
  label: string;
  tier: StargazingTier;
  moonEmoji: string;
  moonLabel: string;
};

const TIER_CLASS: Record<StargazingTier, string> = {
  great: "bg-signal/10 text-forest-dark ring-signal/30",
  good: "bg-forest/10 text-forest-dark ring-forest/20",
  ok: "bg-wood-light/15 text-wood ring-wood-light/30",
  poor: "bg-stone/10 text-stone ring-stone/20",
};

export default function WeatherForecast() {
  const [days, setDays] = useState<DayForecast[] | null>(null);
  const [stargazing, setStargazing] = useState<Stargazing | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${CHATA.lat}&longitude=${CHATA.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=cloud_cover&forecast_days=7&timezone=Europe%2FPrague`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        const daily = data.daily;
        const parsed: DayForecast[] = daily.time.map((date: string, i: number) => ({
          date,
          code: daily.weather_code[i],
          tMax: Math.round(daily.temperature_2m_max[i]),
          tMin: Math.round(daily.temperature_2m_min[i]),
          precipProb: daily.precipitation_probability_max[i],
        }));
        setDays(parsed);

        const today: string = daily.time[0];
        const hours: string[] = data.hourly.time;
        const clouds: number[] = data.hourly.cloud_cover;
        const tonightCloud = ["21:00", "22:00", "23:00"]
          .map((h) => hours.indexOf(`${today}T${h}`))
          .filter((idx) => idx !== -1)
          .map((idx) => clouds[idx]);
        const avgCloud =
          tonightCloud.length > 0
            ? tonightCloud.reduce((a, b) => a + b, 0) / tonightCloud.length
            : (clouds[12] ?? 50);

        const moon = moonPhaseInfo(new Date());
        const quality = stargazingQuality(avgCloud, moon.illumination);
        setStargazing({
          label: quality.label,
          tier: quality.tier,
          moonEmoji: moon.emoji,
          moonLabel: moon.label,
        });
      })
      .catch(() => setFailed(true));
    return () => controller.abort();
  }, []);

  if (failed) return null;

  return (
    <div className="rounded-2xl bg-background p-5 ring-1 ring-black/5 sm:p-6">
      <div className="flex items-center gap-2 text-forest-dark">
        <CloudDrizzle className="h-5 w-5" />
        <h3 className="font-display text-lg font-medium">Počasí u chaty na 7 dní</h3>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
        {(days ?? Array.from({ length: 7 })).map((day, i) => {
          if (!day) {
            return (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-forest/5 sm:h-28"
              />
            );
          }
          const d = day as DayForecast;
          const isToday = i === 0;
          const Icon = weatherIcon(d.code, true);
          const color = weatherColor(d.code, true);
          return (
            <div
              key={d.date}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-forest/5 px-1.5 py-3 text-center"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-wood">
                {isToday ? "Dnes" : format(parseISO(d.date), "EEEEEE", { locale: cs })}
              </span>
              <Icon className="h-5 w-5" style={{ color }} />
              <span className="text-sm font-semibold text-forest-dark">
                {d.tMax}°
                <span className="ml-1 font-normal text-stone/60">{d.tMin}°</span>
              </span>
              {d.precipProb >= 30 && (
                <span className="text-[10px] text-wood">{d.precipProb}% déšť</span>
              )}
              <span className="hidden text-[10px] text-stone/50 sm:block">
                {weatherLabel(d.code)}
              </span>
            </div>
          );
        })}
      </div>

      {stargazing && (
        <div
          className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${TIER_CLASS[stargazing.tier]}`}
        >
          <span className="text-xl leading-none">{stargazing.moonEmoji}</span>
          <div>
            <p className="font-medium">
              Noční obloha dnes: {stargazing.label}
            </p>
            <p className="text-xs opacity-70">
              Měsíc: {stargazing.moonLabel} · žádná Wi-Fi, tak si ji klidně
              vychutnejte naživo
            </p>
          </div>
          <Sparkles className="ml-auto h-4 w-4 shrink-0 opacity-60" />
        </div>
      )}
    </div>
  );
}
