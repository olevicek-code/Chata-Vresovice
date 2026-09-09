/**
 * Reservation storage via Upstash Redis's HTTP REST API (plain fetch, no
 * npm dependency) — Vercel's serverless functions have a read-only
 * filesystem in production, so the previous "save to a local JSON file"
 * approach could never actually persist a reservation there (every write
 * threw EROFS). All reservations live under one Redis key as a single
 * JSON blob, which keeps this file's shape identical to the old one.
 *
 * Set one of these env var pairs in Vercel (Project → Settings →
 * Environment Variables), whichever your storage integration provides:
 * - KV_REST_API_URL + KV_REST_API_TOKEN (Vercel's own KV/Upstash storage)
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash directly)
 */

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

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_KEY = "chata-vresovice:reservations";

async function redisCommand(command: (string | number)[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error(
      "Úložiště rezervací není nastavené – chybí KV_REST_API_URL/KV_REST_API_TOKEN (nebo UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN) v proměnných prostředí."
    );
  }
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Chyba úložiště rezervací (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

export async function getReservations(): Promise<Reservation[]> {
  const raw = await redisCommand(["GET", REDIS_KEY]);
  if (typeof raw !== "string") return [];
  try {
    return JSON.parse(raw) as Reservation[];
  } catch {
    return [];
  }
}

export async function saveReservations(reservations: Reservation[]) {
  await redisCommand(["SET", REDIS_KEY, JSON.stringify(reservations)]);
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
