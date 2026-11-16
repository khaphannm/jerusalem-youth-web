"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";

import { ContentImage } from "@/components/ui/content-image";
import type { HeroSlide } from "@/lib/cms/domain";

const arrowButton =
  "flex size-11 items-center justify-center rounded-full bg-surface text-foreground transition-[background-color,color,scale] duration-fast ease-standard hover:bg-foreground hover:text-background active:scale-95 motion-reduce:transition-none";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function HeroGallery({
  slides,
  locale = "en",
}: {
  slides: readonly HeroSlide[];
  locale?: "en" | "vi";
}) {
  const vi = locale === "vi";
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
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
    <div
      aria-label={
        vi ? "Khoảnh khắc tại Jerusalem Youth" : "Life at Jerusalem Youth"
      }
      aria-roledescription={multiple ? (vi ? "bộ ảnh" : "carousel") : undefined}
      role="region"
    >
      <div className="motion-settle overflow-hidden rounded-large bg-surface sm:rounded-xlarge">
        <div
          className="relative aspect-[4/3] touch-pan-y sm:aspect-[16/9]"
          id={galleryId}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current =
              event.touches.length === 1
                ? { x: touch.clientX, y: touch.clientY }
                : null;
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
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
          {slides.map((slide, index) =>
            visited.has(index) ? (
              <div
                aria-hidden={index !== active}
                aria-label={
                  vi
                    ? `${index + 1} trên ${slides.length}: ${slide.label}`
                    : `${index + 1} of ${slides.length}: ${slide.label}`
                }
                aria-roledescription={vi ? "ảnh" : "slide"}
                role="group"
                className={`absolute inset-0 transition-[opacity,scale] duration-slow ease-emphasized motion-reduce:transition-none ${index === active ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"}`}
                key={index}
              >
                {failed.has(index) ? (
                  <div className="flex h-full items-center justify-center p-8 text-center text-muted">
                    {vi
                      ? "Chưa thể tải ảnh này."
                      : "This photograph is unavailable."}{" "}
                    {multiple
                      ? vi
                        ? "Bạn có thể chọn ảnh khác bằng các nút bên dưới."
                        : "Explore another moment using the controls below."
                      : ""}
                  </div>
                ) : (
                  <ContentImage
                    asset={slide.image}
                    className="h-full w-full object-cover"
                    loading="eager"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    onError={() =>
                      setFailed((previous) => new Set([...previous, index]))
                    }
                    sizes="(min-width: 1280px) 1216px, 100vw"
                  />
                )}
              </div>
            ) : null,
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <div className="min-w-0 max-w-reading">
          <p className="font-label text-label font-bold uppercase text-foreground">
            {current.label}
          </p>
          {current.caption ? (
            <p className="mt-1 text-body-small text-muted">{current.caption}</p>
          ) : null}
        </div>
        {hydrated && multiple ? (
          <div className="flex flex-wrap items-center gap-2">
            <div
              aria-label={vi ? "Chọn ảnh" : "Choose a photograph"}
              className="flex items-center rounded-full bg-surface px-2"
              role="group"
            >
              {slides.map((slide, index) => (
                <button
                  aria-controls={galleryId}
                  aria-label={
                    vi
                      ? `Xem ảnh ${index + 1}: ${slide.label}`
                      : `Show photograph ${index + 1}: ${slide.label}`
                  }
                  aria-pressed={index === active}
                  className="group flex size-11 items-center justify-center rounded-full"
                  key={index}
                  onClick={() => select(index)}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 rounded-full transition-[width,background-color] duration-normal ease-emphasized motion-reduce:transition-none ${index === active ? "w-6 bg-primary" : "w-2 bg-muted group-hover:bg-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <button
              aria-controls={galleryId}
              aria-label={vi ? "Ảnh trước" : "Previous photograph"}
              className={arrowButton}
              onClick={() => select(active - 1)}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              aria-controls={galleryId}
              aria-label={vi ? "Ảnh tiếp theo" : "Next photograph"}
              className={arrowButton}
              onClick={() => select(active + 1)}
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
      </div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {visited.size > 1
          ? vi
            ? `Ảnh ${active + 1} trên ${slides.length}: ${current.label}`
            : `Photograph ${active + 1} of ${slides.length}: ${current.label}`
          : ""}
      </p>
    </div>
  );
}
