"use client";

import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Radio,
} from "lucide-react";
import { CHATA } from "@/lib/leaflet";

const LAT = CHATA.lat;
const LON = CHATA.lon;

type Weather = {
  temp: number;
  code: number;
  sunrise: string;
  sunset: string;
};

function weatherIcon(code: number, isDay: boolean) {
  if (code === 0) return isDay ? Sun : Moon;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code >= 45 && code <= 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

function weatherLabel(code: number) {
  if (code === 0) return "Jasno";
  if (code <= 2) return "Polojasno";
  if (code === 3) return "Zataženo";
  if (code >= 45 && code <= 48) return "Mlha";
  if (code >= 51 && code <= 67) return "Déšť";
  if (code >= 71 && code <= 86) return "Sníh";
  if (code >= 95) return "Bouřka";
  return "Načítám";
}

/** Live "instrument panel" over the hero: local time and real weather at
 * the cottage's coordinates — small proof that this isn't just a static
 * mock. */
export default function TechHud() {
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Europe%2FPrague`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          sunrise: data.daily.sunrise[0],
          sunset: data.daily.sunset[0],
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const sunrise = weather ? new Date(weather.sunrise) : null;
  const sunset = weather ? new Date(weather.sunset) : null;
  const isDay = now && sunrise && sunset ? now >= sunrise && now < sunset : true;
  const Icon = weather ? weatherIcon(weather.code, isDay) : Radio;

  return (
    <div className="glass-panel signal-glow relative z-10 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl px-5 py-4 font-mono text-cream">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-cream/70">
          Zážitky: online
        </span>
      </div>

      <div className="h-6 w-px bg-cream/15" />

      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-signal" />
        <span className="text-sm tabular-nums">
          {weather ? `${weather.temp}°C` : "—"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-cream/50">
          {weather ? weatherLabel(weather.code) : "načítám"}
        </span>
      </div>

      <div className="h-6 w-px bg-cream/15" />

      <div className="flex items-center gap-2 text-sm tabular-nums">
        {now
          ? now.toLocaleTimeString("cs-CZ", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "--:--:--"}
        <span className="text-[10px] uppercase tracking-widest text-cream/50">
          49.068N 17.220E
        </span>
      </div>

      <div className="h-6 w-px bg-cream/15" />

      <div className="text-sm">
        <span className="text-cream/50">Volný termín:</span>{" "}
        <span className="text-signal">dle domluvy</span>
      </div>
    </div>
  );
}
