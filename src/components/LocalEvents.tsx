import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { ExternalLink, MapPin } from "lucide-react";
import type { LocalEvent } from "@/lib/events";
import { formatEventDate } from "@/lib/event-format";

const MAX_SHOWN = 6;

export default function LocalEvents({ events }: { events: LocalEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-wood">
        Akce v okolí
      </p>
      <h3 className="mt-2 font-display text-2xl font-medium text-forest-dark sm:text-3xl">
        Co se chystá na Kyjovsku
      </h3>
      <p className="mt-3 max-w-2xl text-sm text-stone">
        Vinobraní, hody, trhy a koncerty – podívejte se, co se děje v okolí
        v době vašeho pobytu.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.slice(0, MAX_SHOWN).map((ev) => {
          const start = parseISO(ev.startDate);
          return (
            <li
              key={ev.id}
              className="flex gap-4 rounded-2xl bg-background p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-forest-dark text-cream">
                <span className="font-display text-2xl leading-none">{format(start, "d")}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-cream/70">
                  {format(start, "LLL", { locale: cs })}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-display text-base leading-snug text-forest-dark">{ev.title}</p>
                <p className="mt-1 text-xs text-stone">
                  {formatEventDate(ev.startDate, ev.endDate)}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-stone">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{ev.place}</span>
                </p>
                {ev.description && (
                  <p className="mt-2 text-sm leading-relaxed text-stone">{ev.description}</p>
                )}
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-wood hover:text-forest-dark"
                  >
                    Více informací
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
