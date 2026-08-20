"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format, addDays } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type BookedRange = { id: string; startDate: string; endDate: string };

function toISODate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function eachDateInRange(start: Date, end: Date) {
  const dates: Date[] = [];
  let cur = start;
  while (cur < end) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

export default function ReservationApp() {
  const [booked, setBooked] = useState<BookedRange[]>([]);
  const [loadingBooked, setLoadingBooked] = useState(true);
  const [range, setRange] = useState<DateRange | undefined>();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);

  useEffect(() => {
    fetch("/api/reservations")
      .then((r) => r.json())
      .then((data) => setBooked(data.reservations ?? []))
      .catch(() => setBooked([]))
      .finally(() => setLoadingBooked(false));
  }, []);

  const disabledDays = useMemo(() => {
    const disabled: Date[] = [{ before: new Date() } as unknown as Date];
    booked.forEach((b) => {
      const start = new Date(b.startDate + "T00:00:00");
      const end = new Date(b.endDate + "T00:00:00");
      disabled.push(...eachDateInRange(start, end));
    });
    return disabled;
  }, [booked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!range?.from || !range?.to) {
      setResult({ type: "error", message: "Vyberte prosím termín příjezdu a odjezdu v kalendáři." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startDate: toISODate(range.from),
          endDate: toISODate(range.to),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", message: data.error ?? "Něco se nepodařilo." });
      } else {
        setResult({
          type: "success",
          message: "Vaše žádost o rezervaci byla odeslána! Ozveme se vám s potvrzením.",
        });
        setBooked((prev) => [
          ...prev,
          { id: data.reservation.id, startDate: data.reservation.startDate, endDate: data.reservation.endDate },
        ]);
        setRange(undefined);
        setForm({ name: "", email: "", phone: "", guests: 2, note: "" });
      }
    } catch {
      setResult({ type: "error", message: "Nepodařilo se odeslat žádost. Zkuste to prosím znovu." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="rounded-2xl bg-background p-6 shadow-sm ring-1 ring-black/5">
        <h3 className="font-display text-xl text-forest-dark">
          Vyberte termín
        </h3>
        <p className="mt-1 text-sm text-stone">
          Obsazené dny jsou v kalendáři neaktivní. Vyberte den příjezdu a
          odjezdu.
        </p>

        {loadingBooked ? (
          <div className="flex h-64 items-center justify-center text-stone">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <DayPicker
              mode="range"
              locale={cs}
              selected={range}
              onSelect={setRange}
              disabled={disabledDays}
              excludeDisabled
              numberOfMonths={1}
              className="!m-0"
            />
          </div>
        )}

        {range?.from && (
          <p className="mt-3 text-center text-sm text-forest-dark">
            {format(range.from, "d. M. yyyy")}
            {range.to ? ` – ${format(range.to, "d. M. yyyy")}` : " (vyberte odjezd)"}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-background p-6 shadow-sm ring-1 ring-black/5">
        <h3 className="font-display text-xl text-forest-dark">
          Vaše údaje
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-forest-dark">
                Jméno a příjmení
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest"
                placeholder="Jan Novák"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-dark">
                Počet osob
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={form.guests}
                onChange={(e) =>
                  setForm({ ...form, guests: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-forest-dark">
              E-mail
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest"
              placeholder="jan.novak@email.cz"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-forest-dark">
              Telefon (nepovinné)
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest"
              placeholder="+420 xxx xxx xxx"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-forest-dark">
              Poznámka (nepovinné)
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest"
              placeholder="Např. přibližný čas příjezdu, speciální požadavky..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-forest-dark disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarCheck className="h-4 w-4" />
            )}
            Odeslat žádost o rezervaci
          </button>

          {result && (
            <div
              className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
                result.type === "success"
                  ? "bg-forest/10 text-forest-dark"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              {result.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
