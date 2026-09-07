"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";
import AttractionMap from "./AttractionMap";

type TrailPoint = {
  title: string;
  tag: string;
  why: string;
  lat: number;
  lon: number;
  /** true when the coordinate is an estimate from the surrounding trail
   * description rather than a verified map point. */
  approx?: boolean;
};

const POINTS: TrailPoint[] = [
  {
    title: "Bradlo – 543 m",
    tag: "skalnatý vrchol",
    why: "Prakticky „domácí hora“ Vřesovic. Z Vřesovic na něj vede zelená přes Koryčanskou kapli; nahoře jsou pískovcové skály a vrcholová kniha KČT Vřesovice.",
    lat: 49.097,
    lon: 17.189,
    approx: true,
  },
  {
    title: "Koryčanská kaple",
    tag: "kaplička v hlubokém lese",
    why: "Asi 2,2 km severně od Vřesovic, na starém Koryčanském chodníku; pochází z 1. poloviny 19. století.",
    lat: 49.0817,
    lon: 17.1991,
  },
  {
    title: "Moravanské louky",
    tag: "přírodní rezervace",
    why: "Staré louky ukryté uprostřed lesů asi 1 km severně od Bradla. Je tam i Mravenčí skála a staré hranečníky.",
    lat: 49.106,
    lon: 17.189,
    approx: true,
  },
  {
    title: "Římský most",
    tag: "starý kamenný most/propustek",
    why: "Zajímavá lesní památka nedaleko Moravanských luk. Název je samozřejmě trochu zavádějící – není to římská stavba.",
    lat: 49.104,
    lon: 17.193,
    approx: true,
  },
  {
    title: "Zubkova studánka",
    tag: "lesní pramen",
    why: "Mezi Vřesovicemi a Koryčanskou kaplí.",
    lat: 49.07,
    lon: 17.207,
    approx: true,
  },
  {
    title: "Kozel",
    tag: "22m skalní věž",
    why: "Jedna z nejvýraznějších skal celých Chřibů, asi 650 m od Cimburku.",
    lat: 49.0976,
    lon: 17.2167,
  },
  {
    title: "Rozštípená skála",
    tag: "skalní útvar",
    why: "Hned v oblasti Kozla; společně tvoří známý horolezecký sektor.",
    lat: 49.098,
    lon: 17.218,
    approx: true,
  },
  {
    title: "Kazatelna – 542 m",
    tag: "8m skalní věž + kříž",
    why: "Za mě jeden z nejlepších bodů. Vytesané schody, nahoře kříž a výhled směrem na Cimburk a Koryčanskou přehradu.",
    lat: 49.095,
    lon: 17.205,
    approx: true,
  },
  {
    title: "Ocásek – 553 m",
    tag: "vrchol + PR",
    why: "Staré karpatské bučiny; rezervace leží jen asi 400 m od Kazatelny.",
    lat: 49.098,
    lon: 17.207,
    approx: true,
  },
  {
    title: "U Mísy",
    tag: "silná studánka",
    why: "Historický zdroj vody pro Cimburk, pěkné místo mezi Kozlem, Kazatelnou a Cimburkem.",
    lat: 49.099,
    lon: 17.213,
    approx: true,
  },
  {
    title: "Zřícenina hradu Cimburk",
    tag: "hrad",
    why: "Jednoznačně jeden z hlavních cílů této části Chřibů.",
    lat: 49.1037,
    lon: 17.2161,
  },
  {
    title: "Svatý Kliment / Klimentek",
    tag: "archeologická lokalita",
    why: "Velmi zajímavé místo spojené s velkomoravskou a cyrilometodějskou tradicí.",
    lat: 49.078,
    lon: 17.23,
    approx: true,
  },
  {
    title: "Hroby – 504 m",
    tag: "lesní vrchol/hřeben",
    why: "Méně známá část hlavního hřebene mezi Ocáskem a oblastí Holého kopce.",
    lat: 49.1009,
    lon: 17.2534,
  },
  {
    title: "Holý kopec – 548 m",
    tag: "výrazný vrchol",
    why: "Archeologicky zajímavá oblast a jeden z výraznějších vrcholů centrálních Chřibů.",
    lat: 49.12,
    lon: 17.27,
    approx: true,
  },
  {
    title: "Buchlovský kámen",
    tag: "skalní útvar",
    why: "Velký izolovaný balvan/skála v buchlovské části Chřibů.",
    lat: 49.1368,
    lon: 17.2993,
  },
  {
    title: "Břestecká skála",
    tag: "skály + výhled",
    why: "Jedna z nejhezčích skalnatých oblastí severovýchodní části Chřibů.",
    lat: 49.1115,
    lon: 17.3356,
  },
  {
    title: "Hrad Buchlov",
    tag: "hrad + výrazný kopec",
    why: "Už trochu dál od Vřesovic, ale pořád v rámci Chřibů.",
    lat: 49.1073,
    lon: 17.311,
  },
  {
    title: "Rozhledna Brdo",
    tag: "587 m – nejvyšší vrchol Chřibů",
    why: "Kamenná rozhledna a nejvyšší bod celého pohoří.",
    lat: 49.1709,
    lon: 17.3086,
  },
  {
    title: "Čertovy kameny",
    tag: "skály",
    why: "Méně známý skalní útvar u Střílek.",
    lat: 49.1345,
    lon: 17.2178,
  },
  {
    title: "Zikmundova skála",
    tag: "skalní útvar",
    why: "Zajímavé místo v osvětimanské části Chřibů.",
    lat: 49.0816,
    lon: 17.2418,
  },
];

export default function ChribyTrails() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="divide-y divide-black/5 overflow-hidden rounded-2xl bg-background ring-1 ring-black/5">
        {POINTS.map((point, i) => {
          const isOpen = activeIndex === i;
          return (
            <div key={point.title}>
              <button
                onClick={() => setActiveIndex(isOpen ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-forest/5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wood-light text-xs font-bold text-forest-dark">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-base text-forest-dark">
                    {point.title}
                  </span>
                  <span className="block text-xs text-wood">{point.tag}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-stone transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="px-5 pb-5 pl-16">
                      <p className="text-sm leading-relaxed text-stone">
                        {point.why}
                      </p>
                      <div className="mt-3">
                        <AttractionMap lat={point.lat} lon={point.lon} label={point.title} />
                      </div>
                      {point.approx && (
                        <span className="mt-1.5 flex items-center gap-1 text-xs text-stone/50">
                          <MapPin className="h-3 w-3" />
                          Poloha na mapě je orientační.
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
