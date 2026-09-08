"use client";

/**
 * Aerial/satellite view of the cottage's location, using Esri's free
 * World Imagery tiles (no API key needed) instead of the flat OSM street
 * map – gives a real look at the building and surrounding land.
 */

import { useEffect, useRef, useState } from "react";
import { CHATA, loadLeaflet, pinIcon, type LeafletMapInstance } from "@/lib/leaflet";

export default function LocationMap() {
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
          zoomControl: true,
          scrollWheelZoom: false,
        });
        mapRef.current = map;

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution:
              "Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS community",
          }
        ).addTo(map);

        // thin reference overlay for place names/boundaries on top of the
        // plain satellite imagery
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19, opacity: 0.9 }
        ).addTo(map);

        L.marker([CHATA.lat, CHATA.lon], {
          icon: pinIcon(L, "🏡", "bg-forest-dark", 38),
        })
          .addTo(map)
          .bindPopup?.(CHATA.label);

        map.setView([CHATA.lat, CHATA.lon], 17);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (failed) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-forest/5 text-sm text-stone">
        Mapu se teď nepodařilo načíst.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-2xl ring-1 ring-black/5"
    />
  );
}
