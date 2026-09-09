/**
 * Minimal password-based admin session for the reservations admin page.
 * There's no user database – just one shared password in ADMIN_PASSWORD.
 * The session cookie holds an HMAC of a fixed tag signed with that
 * password (not the password itself), so it can be verified statelessly
 * on every request without storing sessions anywhere.
 */

import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "chata_admin";

const SESSION_TAG = "chata-vresovice-admin-session";

function sign(password: string) {
  return createHmac("sha256", password).update(SESSION_TAG).digest("hex");
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function sessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return sign(password);
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  const expected = sessionToken();
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
