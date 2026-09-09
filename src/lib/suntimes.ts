import { CHATA } from "./leaflet";

export type SunTimes = { sunrise: Date; sunset: Date };

let cache: Promise<SunTimes> | null = null;

/** Fetches today's real sunrise/sunset at the cottage (same free Open-Meteo
 * endpoint TechHud uses for the weather HUD), cached per page load so the
 * theme toggle and any other consumer don't each fire their own request. */
export function fetchSunTimes(): Promise<SunTimes> {
  if (!cache) {
    cache = fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${CHATA.lat}&longitude=${CHATA.lon}&daily=sunrise,sunset&timezone=Europe%2FPrague`
    )
      .then((r) => r.json())
      .then((data) => ({
        sunrise: new Date(data.daily.sunrise[0]),
        sunset: new Date(data.daily.sunset[0]),
      }))
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
}
