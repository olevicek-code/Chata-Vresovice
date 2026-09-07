/**
 * Shared helpers for the small Leaflet maps used around the site
 * (AttractionMap, RegionMap). Leaflet itself is loaded from a CDN script
 * tag rather than installed as an npm dependency, so this file also
 * declares the minimal slice of its API these components actually use –
 * not the real `leaflet` types.
 */

export type LatLngTuple = [number, number];

export interface LeafletLayer {
  addTo: (map: LeafletMapInstance) => LeafletLayer;
  bindPopup?: (html: string) => LeafletLayer;
  openPopup?: () => LeafletLayer;
  setLatLng?: (latlng: LatLngTuple) => LeafletLayer;
}
export interface LeafletMapInstance {
  remove: () => void;
  fitBounds: (bounds: LatLngTuple[], options?: Record<string, unknown>) => void;
  panTo: (latlng: LatLngTuple, options?: Record<string, unknown>) => void;
  setView: (latlng: LatLngTuple, zoom: number) => void;
}
export interface LeafletStatic {
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

export const CHATA = { lat: 49.059051, lon: 17.215106, label: "Chata Vřesovice" };

let leafletLoading: Promise<void> | null = null;

export function loadLeaflet(): Promise<void> {
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

export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Small rounded pin used by both maps (home for the chata, a plain dot
 * for everything else) – kept as one shared builder so the two maps
 * always look the same. */
export function pinIcon(L: LeafletStatic, emoji: string, bg: string, size = 30) {
  return L.divIcon({
    className: "",
    html: `<div class="flex items-center justify-center rounded-full ${bg} text-sm shadow-lg ring-2 ring-cream/90" style="width:${size}px;height:${size}px">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
