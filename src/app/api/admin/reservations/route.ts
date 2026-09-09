import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import { getReservations, saveReservations, type Reservation } from "@/lib/reservations";

function isAuthed(request: NextRequest) {
  return isValidSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
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
