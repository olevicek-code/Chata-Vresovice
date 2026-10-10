import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";

/** "so 17. 10. 2026", or "so 17. – ne 18. 10. 2026" for a multi-day event. */
export function formatEventDate(startDate: string, endDate?: string) {
  const start = parseISO(startDate);
  if (!endDate || endDate === startDate) {
    return format(start, "EEEEEE d. M. yyyy", { locale: cs });
  }
  const end = parseISO(endDate);
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  const startFmt = sameMonth ? "EEEEEE d." : "EEEEEE d. M.";
  return `${format(start, startFmt, { locale: cs })} – ${format(end, "EEEEEE d. M. yyyy", {
    locale: cs,
  })}`;
}
