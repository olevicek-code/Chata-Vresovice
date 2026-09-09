"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, Ban, Lock, LogOut, RefreshCw, Trash2, X } from "lucide-react";
import type { Reservation } from "@/lib/reservations";

type ViewState = "checking" | "login" | "ready";

const STATUS_LABEL: Record<Reservation["status"], string> = {
  pending: "Čeká na potvrzení",
  confirmed: "Potvrzeno",
  cancelled: "Zrušeno",
};

const STATUS_CLASS: Record<Reservation["status"], string> = {
  pending: "bg-wood-light/30 text-wood",
  confirmed: "bg-forest/15 text-forest-dark",
  cancelled: "bg-stone/15 text-stone/70",
};

function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "d. M. yyyy");
  } catch {
    return iso;
  }
}

export default function AdminApp() {
  const [view, setView] = useState<ViewState>("checking");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockLabel, setBlockLabel] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockNote, setBlockNote] = useState("");
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockBusy, setBlockBusy] = useState(false);

  const loadReservations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reservations", { cache: "no-store" });
      if (res.status === 401) {
        setView("login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setListError(data.error ?? "Nepodařilo se načíst rezervace.");
        setView("ready");
        return;
      }
      setReservations(data.reservations ?? []);
      setListError(null);
      setView("ready");
    } catch {
      setListError("Nepodařilo se spojit se serverem.");
      setView("ready");
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error ?? "Přihlášení se nezdařilo.");
        return;
      }
      setPassword("");
      await loadReservations();
    } catch {
      setLoginError("Nepodařilo se spojit se serverem.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setReservations([]);
    setView("login");
  }

  async function updateStatus(id: string, status: Reservation["status"]) {
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setView("login");
        return;
      }
      if (!res.ok) {
        setActionError(data.error ?? "Nepodařilo se uložit změnu stavu.");
        return;
      }
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      setActionError("Nepodařilo se spojit se serverem.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReservation(id: string) {
    if (!window.confirm("Opravdu trvale smazat tuto rezervaci?")) return;
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/reservations?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setView("login");
        return;
      }
      if (!res.ok) {
        setActionError(data.error ?? "Nepodařilo se smazat rezervaci.");
        return;
      }
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setActionError("Nepodařilo se spojit se serverem.");
    } finally {
      setBusyId(null);
    }
  }

  async function submitBlock(e: React.FormEvent) {
    e.preventDefault();
    setBlockBusy(true);
    setBlockError(null);
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: blockLabel,
          startDate: blockStart,
          endDate: blockEnd,
          note: blockNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setView("login");
        return;
      }
      if (!res.ok) {
        setBlockError(data.error ?? "Nepodařilo se zablokovat termín.");
        return;
      }
      setReservations((prev) =>
        [...prev, data.reservation as Reservation].sort((a, b) =>
          a.startDate.localeCompare(b.startDate)
        )
      );
      setBlockLabel("");
      setBlockStart("");
      setBlockEnd("");
      setBlockNote("");
      setShowBlockForm(false);
    } catch {
      setBlockError("Nepodařilo se spojit se serverem.");
    } finally {
      setBlockBusy(false);
    }
  }

  if (view === "checking") {
    return <p className="text-sm text-stone">Načítám…</p>;
  }

  if (view === "login") {
    return (
      <form
        onSubmit={handleLogin}
        className="max-w-sm rounded-2xl bg-background p-6 ring-1 ring-black/5"
      >
        <div className="flex items-center gap-2 text-forest-dark">
          <Lock className="h-5 w-5" />
          <h2 className="font-display text-lg font-medium">Přihlášení</h2>
        </div>
        <p className="mt-2 text-sm text-stone">
          Tato stránka je jen pro správu chaty.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Heslo"
          autoFocus
          className="mt-4 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-forest-dark outline-none focus:border-forest/40"
        />
        {loginError && (
          <p className="mt-2 text-sm text-red-600">{loginError}</p>
        )}
        <button
          type="submit"
          disabled={loginBusy || !password}
          className="mt-4 w-full rounded-xl bg-forest-dark px-4 py-2.5 text-sm font-semibold text-cream transition-opacity disabled:opacity-50"
        >
          {loginBusy ? "Přihlašuji…" : "Přihlásit"}
        </button>
      </form>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={loadReservations}
            className="flex items-center gap-1.5 text-sm text-stone hover:text-forest-dark"
          >
            <RefreshCw className="h-4 w-4" />
            Obnovit
          </button>
          <button
            onClick={() => setShowBlockForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-stone hover:text-forest-dark"
          >
            <Ban className="h-4 w-4" />
            Zablokovat termín
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-stone hover:text-forest-dark"
        >
          <LogOut className="h-4 w-4" />
          Odhlásit
        </button>
      </div>

      {showBlockForm && (
        <form
          onSubmit={submitBlock}
          className="mb-5 rounded-2xl bg-background p-5 ring-1 ring-black/5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base text-forest-dark">
              Zablokovat termín
            </h3>
            <button
              type="button"
              onClick={() => setShowBlockForm(false)}
              className="text-stone/50 hover:text-stone"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-stone">
            Termín se v kalendáři na webu zobrazí jako obsazený, bez toho,
            aby musel poslat žádost skutečný host.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-stone">
              Popis (např. „Rodinná dovolená“)
              <input
                type="text"
                value={blockLabel}
                onChange={(e) => setBlockLabel(e.target.value)}
                required
                minLength={2}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest/40"
              />
            </label>
            <label className="text-xs text-stone">
              Poznámka (nepovinné)
              <input
                type="text"
                value={blockNote}
                onChange={(e) => setBlockNote(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest/40"
              />
            </label>
            <label className="text-xs text-stone">
              Od
              <input
                type="date"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest/40"
              />
            </label>
            <label className="text-xs text-stone">
              Do
              <input
                type="date"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest/40"
              />
            </label>
          </div>
          {blockError && (
            <p className="mt-3 text-sm text-red-600">{blockError}</p>
          )}
          <button
            type="submit"
            disabled={blockBusy}
            className="mt-4 rounded-xl bg-forest-dark px-4 py-2 text-sm font-semibold text-cream transition-opacity disabled:opacity-50"
          >
            {blockBusy ? "Ukládám…" : "Zablokovat"}
          </button>
        </form>
      )}

      {listError && <p className="mb-4 text-sm text-red-600">{listError}</p>}
      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {actionError}
        </p>
      )}

      {reservations.length === 0 && !listError ? (
        <p className="rounded-2xl bg-background p-6 text-sm text-stone ring-1 ring-black/5">
          Zatím žádné rezervace.
        </p>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-background p-5 ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-forest-dark">
                    {r.name}{" "}
                    {r.blocked ? (
                      <span className="ml-2 rounded-full bg-black/10 px-2.5 py-0.5 align-middle text-xs font-semibold text-forest-dark/70">
                        Zablokováno
                      </span>
                    ) : (
                      <span
                        className={`ml-2 rounded-full px-2.5 py-0.5 align-middle text-xs font-semibold ${STATUS_CLASS[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-stone">
                    {fmtDate(r.startDate)} – {fmtDate(r.endDate)}
                    {!r.blocked && (
                      <>
                        {" "}
                        · {r.guests} {r.guests === 1 ? "host" : "hosté"}
                      </>
                    )}
                  </p>
                  {!r.blocked && (
                    <p className="mt-1 text-sm text-stone">
                      <a href={`mailto:${r.email}`} className="hover:text-forest-dark">
                        {r.email}
                      </a>
                      {r.phone && (
                        <>
                          {" · "}
                          <a href={`tel:${r.phone}`} className="hover:text-forest-dark">
                            {r.phone}
                          </a>
                        </>
                      )}
                    </p>
                  )}
                  {r.note && (
                    <p className="mt-2 max-w-xl text-sm italic text-stone/80">
                      „{r.note}“
                    </p>
                  )}
                  <p className="mt-2 text-xs text-stone/40">
                    {r.blocked ? "Vytvořeno" : "Odesláno"}{" "}
                    {format(parseISO(r.createdAt), "d. M. yyyy H:mm")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!r.blocked && (
                    <>
                      <select
                        value={r.status}
                        disabled={busyId === r.id}
                        onChange={(e) =>
                          updateStatus(r.id, e.target.value as Reservation["status"])
                        }
                        className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs text-forest-dark outline-none disabled:opacity-50"
                      >
                        <option value="pending">Čeká na potvrzení</option>
                        <option value="confirmed">Potvrdit</option>
                        <option value="cancelled">Zrušit</option>
                      </select>
                      <a
                        href={`/api/admin/reservations/${r.id}/ics`}
                        title="Export do kalendáře (.ics)"
                        className="rounded-lg p-1.5 text-stone/50 transition-colors hover:bg-forest/10 hover:text-forest-dark"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => deleteReservation(r.id)}
                    disabled={busyId === r.id}
                    title={r.blocked ? "Zrušit blokaci" : "Smazat rezervaci"}
                    className="rounded-lg p-1.5 text-stone/50 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
