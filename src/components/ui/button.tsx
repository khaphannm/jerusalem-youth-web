import type { ComponentPropsWithoutRef } from "react";

const variantClasses = {
  primary:
    "border-transparent bg-primary text-primary-foreground hover:bg-secondary active:bg-secondary/90",
  secondary:
    "border-current bg-surface text-foreground hover:bg-background active:bg-surface/70",
  outline:
    "border-current bg-transparent text-foreground hover:bg-surface active:bg-surface/70",
  ghost:
    "border-transparent bg-transparent text-primary hover:bg-surface active:bg-surface/70",
} as const;

const sizeClasses = {
  small: "min-h-10 px-4 py-2",
  medium: "min-h-11 px-5 py-2.5",
  large: "min-h-12 px-6 py-3",
} as const;

export type ButtonStyleProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
  variant?: keyof typeof variantClasses;
};

export type ButtonProps = ComponentPropsWithoutRef<"button"> & ButtonStyleProps;

export function getButtonClasses({
  className,
  size = "medium",
  variant = "primary",
}: ButtonStyleProps = {}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-small border font-label text-label font-semibold transition-colors duration-fast ease-standard motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50",
    sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  className,
  size = "medium",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = getButtonClasses({ className, size, variant });

  return <button className={classes} type={type} {...props} />;
}
