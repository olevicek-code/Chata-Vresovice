"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import TiltCard from "./TiltCard";
import type { Photo } from "@/lib/photo-sections";

// Shown until real photos are uploaded from the admin page.
const PLACEHOLDER_IMAGES = [
  { label: "Exteriér chaty", gradient: "from-forest/40 via-wood-light/30 to-forest/10" },
  { label: "Obývací pokoj s krbem", gradient: "from-wood/40 via-wood-light/20 to-background" },
  { label: "Ložnice", gradient: "from-forest/30 via-background to-wood-light/30" },
  { label: "Kuchyň", gradient: "from-wood-light/40 via-forest/10 to-forest/30" },
  { label: "Zahrada a terasa", gradient: "from-forest/50 via-forest/10 to-wood-light/20" },
  { label: "Výhled do okolí", gradient: "from-wood-light/30 via-forest/20 to-forest/40" },
];

const SWIPE_THRESHOLD_PX = 50;

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const hasPhotos = photos.length > 0;
  const count = hasPhotos ? photos.length : PLACEHOLDER_IMAGES.length;

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + count) % count)),
    [count]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % count)),
    [count]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, prev, next]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > SWIPE_THRESHOLD_PX) prev();
    else if (dx < -SWIPE_THRESHOLD_PX) next();
  }

  const active = activeIndex === null ? null : activeIndex;

  return (
    <section id="galerie" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-5">
        <AnimatedSection>
          <p className="text-sm font-semibold uppercase tracking-widest text-wood">
            Galerie
          </p>
          <h2 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
            Chata v obrazech
          </h2>
          {!hasPhotos && (
            <p className="mt-4 max-w-2xl text-base text-stone">
              Fotografie chaty brzy doplníme.
            </p>
          )}
        </AnimatedSection>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {hasPhotos
            ? photos.map((photo, i) => (
                <AnimatedSection key={photo.id} delay={Math.min(i, 8) * 0.04}>
                  <TiltCard>
                    <button
                      onClick={() => setActiveIndex(i)}
                      aria-label={photo.caption || `Fotka ${i + 1}`}
                      className="group relative block aspect-square w-full overflow-hidden rounded-xl shadow-sm"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.caption}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {photo.caption && (
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-left text-xs font-medium text-cream">
                          {photo.caption}
                        </span>
                      )}
                    </button>
                  </TiltCard>
                </AnimatedSection>
              ))
            : PLACEHOLDER_IMAGES.map((img, i) => (
                <AnimatedSection key={img.label} delay={i * 0.04}>
                  <TiltCard>
                    <button
                      onClick={() => setActiveIndex(i)}
                      className={`relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${img.gradient} text-center shadow-sm`}
                    >
                      <ImageIcon className="h-7 w-7 text-forest-dark/60" />
                      <span className="px-3 text-xs font-medium text-forest-dark/80">
                        {img.label}
                      </span>
                    </button>
                  </TiltCard>
                </AnimatedSection>
              ))}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 transition-opacity duration-200 sm:p-6 ${
          active !== null ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active !== null && (
          <>
            <button
              aria-label="Zavřít"
              className="absolute right-4 top-4 z-10 text-cream/80 hover:text-cream sm:right-6 sm:top-6"
              onClick={close}
            >
              <X className="h-7 w-7" />
            </button>

            <button
              aria-label="Předchozí"
              className="absolute left-2 z-10 text-cream/80 hover:text-cream sm:left-8"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft className="h-9 w-9" />
            </button>

            {hasPhotos ? (
              <figure
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-full w-full max-w-5xl flex-col items-center"
              >
                <div className="relative h-[75vh] w-full">
                  <Image
                    key={photos[active].id}
                    src={photos[active].url}
                    alt={photos[active].caption}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </div>
                <figcaption className="mt-3 text-center text-sm text-cream/80">
                  {photos[active].caption}
                  <span className="ml-2 text-cream/40">
                    {active + 1} / {photos.length}
                  </span>
                </figcaption>
              </figure>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`flex aspect-[4/3] w-full max-w-xl flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br ${PLACEHOLDER_IMAGES[active].gradient} text-center`}
              >
                <ImageIcon className="h-10 w-10 text-forest-dark/60" />
                <p className="font-medium text-forest-dark/90">
                  {PLACEHOLDER_IMAGES[active].label}
                </p>
              </div>
            )}

            <button
              aria-label="Další"
              className="absolute right-2 z-10 text-cream/80 hover:text-cream sm:right-8"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
