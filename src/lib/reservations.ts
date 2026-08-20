import { promises as fs } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reservations.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

export async function getReservations(): Promise<Reservation[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as Reservation[];
  } catch {
    return [];
  }
}

export async function saveReservations(reservations: Reservation[]) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(reservations, null, 2), "utf-8");
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
