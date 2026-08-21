"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, TreePine } from "lucide-react";

const HOME_LINKS = [
  { href: "/#o-chate", label: "O chatě", id: "o-chate" },
  { href: "/#historie", label: "Historie", id: "historie" },
  { href: "/#okoli", label: "Okolí", id: "okoli" },
  { href: "/#galerie", label: "Galerie", id: "galerie" },
  { href: "/#faq", label: "FAQ", id: "faq" },
  { href: "/#kontakt", label: "Kontakt", id: "kontakt" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = HOME_LINKS.map((l) =>
      document.getElementById(l.id)
    ).filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-medium text-forest-dark"
        >
          <TreePine className="h-6 w-6 text-forest" />
          Chata Vřesovice
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {HOME_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors hover:text-forest-dark ${
                active === link.id ? "text-forest-dark" : "text-stone"
              }`}
            >
              {link.label}
              {active === link.id && (
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-wood-light" />
              )}
            </Link>
          ))}
          <Link
            href="/rezervace"
            className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest-dark"
          >
            Rezervovat pobyt
          </Link>
        </nav>

        <button
          className="md:hidden"
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-6 w-6 text-forest-dark" />
          ) : (
            <Menu className="h-6 w-6 text-forest-dark" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-cream px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {HOME_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`text-sm font-medium hover:text-forest-dark ${
                  active === link.id ? "text-forest-dark" : "text-stone"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/rezervace"
              onClick={closeMenu}
              className="w-fit rounded-full bg-forest px-5 py-2 text-sm font-semibold text-cream"
            >
              Rezervovat pobyt
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
