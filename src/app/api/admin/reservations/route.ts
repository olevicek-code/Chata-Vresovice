import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import {
  generateId,
  getReservations,
  hasConflict,
  saveReservations,
  type Reservation,
} from "@/lib/reservations";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isAuthed(request: NextRequest) {
  return isValidSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

/** Blocks a date range from the admin page directly – e.g. "chceme mít
 * chatu jen pro sebe o Vánocích" – without needing a real guest to submit
 * the public reservation form. Stored as an ordinary confirmed
 * reservation (so it blocks the calendar the same way) but flagged
 * `blocked: true` so the admin UI and any future guest-facing view can
 * tell it apart from a real request. */
export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Nepřihlášeno." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON tělo požadavku." }, { status: 400 });
  }

  const { label, startDate, endDate, note } = body as {
    label?: string;
    startDate?: string;
    endDate?: string;
    note?: string;
  };

  if (!label || typeof label !== "string" || label.trim().length < 2) {
    return NextResponse.json({ error: "Vyplňte prosím popis blokace." }, { status: 400 });
  }
  if (!startDate || !DATE_RE.test(startDate) || !endDate || !DATE_RE.test(endDate)) {
    return NextResponse.json(
      { error: "Vyberte prosím platný termín." },
      { status: 400 }
    );
  }
  if (startDate >= endDate) {
    return NextResponse.json(
      { error: "Konec musí být po začátku." },
      { status: 400 }
    );
  }

  try {
    if (await hasConflict(startDate, endDate)) {
      return NextResponse.json(
        { error: "Termín se překrývá s existující rezervací nebo blokací." },
        { status: 409 }
      );
    }

    const reservation: Reservation = {
      id: generateId(),
      name: label.trim(),
      email: "",
      startDate,
      endDate,
      guests: 0,
      note: typeof note === "string" && note.trim() ? note.trim() : undefined,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      blocked: true,
    };

    const reservations = await getReservations();
    reservations.push(reservation);
    await saveReservations(reservations);

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (err) {
    console.error("[admin/reservations] POST failed:", err);
    return NextResponse.json(
      { error: "Nepodařilo se uložit blokaci termínu." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Nepřihlášeno." }, { status: 401 });
  }
  try {
    const reservations = await getReservations();
    reservations.sort((a, b) => a.startDate.localeCompare(b.startDate));
    return NextResponse.json({ reservations });
  } catch (err) {
    console.error("[admin/reservations] GET failed:", err);
    return NextResponse.json({ error: "Nepodařilo se načíst rezervace." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Nepřihlášeno." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON tělo požadavku." }, { status: 400 });
  }

  const { id, status } = body as { id?: string; status?: string };
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Chybí id rezervace." }, { status: 400 });
  }
  const validStatuses: Reservation["status"][] = ["pending", "confirmed", "cancelled"];
  if (!status || !validStatuses.includes(status as Reservation["status"])) {
    return NextResponse.json({ error: "Neplatný stav." }, { status: 400 });
  }

  try {
    const reservations = await getReservations();
    const idx = reservations.findIndex((r) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Rezervace nenalezena." }, { status: 404 });
    }
    reservations[idx].status = status as Reservation["status"];
    await saveReservations(reservations);
    return NextResponse.json({ reservation: reservations[idx] });
  } catch (err) {
    console.error("[admin/reservations] PATCH failed:", err);
    return NextResponse.json({ error: "Nepodařilo se uložit změnu." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Nepřihlášeno." }, { status: 401 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Chybí id rezervace." }, { status: 400 });
  }
  try {
    const reservations = await getReservations();
    const next = reservations.filter((r) => r.id !== id);
    await saveReservations(next);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/reservations] DELETE failed:", err);
    return NextResponse.json({ error: "Nepodařilo se smazat rezervaci." }, { status: 500 });
  }
}
