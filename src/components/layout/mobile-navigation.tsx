"use client";

import { useEffect, useId, useRef, useState } from "react";

import { NavigationLink } from "@/components/layout/navigation-link";
import type { NavigationItem } from "@/lib/cms/domain";

type MobileNavigationProps = Readonly<{
  items: readonly NavigationItem[];
  locale?: "en" | "vi";
}>;

export function MobileNavigation({
  items,
  locale = "en",
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-small border bg-background px-3 py-2 font-label text-label font-semibold text-foreground transition-colors duration-fast ease-standard hover:bg-surface hover:text-primary motion-reduce:transition-none"
        onClick={() => setIsOpen((open) => !open)}
        ref={triggerRef}
        type="button"
      >
        <span>
          {locale === "vi"
            ? isOpen
              ? "Đóng"
              : "Danh mục"
            : isOpen
              ? "Close"
              : "Menu"}
        </span>
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          viewBox="0 0 20 20"
        >
          {isOpen ? (
            <path
              d="M4 4l12 12M16 4L4 16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          ) : (
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          )}
        </svg>
      </button>

      <div
        className="absolute inset-x-0 top-full border-b bg-background shadow-subtle"
        hidden={!isOpen}
        id={panelId}
      >
        <nav
          aria-label={
            locale === "vi" ? "Điều hướng trên điện thoại" : "Mobile navigation"
          }
        >
          <div className="mx-auto max-w-wide px-gutter py-3 sm:px-gutter-sm lg:px-gutter-lg">
            <ul className="flex flex-col gap-1">
              {items.map((item, index) => (
                <li key={`${item.label}-${item.url}-${index}`}>
                  <NavigationLink
                    item={item}
                    locale={locale}
                    onClick={closeMenu}
                  />
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
