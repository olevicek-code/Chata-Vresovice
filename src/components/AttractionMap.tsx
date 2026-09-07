"use client";

/**
 * Small interactive map (Leaflet + OpenStreetMap tiles) that plots the
 * chata and one attraction, connects them with a line, and labels the
 * straight-line distance and bearing between them.
 */

import { useEffect, useRef, useState } from "react";
import {
  CHATA,
  bearingDeg,
  haversineKm,
  loadLeaflet,
  pinIcon,
  type LatLngTuple,
  type LeafletMapInstance,
} from "@/lib/leaflet";

export default function AttractionMap({
  lat,
  lon,
  label,
}: {
  lat: number;
  lon: number;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const [failed, setFailed] = useState(false);

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
        const targetPoint: LatLngTuple = [lat, lon];

        L.marker(chataPoint, { icon: pinIcon(L, "🏡", "bg-forest-dark") })
          .addTo(map)
          .bindPopup?.(CHATA.label);
        L.marker(targetPoint, { icon: pinIcon(L, "📍", "bg-wood-light") })
          .addTo(map)
          .bindPopup?.(label);

        L.polyline([chataPoint, targetPoint], {
          color: "#c98f5e",
          weight: 3,
          opacity: 0.9,
          dashArray: "2 10",
          lineCap: "round",
        }).addTo(map);

        const distanceKm = haversineKm(CHATA, { lat, lon });
        const bearing = bearingDeg(CHATA, { lat, lon });
        const mid: LatLngTuple = [(CHATA.lat + lat) / 2, (CHATA.lon + lon) / 2];

        const arrowSvg = `<svg width="10" height="10" viewBox="0 0 10 10" style="display:block;transform:rotate(${(bearing - 90).toFixed(1)}deg)" xmlns="http://www.w3.org/2000/svg"><path d="M0 2 L10 5 L0 8 Z" fill="#ffffff"/></svg>`;

        L.marker(mid, {
          icon: L.divIcon({
            className: "",
            html: `<div class="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-black/90 px-3 py-1 text-xs font-semibold shadow-lg ring-1 ring-white/10" style="color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,0.8)">
                     ${arrowSvg}
                     ${distanceKm.toFixed(1)} km vzdušnou čarou
                   </div>`,
            iconSize: [0, 0],
          }),
          interactive: false,
        }).addTo(map);

        map.fitBounds([chataPoint, targetPoint], { padding: [42, 42] });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lon, label]);

  if (failed) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-forest/5 text-sm text-stone sm:h-64">
        Mapu se teď nepodařilo načíst.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-56 w-full overflow-hidden rounded-xl ring-1 ring-black/5 sm:h-64"
    />
  );
}
