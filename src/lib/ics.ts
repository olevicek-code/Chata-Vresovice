import type { Reservation } from "./reservations";

function icsDate(dateStr: string) {
  // YYYY-MM-DD -> YYYYMMDD, the all-day DATE value ICS expects.
  return dateStr.replace(/-/g, "");
}

function escapeICSText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Builds a single-event .ics file for one reservation. Dates are
 * all-day (VALUE=DATE) with DTEND exclusive, matching how startDate/
 * endDate are already treated everywhere else (see rangesOverlap in
 * reservations.ts) – so DTEND needs no +1 day adjustment.
 */
export function reservationToICS(reservation: Reservation): string {
  const uid = `${reservation.id}@chatavresovice.cz`;
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const summary = `Chata Vřesovice – ${reservation.name}`;

  const statusLabel = {
    pending: "čeká na potvrzení",
    confirmed: "potvrzeno",
    cancelled: "zrušeno",
  }[reservation.status];

  const descriptionLines = [
    `Host: ${reservation.name}`,
    `E-mail: ${reservation.email}`,
    reservation.phone ? `Telefon: ${reservation.phone}` : null,
    `Počet hostů: ${reservation.guests}`,
    `Stav: ${statusLabel}`,
    reservation.note ? `Poznámka: ${reservation.note}` : null,
  ].filter((line): line is string => Boolean(line));

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chata Vresovice//Rezervace//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${icsDate(reservation.startDate)}`,
    `DTEND;VALUE=DATE:${icsDate(reservation.endDate)}`,
    `SUMMARY:${escapeICSText(summary)}`,
    `DESCRIPTION:${escapeICSText(descriptionLines.join("\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
