"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, MapPin } from "lucide-react";
import AttractionMap from "./AttractionMap";
import { CHRIBY_POINTS } from "@/data/chriby-points";

export default function ChribyTrails() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="divide-y divide-black/5 overflow-hidden rounded-2xl bg-background ring-1 ring-black/5">
        {CHRIBY_POINTS.map((point, i) => {
          const isOpen = activeIndex === i;
          return (
            <div key={point.title}>
              <button
                onClick={() => setActiveIndex(isOpen ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-forest/5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wood-light text-xs font-bold text-[#1d2f26]">
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
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  {isOpen && (
                    <div className="px-5 pb-5 pl-16">
                      {point.image && (
                        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl">
                          <Image
                            src={point.image}
                            alt={point.title}
                            fill
                            sizes="512px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      {point.image && point.credit && (
                        <p className="-mt-2 mb-2 text-right text-[10px] text-stone/40">
                          {point.credit}
                        </p>
                      )}
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
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
