import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import {
  getButtonClasses,
  type ButtonStyleProps,
} from "@/components/ui/button";

export type LinkButtonProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "className" | "href"
> &
  ButtonStyleProps & {
    href: string;
  };

export function LinkButton({
  children,
  className,
  href,
  size,
  variant,
  ...props
}: LinkButtonProps) {
  const classes = getButtonClasses({ className, size, variant });

  if (href.startsWith("/")) {
    return (
      <Link className={classes} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a className={classes} href={href} {...props}>
      {children}
    </a>
  );
}
