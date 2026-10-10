/**
 * Shared connection to Vercel's native Redis add-on (node-redis client,
 * connected with the REDIS_URL env var it provides). Reservations, photos
 * and events each keep their data under one key as a single JSON blob.
 *
 * Set `REDIS_URL` in Vercel (Project → Storage → create/connect a Redis
 * database → it's added automatically) for this to work.
 */

import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

export function hasRedis() {
  return Boolean(process.env.REDIS_URL);
}

/** Error text for admin API failures – names the real cause when the
 * database simply isn't connected, instead of a generic failure. */
export function storageErrorMessage(fallback: string) {
  return hasRedis()
    ? fallback
    : "Úložiště není nastavené – ve Vercelu připojte Redis databázi (chybí REDIS_URL).";
}

export async function getClient(): Promise<RedisClientType> {
  if (client?.isOpen) return client;

  if (!connecting) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error(
        "Úložiště není nastavené – chybí REDIS_URL v proměnných prostředí."
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

export async function getJsonList<T>(key: string): Promise<T[]> {
  const redis = await getClient();
  const raw = await redis.get(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function setJsonList<T>(key: string, items: T[]) {
  const redis = await getClient();
  await redis.set(key, JSON.stringify(items));
}

/** For public pages: a missing or unreachable database (e.g. local dev
 * without REDIS_URL) should just mean "nothing to show", not a crash. */
export async function getJsonListSafe<T>(key: string): Promise<T[]> {
  if (!hasRedis()) return [];
  try {
    return await getJsonList<T>(key);
  } catch (err) {
    console.error(`[redis] reading ${key} failed:`, err);
    return [];
  }
}

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
