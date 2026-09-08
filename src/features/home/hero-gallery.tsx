"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/ui/content-image";
import type { HeroSlide } from "@/lib/cms/domain";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function HeroGallery({ slides }: { slides: readonly HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const galleryId = useId();
  const current = slides[active];
  const multiple = slides.length > 1;

  if (!current) return null;

  const select = (index: number) => {
    const next = (index + slides.length) % slides.length;
    setVisited((previous) => new Set([...previous, next]));
    setActive(next);
  };

  return (
    <div aria-label="Life at Jerusalem Youth" aria-roledescription={multiple ? "carousel" : undefined} role="region">
      <div className="overflow-hidden rounded-large bg-secondary text-white">
        <div
          className="relative aspect-[4/3] touch-pan-y bg-surface"
          id={galleryId}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
          }}
          onTouchCancel={() => { touchStart.current = null; }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            const end = event.changedTouches[0];
            if (!start || !end || !multiple) return;
            const dx = end.clientX - start.x;
            const dy = end.clientY - start.y;
            if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              select(active + (dx < 0 ? 1 : -1));
            }
          }}
        >
          {slides.map((slide, index) => visited.has(index) ? (
            <div
              aria-hidden={index !== active}
              aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
              aria-roledescription="slide"
              role="group"
              className={`absolute inset-0 transition-opacity duration-normal ease-standard motion-reduce:transition-none ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
              key={index}
            >
              {failed.has(index) ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-muted">
                  This photograph is unavailable. {multiple ? "Explore another moment using the controls below." : ""}
                </div>
              ) : (
                <ContentImage
                  asset={slide.image}
                  className="h-full w-full object-cover"
                  loading="eager"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  onError={() => setFailed((previous) => new Set([...previous, index]))}
                  sizes="(min-width: 1280px) 720px, (min-width: 1024px) 55vw, 100vw"
                />
              )}
            </div>
          ) : null)}
        </div>
        <div className="flex min-h-32 items-start gap-5 p-6 sm:p-8">
          <span aria-hidden="true" className="font-display text-heading-3 font-bold text-accent">
            {String(active + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="font-label text-label font-bold uppercase">{current.label}</p>
            {current.caption ? <p className="mt-2 text-body-small">{current.caption}</p> : null}
          </div>
        </div>
      </div>
      {hydrated && multiple ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div aria-label="Choose a photograph" className="flex flex-wrap gap-2" role="group">
            {slides.map((slide, index) => (
              <Button
                aria-controls={galleryId}
                aria-label={`Show photograph ${index + 1}: ${slide.label}`}
                aria-pressed={index === active}
                className={index === active ? "underline underline-offset-4" : undefined}
                key={index}
                onClick={() => select(index)}
                variant={index === active ? "primary" : "outline"}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="hidden xl:inline">{slide.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button aria-controls={galleryId} aria-label="Previous photograph" onClick={() => select(active - 1)} variant="outline">
              <span aria-hidden="true">←</span>
            </Button>
            <Button aria-controls={galleryId} aria-label="Next photograph" onClick={() => select(active + 1)} variant="outline">
              <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      ) : null}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {visited.size > 1 ? `Photograph ${active + 1} of ${slides.length}: ${current.label}` : ""}
      </p>
    </div>
  );
}
