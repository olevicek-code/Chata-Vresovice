"use client";

/**
 * Multi-point version of AttractionMap: plots the chata plus an ordered
 * sequence of stops, connects them in order, and numbers each stop so it
 * matches the order picker in TrailPlanner.
 */

import { useEffect, useRef, useState } from "react";
import {
  CHATA,
  loadLeaflet,
  pinIcon,
  type LatLngTuple,
  type LeafletMapInstance,
} from "@/lib/leaflet";

export type RouteStop = { lat: number; lon: number; label: string };

export default function RouteMap({ stops }: { stops: RouteStop[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const [failed, setFailed] = useState(false);

  const key = stops.map((s) => `${s.lat},${s.lon}`).join("|");

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then(() => {
        if (cancelled || !containerRef.current || !window.L) return;
        const L = window.L;

        const map = L.map(containerRef.current, {
          zoomControl: false,
          scrollWheelZoom: false,
        });
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 17,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const chataPoint: LatLngTuple = [CHATA.lat, CHATA.lon];
        const stopPoints: LatLngTuple[] = stops.map((s) => [s.lat, s.lon]);
        // Loop back to the chata at the end so the drawn route matches the
        // round-trip distance shown next to the map (there and back).
        const routePoints = [chataPoint, ...stopPoints, chataPoint];

        L.marker(chataPoint, { icon: pinIcon(L, "🏡", "bg-forest-dark") })
          .addTo(map)
          .bindPopup?.(CHATA.label);

        stops.forEach((s, i) => {
          L.marker([s.lat, s.lon], {
            icon: pinIcon(L, String(i + 1), "bg-wood-light font-bold text-[#1d2f26]"),
          })
            .addTo(map)
            .bindPopup?.(s.label);
        });

        L.polyline(routePoints, {
          color: "#4a6b4a",
          weight: 3,
          opacity: 0.85,
          dashArray: "6 8",
          lineCap: "round",
        }).addTo(map);

        map.fitBounds(routePoints, { padding: [42, 42] });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (failed) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-forest/5 text-sm text-stone sm:h-80">
        Mapu se teď nepodařilo načíst.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-xl ring-1 ring-black/5 sm:h-80"
    />
  );
}
