/**
 * Reservation storage via Vercel's native Redis add-on (see lib/redis.ts).
 * Needed because Vercel's serverless functions have a read-only filesystem
 * in production, so the previous "save to a local JSON file" approach
 * could never actually persist a reservation there (every write threw
 * EROFS). All reservations live under one Redis key as a single JSON blob,
 * which keeps this file's shape identical to the old one.
 */

import { generateId as generatePrefixedId, getJsonList, setJsonList } from "./redis";

export type Reservation = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  guests: number;
  note?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  /** true for a date range blocked directly from the admin page (no real
   * guest) rather than an actual reservation request. */
  blocked?: boolean;
};

const REDIS_KEY = "chata-vresovice:reservations";

export async function getReservations(): Promise<Reservation[]> {
  return getJsonList<Reservation>(REDIS_KEY);
}

export async function saveReservations(reservations: Reservation[]) {
  await setJsonList(REDIS_KEY, reservations);
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
) {
  return aStart < bEnd && bStart < aEnd;
}

export async function hasConflict(startDate: string, endDate: string) {
  const reservations = await getReservations();
  return reservations
    .filter((r) => r.status !== "cancelled")
    .some((r) => rangesOverlap(startDate, endDate, r.startDate, r.endDate));
}

export function generateId() {
  return generatePrefixedId("res");
}
