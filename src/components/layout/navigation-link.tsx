import Link from "next/link";
import type { MouseEventHandler } from "react";

import type { NavigationItem } from "@/lib/cms/domain";

type NavigationLinkProps = Readonly<{
  item: NavigationItem;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  tone?: keyof typeof toneClasses;
}>;

const toneClasses = {
  default: "text-foreground hover:bg-surface hover:text-primary",
  inverse:
    "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
} as const;

const baseClasses =
  "inline-flex min-h-11 max-w-full items-center rounded-small px-3 py-2 font-label text-label font-semibold transition-colors duration-fast ease-standard motion-reduce:transition-none";

export function NavigationLink({
  item,
  onClick,
  tone = "default",
}: NavigationLinkProps) {
  const newTabProps = item.openInNewTab
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};
  const props = {
    ...newTabProps,
    className: `${baseClasses} ${toneClasses[tone]}`,
    onClick,
  };

  if (item.url.startsWith("/") && !item.url.startsWith("//")) {
    return (
      <Link href={item.url} {...props}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.url} {...props}>
      {item.label}
    </a>
  );
}
