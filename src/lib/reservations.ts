/**
 * Reservation storage via Vercel's native Redis add-on (node-redis client,
 * connected with the REDIS_URL env var it provides). Needed because
 * Vercel's serverless functions have a read-only filesystem in
 * production, so the previous "save to a local JSON file" approach could
 * never actually persist a reservation there (every write threw EROFS).
 * All reservations live under one Redis key as a single JSON blob, which
 * keeps this file's shape identical to the old one.
 *
 * Set `REDIS_URL` in Vercel (Project → Storage → create/connect a Redis
 * database → it's added automatically) for this to work.
 */

import { createClient, type RedisClientType } from "redis";

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
};

const REDIS_KEY = "chata-vresovice:reservations";

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType> {
  if (client?.isOpen) return client;

  if (!connecting) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error(
        "Úložiště rezervací není nastavené – chybí REDIS_URL v proměnných prostředí."
      );
    }
    const c: RedisClientType = createClient({ url });
    c.on("error", (err) => console.error("[redis] client error:", err));
    connecting = c
      .connect()
      .then(() => {
        client = c;
        return c;
      })
      .catch((err) => {
        connecting = null;
        throw err;
      });
  }

  return connecting;
}

export async function getReservations(): Promise<Reservation[]> {
  const redis = await getClient();
  const raw = await redis.get(REDIS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reservation[];
  } catch {
    return [];
  }
}

export async function saveReservations(reservations: Reservation[]) {
  const redis = await getClient();
  await redis.set(REDIS_KEY, JSON.stringify(reservations));
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
  return `res_${Math.random().toString(36).slice(2, 10)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
