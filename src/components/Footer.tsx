import Link from "next/link";
import { TreePine, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="kontakt" className="bg-forest-dark text-cream/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-lg text-cream">
            <TreePine className="h-5 w-5" />
            Chata Vřesovice
          </div>
          <p className="mt-3 max-w-xs text-sm text-cream/70">
            Místo, kam se rádi vracíme. Odpočinek, klid přírody a chvíle
            strávené s lidmi, na kterých nám záleží.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Kontakt</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream/70">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:info@chatavresovice.cz"
                className="hover:text-cream"
              >
                info@chatavresovice.cz
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+420000000000" className="hover:text-cream">
                +420 000 000 000
              </a>
            </li>
            <li className="text-cream/50">
              (Kontaktní údaje jsou zatím placeholder – nahraďte vlastními.)
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base text-cream">Rychlé odkazy</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream/70">
            <li>
              <Link href="/#o-chate" className="hover:text-cream">
                O chatě
              </Link>
            </li>
            <li>
              <Link href="/#okoli" className="hover:text-cream">
                Okolí
              </Link>
            </li>
            <li>
              <Link href="/#galerie" className="hover:text-cream">
                Galerie
              </Link>
            </li>
            <li>
              <Link href="/rezervace" className="hover:text-cream">
                Rezervace
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Chata Vřesovice. Vytvořeno s láskou k
        přírodě.
      </div>
    </footer>
  );
}
