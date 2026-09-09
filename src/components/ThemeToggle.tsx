"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { fetchSunTimes } from "@/lib/suntimes";

const STORAGE_KEY = "chata-theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Light/dark toggle. With no explicit user choice yet, the theme follows
 * the real sunrise/sunset at the cottage (re-checked every few minutes) –
 * an inline script in <head> already applies a same-tick guess before
 * hydration so there's no flash, this just takes over and refines it with
 * the real sun times once they load. Clicking commits to an explicit
 * light/dark choice, saved so it sticks on the next visit. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const overrideRef = useRef<"light" | "dark" | null>(null);

  useEffect(() => {
    const initial = document.documentElement.getAttribute("data-theme");
    if (initial === "light" || initial === "dark") setTheme(initial);

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}

    if (stored === "light" || stored === "dark") {
      overrideRef.current = stored;
      return;
    }

    let cancelled = false;

    async function syncAuto() {
      try {
        const { sunrise, sunset } = await fetchSunTimes();
        if (cancelled || overrideRef.current) return;
        const now = new Date();
        const resolved = now >= sunrise && now < sunset ? "light" : "dark";
        applyTheme(resolved);
        setTheme(resolved);
      } catch {
        // keep whatever the blocking head script already guessed
      }
    }

    syncAuto();
    const interval = setInterval(syncAuto, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    overrideRef.current = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Přepnout na světlý vzhled" : "Přepnout na tmavý vzhled"}
      title={theme === "dark" ? "Přepnout na světlý vzhled" : "Přepnout na tmavý vzhled"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-current transition-colors hover:bg-black/5"
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
