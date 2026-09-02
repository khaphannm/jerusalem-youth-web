import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SafeDestination = Readonly<{
  href: string;
  internal: boolean;
}>;

const supportedExternalProtocols = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
]);

const safeNewTabRel = (rel: string | undefined) =>
  [
    ...new Set([
      ...(rel?.split(/\s+/).filter(
        (value) => value && value.toLowerCase() !== "opener",
      ) ?? []),
      "noopener",
      "noreferrer",
    ]),
  ].join(" ");

export function resolveSafeDestination(
  value: string | null | undefined,
): SafeDestination | null {
  const href = value?.trim();

  if (!href) {
    return null;
  }

  if (href.startsWith("/") && !href.startsWith("//")) {
    return { href, internal: true };
  }

  if (/^#[^\s#]+$/.test(href)) {
    return { href, internal: false };
  }

  try {
    const url = new URL(href);

    if (
      !supportedExternalProtocols.has(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return { href, internal: false };
  } catch {
    return null;
  }
}

export type SafeLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "target"
> &
  Readonly<{
    fallback?: ReactNode;
    href: string | null | undefined;
    openInNewTab?: boolean;
  }>;

export function SafeLink({
  children,
  fallback = null,
  href,
  openInNewTab = false,
  rel,
  ...props
}: SafeLinkProps) {
  const destination = resolveSafeDestination(href);

  if (!destination) {
    return fallback;
  }

  const linkProps = openInNewTab
    ? {
        ...props,
        rel: safeNewTabRel(rel),
        target: "_blank" as const,
      }
    : { ...props, rel };

  if (destination.internal) {
    return (
      <Link href={destination.href} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <a href={destination.href} {...linkProps}>
      {children}
    </a>
  );
}
