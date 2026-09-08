"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mountain,
  Waves,
  Landmark,
  Grape,
  Trees,
  X,
  MapPin,
} from "lucide-react";
import AttractionMap from "./AttractionMap";

type Category = "vse" | "priroda" | "pamatky" | "voda" | "vino";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "vse", label: "Vše" },
  { key: "priroda", label: "Příroda a vyhlídky" },
  { key: "pamatky", label: "Památky" },
  { key: "voda", label: "Voda a koupání" },
  { key: "vino", label: "Víno a gastronomie" },
];

const ICONS: Record<Category, typeof Mountain> = {
  vse: MapPin,
  priroda: Mountain,
  pamatky: Landmark,
  voda: Waves,
  vino: Grape,
};

type Attraction = {
  title: string;
  category: Category;
  distance: string;
  short: string;
  long: string;
  lat: number;
  lon: number;
  /** true when the coordinate is an approximate/representative point
   * (e.g. a whole landscape or a village-level centroid) rather than the
   * exact spot – shown as a caveat under the map. */
  approx?: boolean;
  image?: string;
  credit?: string;
  /** set when the photo isn't of this exact spot (e.g. a representative
   * shot of the wider region) rather than the specific place. */
  imageNote?: string;
};

const ATTRACTIONS: Attraction[] = [
  {
    title: "Kyjov",
    category: "pamatky",
    distance: "≈ 9 km, 15 min autem",
    short:
      "Slovácké město s renesanční radniční věží a zámkem, kde sídlí muzeum.",
    long:
      "Nejbližší větší město, správní centrum regionu. Dominantou je renesanční radnice se zvonicí z 2. poloviny 16. století a barokní kostel Nanebevzetí Panny Marie s bývalým kapucínským klášterem. V renesančním zámku sídlí Vlastivědské muzeum Kyjov s etnografickými sbírkami a vzácnou knihovnou. V centru je i aquapark a řada cyklotras začíná přímo ve městě.",
    lat: 49.0104,
    lon: 17.1225,
    image: "/images/attractions/kyjov.jpg",
    credit: "Wikimedia Commons, CC BY-SA 3.0",
  },
  {
    title: "Bukovanský mlýn s vyhlídkou",
    category: "priroda",
    distance: "poblíž Bukovan, kousek za Kyjovem",
    short:
      "Areál zážitků s 15m rozhlednou ve stylu holandského větrného mlýna.",
    long:
      "Oblíbený cíl výletů mezi Bukovany a Ostrovánky. Kromě rozhledny ve tvaru větrného mlýna nabízí ubytování v moravských chaloupkách, restauraci s regionální kuchyní a místními víny, minigolf, ponyfarmu a bazén – ideální na celodenní výlet i s dětmi.",
    lat: 49.0403,
    lon: 17.0912,
    image: "/images/attractions/bukovansky-mlyn.jpg",
    credit: "Petr Dadák, Wikimedia Commons, CC BY-SA 2.0",
  },
  {
    title: "Kyjovský skalní hrádek",
    category: "pamatky",
    distance: "≈ 1 km od Kyjova",
    short: "Zbytky skalního hrádku nad kaňonem řeky Křinice.",
    long:
      "Pozůstatky opevnění na pískovcovém ostrohu se stěnami spadajícími přímo do kaňonu Křinice, včetně dochovaných stop po mechanismu padacího mostu. Váže se k němu i pověst o loupežných rytířích a skrytém pokladu – součást naučné stezky Kyjovským údolím.",
    lat: 49.0014,
    lon: 17.1225,
    approx: true,
  },
  {
    title: "Moravské Toskánsko",
    category: "priroda",
    distance: "okolní krajina",
    short: "Zvlněná krajina vinic, sadů a polí, které připomíná Toskánsko.",
    long:
      "Přezdívka pro mírně zvlněnou krajinu jižní Moravy kolem Kyjova s vinicemi, sady a poli, která svým charakterem připomíná italské Toskánsko. Skvělé místo pro fotografování zapadajícího slunce nebo klidnou cykloprojížďku mezi vinohrady.",
    lat: 49.03,
    lon: 17.1,
    approx: true,
  },
  {
    title: "Přírodní biotop Bohuslavice",
    category: "voda",
    distance: "v regionu Kyjovska",
    short: "Ekologické přírodní koupání bez chemie, ideální na horké dny.",
    long:
      "Přírodní koupací biotop s vlastním systémem přírodního čištění vody bez chlóru. Vhodné pro rodiny s dětmi i pro ty, kdo dávají přednost přírodnímu koupání před klasickým bazénem.",
    lat: 49.0568,
    lon: 17.1165,
    approx: true,
  },
  {
    title: "Vinné sklepy a vinné stezky",
    category: "vino",
    distance: "okolní vinařské obce",
    short: "Historické uličky sklepů a značené cyklostezky mezi vinohrady.",
    long:
      "Kyjovské Slovácko je součástí moravských vinařských oblastí – v okolních obcích najdete tradiční uličky vinných sklepů a několik značených vinných cyklostezek, které spojují místní vinařství. Skvělá příležitost k degustaci a nákupu vína přímo od výrobců.",
    lat: 48.9778,
    lon: 17.0915,
    approx: true,
    image: "/images/attractions/vinne-sklepy.jpg",
    credit: "Wikimedia Commons, CC BY-SA 4.0",
    imageNote: "ilustrační foto – vinné sklepy Petrov-Plže",
  },
  {
    title: "Zámek Milotice",
    category: "pamatky",
    distance: "výlet na celý den",
    short: "Barokní perla jihovýchodní Moravy s francouzským parkem.",
    long:
      "Jeden z nejkrásnějších barokních zámků na Moravě, přestavěný do dnešní podoby začátkem 18. století. Prohlídková trasa vede 17 pokoji a vypráví příběh poslední hraběcí dcery. Areál doplňuje jízdárna, dvě oranžerie a rozlehlý francouzský park – v létě zde bývá i letní kino.",
    lat: 48.9595,
    lon: 17.1377,
    image: "/images/attractions/zamek-milotice.jpg",
    credit: "Wikimedia Commons, CC BY-SA 3.0",
  },
];

