/**
 * Local events ("Akce v okolí") entered by hand on the admin page – wine
 * harvest festivals, hody, markets, concerts in Kyjov and around. Stored
 * in Redis as one JSON list, like the reservations.
 */

import { getJsonList, getJsonListSafe, setJsonList } from "./redis";

export type LocalEvent = {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, for multi-day events
  place: string;
  description?: string;
  url?: string;
  createdAt: string;
};

const REDIS_KEY = "chata-vresovice:events";

export async function getEvents(): Promise<LocalEvent[]> {
  return getJsonList<LocalEvent>(REDIS_KEY);
}

export async function saveEvents(events: LocalEvent[]) {
  await setJsonList(REDIS_KEY, events);
}

export function sortEvents(events: LocalEvent[]) {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Today's date in Prague as YYYY-MM-DD, independent of the server's timezone. */
export function todayInPrague() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Events that haven't ended yet, soonest first. */
export async function getUpcomingEvents(): Promise<LocalEvent[]> {
  const today = todayInPrague();
  const events = await getJsonListSafe<LocalEvent>(REDIS_KEY);
  return sortEvents(events.filter((e) => (e.endDate ?? e.startDate) >= today));
}
