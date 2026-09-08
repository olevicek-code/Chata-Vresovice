import { format } from "date-fns";
import { cs } from "date-fns/locale";

/**
 * Sends reservation notification e-mails via the Resend HTTP API directly
 * (plain fetch, no `resend` npm package) so adding this feature needs no
 * new dependency – just a RESEND_API_KEY.
 *
 * Required/optional env vars (set in Vercel → Project → Settings →
 * Environment Variables):
 * - RESEND_API_KEY        (required – from resend.com, free tier is fine)
 * - RESERVATION_NOTIFY_EMAIL   (owner's inbox for new-request alerts;
 *                                if unset, only the guest gets an e-mail)
 * - RESERVATION_FROM_EMAIL     (optional; defaults to Resend's shared
 *                                onboarding@resend.dev sender, which works
 *                                without verifying a domain)
 */

const RESEND_API_URL = "https://api.resend.com/emails";

function formatDate(iso: string) {
  return format(new Date(`${iso}T00:00:00`), "d. M. yyyy", { locale: cs });
}

async function sendEmail(payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY není nastavený – e-mail se neodeslal.");
    return;
  }
  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[email] Resend vrátil chybu:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] Odeslání selhalo:", err);
  }
}

export async function sendReservationEmails(reservation: {
  name: string;
  email: string;
  phone?: string;
  startDate: string;
  endDate: string;
  guests: number;
  note?: string;
}) {
  const from = process.env.RESERVATION_FROM_EMAIL || "Chata Vřesovice <onboarding@resend.dev>";
  const ownerEmail = process.env.RESERVATION_NOTIFY_EMAIL;
  const dateRange = `${formatDate(reservation.startDate)} – ${formatDate(reservation.endDate)}`;

  const tasks: Promise<void>[] = [];

  if (ownerEmail) {
    tasks.push(
      sendEmail({
        from,
        to: ownerEmail,
        subject: `Nová žádost o rezervaci – ${reservation.name}`,
        html: `
          <h2>Nová žádost o rezervaci</h2>
          <p><strong>Jméno:</strong> ${reservation.name}</p>
          <p><strong>E-mail:</strong> ${reservation.email}</p>
          ${reservation.phone ? `<p><strong>Telefon:</strong> ${reservation.phone}</p>` : ""}
          <p><strong>Termín:</strong> ${dateRange}</p>
          <p><strong>Počet osob:</strong> ${reservation.guests}</p>
          ${reservation.note ? `<p><strong>Poznámka:</strong> ${reservation.note}</p>` : ""}
        `,
      })
    );
  }

  tasks.push(
    sendEmail({
      from,
      to: reservation.email,
      subject: "Přijali jsme vaši žádost o rezervaci – Chata Vřesovice",
      html: `
        <h2>Děkujeme za vaši žádost, ${reservation.name}!</h2>
        <p>Přijali jsme žádost o rezervaci na termín <strong>${dateRange}</strong>
        pro ${reservation.guests} ${reservation.guests === 1 ? "osobu" : "osoby/osob"}.</p>
        <p>Brzy se vám ozveme s potvrzením.</p>
        <p>Chata Vřesovice</p>
      `,
    })
  );

  await Promise.allSettled(tasks);
}
