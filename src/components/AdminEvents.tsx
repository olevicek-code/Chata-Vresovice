"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, ExternalLink, MapPin, Pencil, Trash2, X } from "lucide-react";
import type { LocalEvent } from "@/lib/events";
import { formatEventDate } from "@/lib/event-format";

const inputClass =
  "mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-dark outline-none focus:border-forest/40";

const EMPTY_FORM = {
  title: "",
  place: "",
  startDate: "",
  endDate: "",
  url: "",
  description: "",
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function AdminEvents({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formBusy, setFormBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se načíst akce.");
        return;
      }
      setEvents(data.events ?? []);
      setError(null);
    } catch {
      setError("Nepodařilo se spojit se serverem.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(e: LocalEvent) {
    setEditingId(e.id);
    setForm({
      title: e.title,
      place: e.place,
      startDate: e.startDate,
      endDate: e.endDate ?? "",
      url: e.url ?? "",
      description: e.description ?? "",
    });
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Nepodařilo se uložit akci.");
        return;
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch {
      setFormError("Nepodařilo se spojit se serverem.");
    } finally {
      setFormBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Opravdu smazat tuto akci?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se smazat akci.");
        return;
      }
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch {
      setError("Nepodařilo se spojit se serverem.");
    } finally {
      setBusyId(null);
    }
  }

  const today = todayIso();
  const set = (key: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      {!showForm && (
        <button
          onClick={openNew}
          className="mb-5 flex items-center gap-2 rounded-xl bg-forest-dark px-4 py-2 text-sm font-semibold text-cream"
        >
          <CalendarPlus className="h-4 w-4" />
          Přidat akci
        </button>
      )}

      {showForm && (
        <form onSubmit={submit} className="mb-6 rounded-2xl bg-background p-5 ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base text-forest-dark">
              {editingId ? "Upravit akci" : "Nová akce"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-stone/50 hover:text-stone"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-stone">
            Na webu se zobrazují jen akce, které ještě neproběhly.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-stone">
              Název (např. „Kyjovské vinobraní“)
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                required
                minLength={2}
                maxLength={120}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-stone">
              Místo (např. „Kyjov, náměstí“)
              <input
                type="text"
                value={form.place}
                onChange={set("place")}
                required
                minLength={2}
                maxLength={120}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-stone">
              Datum
              <input
                type="date"
                value={form.startDate}
                onChange={set("startDate")}
                required
                className={inputClass}
              />
            </label>
            <label className="text-xs text-stone">
              Do (jen u vícedenních akcí)
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={set("endDate")}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-stone sm:col-span-2">
              Odkaz na víc informací (nepovinné)
              <input
                type="url"
                value={form.url}
                onChange={set("url")}
                placeholder="https://"
                maxLength={500}
                className={inputClass}
              />
            </label>
            <label className="text-xs text-stone sm:col-span-2">
              Krátký popis (nepovinné)
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                maxLength={600}
                className={inputClass}
              />
            </label>
          </div>
          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={formBusy}
            className="mt-4 rounded-xl bg-forest-dark px-4 py-2 text-sm font-semibold text-cream transition-opacity disabled:opacity-50"
          >
            {formBusy ? "Ukládám…" : editingId ? "Uložit změny" : "Přidat akci"}
          </button>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-stone">Načítám…</p>
      ) : events.length === 0 ? (
        <p className="rounded-2xl bg-background p-6 text-sm text-stone ring-1 ring-black/5">
          Zatím žádné akce.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => {
            const past = (ev.endDate ?? ev.startDate) < today;
            return (
              <div
                key={ev.id}
                className={`rounded-2xl bg-background p-5 ring-1 ring-black/5 ${
                  past ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base text-forest-dark">
                      {ev.title}
                      {past && (
                        <span className="ml-2 rounded-full bg-stone/15 px-2.5 py-0.5 align-middle text-xs font-semibold text-stone">
                          Proběhlo
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-stone">
                      {formatEventDate(ev.startDate, ev.endDate)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone">
                      <MapPin className="h-3.5 w-3.5" />
                      {ev.place}
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center gap-1 hover:text-forest-dark"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          odkaz
                        </a>
                      )}
                    </p>
                    {ev.description && (
                      <p className="mt-2 max-w-xl text-sm text-stone/80">{ev.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => openEdit(ev)}
                      disabled={busyId === ev.id}
                      title="Upravit"
                      className="rounded-lg p-1.5 text-stone/50 transition-colors hover:bg-forest/10 hover:text-forest-dark disabled:opacity-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(ev.id)}
                      disabled={busyId === ev.id}
                      title="Smazat"
                      className="rounded-lg p-1.5 text-stone/50 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
