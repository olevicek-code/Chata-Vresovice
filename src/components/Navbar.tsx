"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, TreePine } from "lucide-react";

const HOME_LINKS = [
  { href: "/#o-chate", label: "O chatě" },
  { href: "/#okoli", label: "Okolí" },
  { href: "/#galerie", label: "Galerie" },
  { href: "/#kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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

        <nav className="hidden items-center gap-8 md:flex">
          {HOME_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone transition-colors hover:text-forest-dark"
            >
              {link.label}
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
                className="text-sm font-medium text-stone hover:text-forest-dark"
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
