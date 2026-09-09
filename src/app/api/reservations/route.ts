import { NextRequest, NextResponse } from "next/server";
import {
  generateId,
  getReservations,
  hasConflict,
  saveReservations,
  type Reservation,
} from "@/lib/reservations";
import { sendReservationEmails } from "@/lib/email";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const reservations = await getReservations();
  // Only expose the info needed to render a calendar / avoid double booking.
  const publicView = reservations
    .filter((r) => r.status !== "cancelled")
    .map((r) => ({
      id: r.id,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
    }));
  return NextResponse.json({ reservations: publicView });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON tělo požadavku." }, { status: 400 });
  }

  const { name, email, phone, startDate, endDate, guests, note } = body as {
    name?: string;
    email?: string;
    phone?: string;
    startDate?: string;
    endDate?: string;
    guests?: number;
    note?: string;
  };

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Vyplňte prosím jméno." }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Vyplňte prosím platný e-mail." }, { status: 400 });
  }
  if (!startDate || !DATE_RE.test(startDate) || !endDate || !DATE_RE.test(endDate)) {
    return NextResponse.json(
      { error: "Vyberte prosím platný termín příjezdu a odjezdu." },
      { status: 400 }
    );
  }
  if (startDate >= endDate) {
    return NextResponse.json(
      { error: "Datum odjezdu musí být po datu příjezdu." },
      { status: 400 }
    );
  }

  const conflict = await hasConflict(startDate, endDate);
  if (conflict) {
    return NextResponse.json(
      { error: "Vybraný termín je již obsazený. Zvolte prosím jiné datum." },
      { status: 409 }
    );
  }

  const reservation: Reservation = {
    id: generateId(),
    name: name.trim(),
    email: email.trim(),
    phone: typeof phone === "string" ? phone.trim() : undefined,
    startDate,
    endDate,
    guests: typeof guests === "number" && guests > 0 ? guests : 1,
    note: typeof note === "string" ? note.trim() : undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const reservations = await getReservations();
    reservations.push(reservation);
    await saveReservations(reservations);

    await sendReservationEmails(reservation);

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (err) {
    // TEMPORARY verbose error for debugging a production 500 — revert once
    // the root cause is found.
    console.error("[reservations] POST failed:", err);
    return NextResponse.json(
      { error: "DEBUG: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
