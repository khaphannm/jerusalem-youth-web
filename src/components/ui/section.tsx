import type { ComponentPropsWithoutRef } from "react";

const toneClasses = {
  background: "bg-background text-foreground",
  calm: "bg-calm text-calm-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  surface: "bg-surface text-foreground",
} as const;

const spacingClasses = {
  compact: "py-section-compact",
  default: "py-section",
} as const;

export type SectionProps = ComponentPropsWithoutRef<"section"> & {
  spacing?: keyof typeof spacingClasses;
  tone?: keyof typeof toneClasses;
};

export function Section({
  className,
  spacing = "default",
  tone = "background",
  ...props
}: SectionProps) {
  const classes = [toneClasses[tone], spacingClasses[spacing], className]
    .filter(Boolean)
    .join(" ");

  return <section className={classes} {...props} />;
}
