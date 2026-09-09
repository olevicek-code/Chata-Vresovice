import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import { getReservations } from "@/lib/reservations";
import { reservationToICS } from "@/lib/ics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isValidSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Nepřihlášeno." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const reservations = await getReservations();
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) {
      return NextResponse.json({ error: "Rezervace nenalezena." }, { status: 404 });
    }

    const ics = reservationToICS(reservation);
    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="rezervace-${reservation.id}.ics"`,
      },
    });
  } catch (err) {
    console.error("[admin/reservations/ics] failed:", err);
    return NextResponse.json(
      { error: "Nepodařilo se vygenerovat kalendářní soubor." },
      { status: 500 }
    );
  }
}
