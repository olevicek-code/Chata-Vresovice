"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, Lock, LogOut, RefreshCw, Trash2 } from "lucide-react";
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
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={loadReservations}
          className="flex items-center gap-1.5 text-sm text-stone hover:text-forest-dark"
        >
          <RefreshCw className="h-4 w-4" />
          Obnovit
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-stone hover:text-forest-dark"
        >
          <LogOut className="h-4 w-4" />
          Odhlásit
        </button>
      </div>

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
                    <span
                      className={`ml-2 rounded-full px-2.5 py-0.5 align-middle text-xs font-semibold ${STATUS_CLASS[r.status]}`}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-stone">
                    {fmtDate(r.startDate)} – {fmtDate(r.endDate)} ·{" "}
                    {r.guests} {r.guests === 1 ? "host" : "hosté"}
                  </p>
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
                  {r.note && (
                    <p className="mt-2 max-w-xl text-sm italic text-stone/80">
                      „{r.note}“
                    </p>
                  )}
                  <p className="mt-2 text-xs text-stone/40">
                    Odesláno {format(parseISO(r.createdAt), "d. M. yyyy H:mm")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
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
                  <button
                    onClick={() => deleteReservation(r.id)}
                    disabled={busyId === r.id}
                    title="Smazat rezervaci"
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
