import Link from "next/link";
import type { MouseEventHandler } from "react";

import type { NavigationItem } from "@/lib/cms/domain";

type NavigationLinkProps = Readonly<{
  item: NavigationItem;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}>;

const classes =
  "inline-flex min-h-11 items-center rounded-small px-3 py-2 font-label text-label font-semibold text-foreground transition-colors duration-fast ease-standard hover:bg-surface hover:text-primary motion-reduce:transition-none";

export function NavigationLink({ item, onClick }: NavigationLinkProps) {
  const newTabProps = item.openInNewTab
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};
  const props = {
    ...newTabProps,
    className: classes,
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
