"use client";

/**
 * Shared multi-marker map for the Chřiby trail-tips list: the chata plus
 * every point in the list, each numbered to match its row. Selecting a
 * row (via `activeIndex`) pans the map to that marker and opens its
 * popup, without rebuilding the whole map.
 */

import { useEffect, useRef, useState } from "react";
import {
  CHATA,
  loadLeaflet,
  pinIcon,
  type LatLngTuple,
  type LeafletLayer,
  type LeafletMapInstance,
} from "@/lib/leaflet";

type Point = { title: string; lat: number; lon: number };

export default function RegionMap({
  points,
  activeIndex,
}: {
  points: Point[];
  activeIndex: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markersRef = useRef<LeafletLayer[]>([]);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then(() => {
        if (cancelled || !containerRef.current || !window.L) return;
        const L = window.L;

        const map = L.map(containerRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        });
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 17,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        L.marker([CHATA.lat, CHATA.lon], { icon: pinIcon(L, "🏡", "bg-forest-dark", 32) })
          .addTo(map)
          .bindPopup?.(CHATA.label);

        markersRef.current = points.map((p, i) => {
          const marker = L.marker([p.lat, p.lon], {
            icon: pinIcon(L, String(i + 1), "bg-wood-light text-forest-dark font-bold", 24),
          });
          marker.addTo(map).bindPopup?.(p.title);
          return marker;
        });

        const bounds: LatLngTuple[] = [
          [CHATA.lat, CHATA.lon],
          ...points.map((p): LatLngTuple => [p.lat, p.lon]),
        ];
        map.fitBounds(bounds, { padding: [28, 28] });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Intentionally mount-once: `points` is a stable, static list, and
    // rebuilding the whole map on every render would fight the panTo
    // effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || activeIndex === null) return;
    const point = points[activeIndex];
    const marker = markersRef.current[activeIndex];
    if (!mapRef.current || !point || !marker) return;
    mapRef.current.panTo([point.lat, point.lon]);
    marker.openPopup?.();
  }, [activeIndex, ready, points]);

  if (failed) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-forest/5 text-sm text-stone">
        Mapu se teď nepodařilo načíst.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-xl ring-1 ring-black/5 sm:h-96"
    />
  );
}
