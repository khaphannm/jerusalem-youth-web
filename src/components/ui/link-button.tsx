import {
  getButtonClasses,
  type ButtonStyleProps,
} from "@/components/ui/button";
import { SafeLink, type SafeLinkProps } from "@/components/ui/safe-link";

export type LinkButtonProps = Omit<
  SafeLinkProps,
  "className"
> &
  ButtonStyleProps;

export function LinkButton({
  children,
  className,
  href,
  size,
  variant,
  ...props
}: LinkButtonProps) {
  const classes = getButtonClasses({ className, size, variant });

  return (
    <SafeLink className={classes} href={href} {...props}>
      {children}
    </SafeLink>
  );
}
