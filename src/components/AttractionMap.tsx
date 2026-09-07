"use client";

/**
 * Small interactive map (Leaflet + OpenStreetMap tiles, loaded from a CDN
 * so the project doesn't need an extra npm dependency or API key) that
 * plots the chata and one attraction, connects them with a line, and
 * labels the straight-line distance and bearing between them.
 */

import { useEffect, useRef, useState } from "react";

// Minimal shape of the bits of the Leaflet global API this component
// actually uses – deliberately not the real `leaflet` types, since the
// library is loaded from a CDN script tag rather than installed as a
// dependency.
type LatLngTuple = [number, number];
interface LeafletLayer {
  addTo: (map: LeafletMapInstance) => LeafletLayer;
  bindPopup?: (html: string) => LeafletLayer;
}
interface LeafletMapInstance {
  remove: () => void;
  fitBounds: (bounds: LatLngTuple[], options?: Record<string, unknown>) => void;
}
interface LeafletStatic {
  map: (el: HTMLElement, options?: Record<string, unknown>) => LeafletMapInstance;
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletLayer;
  marker: (latlng: LatLngTuple, options?: Record<string, unknown>) => LeafletLayer;
  polyline: (points: LatLngTuple[], options?: Record<string, unknown>) => LeafletLayer;
  divIcon: (options: Record<string, unknown>) => unknown;
}

declare global {
  interface Window {
    L?: LeafletStatic;
  }
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const CHATA = { lat: 49.059051, lon: 17.215106, label: "Chata Vřesovice" };

let leafletLoading: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.L) return Promise.resolve();
  if (leafletLoading) return leafletLoading;

  leafletLoading = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector(
      `script[src="${LEAFLET_JS}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.L) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("load failed")));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(script);
  });

  return leafletLoading;
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingDeg(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

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

        const pin = (emoji: string, bg: string) =>
          L.divIcon({
            className: "",
            html: `<div class="flex h-8 w-8 items-center justify-center rounded-full ${bg} text-base shadow-lg ring-2 ring-cream/90">${emoji}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

        L.marker(chataPoint, { icon: pin("🏡", "bg-forest-dark") })
          .addTo(map)
          .bindPopup?.(CHATA.label);
        L.marker(targetPoint, { icon: pin("📍", "bg-wood-light") })
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

        L.marker(mid, {
          icon: L.divIcon({
            className: "",
            html: `<div class="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-forest-dark px-3 py-1 text-xs font-semibold text-cream shadow-lg ring-1 ring-cream/20">
                     <span style="display:inline-block;transform:rotate(${(bearing - 90).toFixed(1)}deg)">&#10148;</span>
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