export default function AttractionsExplorer() {
  const [active, setActive] = useState<Category>("vse");
  const [selected, setSelected] = useState<Attraction | null>(null);

  const filtered =
    active === "vse"
      ? ATTRACTIONS
      : ATTRACTIONS.filter((a) => a.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === c.key
                ? "bg-forest text-cream"
                : "bg-background text-stone ring-1 ring-black/10 hover:bg-forest/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => {
          const Icon = ICONS[a.category];
          return (
            <motion.button
              key={a.title}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(a)}
              className="flex h-full flex-col overflow-hidden rounded-2xl bg-background text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            >
              {a.image ? (
                <div className="relative aspect-[4/3] w-full shrink-0">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                {!a.image && <Icon className="h-8 w-8 text-forest" />}
                <h3 className={`font-display text-lg text-forest-dark ${a.image ? "" : "mt-4"}`}>
                  {a.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-wood">
                  <MapPin className="h-3.5 w-3.5" />
                  {a.distance}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  {a.short}
                </p>
                <span className="mt-3 inline-block text-xs font-semibold text-forest underline-offset-2 hover:underline">
                  Zobrazit více
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 transition-opacity duration-200 ${
          selected ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSelected(null)}
      >
        {selected && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-8 shadow-xl"
          >
            <button
              aria-label="Zavřít"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 text-stone hover:text-forest-dark"
            >
              <X className="h-5 w-5" />
            </button>

            {selected.image && (
              <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl">
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  sizes="512px"
                  className="object-cover"
                />
              </div>
            )}
            {selected.image && (selected.credit || selected.imageNote) && (
              <p className="-mt-3 mb-3 text-right text-[10px] text-stone/40">
                {selected.imageNote ? `${selected.imageNote} · ` : ""}
                {selected.credit}
              </p>
            )}

            {!selected.image && <Trees className="h-8 w-8 text-forest" />}
            <h3 className={`font-display text-2xl text-forest-dark ${selected.image ? "" : "mt-3"}`}>
              {selected.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-wood">
              <MapPin className="h-3.5 w-3.5" />
              {selected.distance}
            </p>

            <div className="mt-4">
              <AttractionMap
                lat={selected.lat}
                lon={selected.lon}
                label={selected.title}
              />
              {selected.approx && (
                <p className="mt-1.5 text-xs text-stone/60">
                  Poloha na mapě je orientační (přibližný střed oblasti).
                </p>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-stone">
              {selected.long}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
