"use client";

import { useMemo, useState } from "react";
import { Route, X } from "lucide-react";
import { CHRIBY_POINTS } from "@/data/chriby-points";
import { CHATA, haversineKm } from "@/lib/leaflet";
import RouteMap from "./RouteMap";

const MAX_STOPS = 5;

export default function TrailPlanner() {
  const [selected, setSelected] = useState<number[]>([]);

  function toggle(i: number) {
    setSelected((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= MAX_STOPS) return prev;
      return [...prev, i];
    });
  }

  const stops = useMemo(() => selected.map((i) => CHRIBY_POINTS[i]), [selected]);

  const legs = useMemo(() => {
    if (stops.length === 0) return [];
    const points = [CHATA, ...stops, CHATA];
    const result: { from: string; to: string; km: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      result.push({
        from: i === 0 ? "Chata" : stops[i - 1].title,
        to: i === points.length - 2 ? "Chata" : stops[i].title,
        km: haversineKm(a, b),
      });
    }
    return result;
  }, [stops]);

  const totalKm = legs.reduce((sum, l) => sum + l.km, 0);

  return (
    <div className="rounded-2xl bg-background p-5 ring-1 ring-black/5 sm:p-6">
      <div className="flex items-center gap-2 text-forest-dark">
        <Route className="h-5 w-5" />
        <h4 className="font-display text-lg font-medium">Naplánujte si vlastní túru</h4>
      </div>
      <p className="mt-2 text-sm text-stone">
        Vyberte 2–{MAX_STOPS} zastavení z bodů výše (v pořadí, v jakém je chcete
        navštívit) – mapa vám nakreslí trasu a spočítá vzdálenost.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHRIBY_POINTS.map((point, i) => {
          const order = selected.indexOf(i);
          const isSelected = order !== -1;
          return (
            <button
              key={point.title}
              onClick={() => toggle(i)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-forest-dark text-cream"
                  : "bg-forest/5 text-stone hover:bg-forest/10"
              }`}
            >
              {isSelected && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cream/20 text-[10px] font-bold">
                  {order + 1}
                </span>
              )}
              {point.title}
            </button>
          );
        })}
      </div>

      {stops.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-forest-dark">
              Trasa tam a zpět: {stops.length}{" "}
              {stops.length === 1 ? "zastávka" : "zastávky"} ·{" "}
              <span className="text-wood">{totalKm.toFixed(1)} km vzdušnou čarou</span>
            </p>
            <button
              onClick={() => setSelected([])}
              className="flex items-center gap-1 text-xs text-stone/60 hover:text-stone"
            >
              <X className="h-3.5 w-3.5" />
              Vymazat
            </button>
          </div>

          <RouteMap stops={stops.map((s) => ({ lat: s.lat, lon: s.lon, label: s.title }))} />

          <ul className="mt-3 space-y-1 text-xs text-stone">
            {legs.map((leg, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>
                  {leg.from} → {leg.to}
                </span>
                <span className="text-stone/60">{leg.km.toFixed(1)} km</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] text-stone/50">
            Vzdálenosti jsou vzdušnou čarou mezi body, ne po skutečné lesní
            cestě – reálná procházka bude o dost delší a s převýšením.
          </p>
        </div>
      )}
    </div>
  );
}
