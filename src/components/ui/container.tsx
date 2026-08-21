import type { ComponentPropsWithoutRef } from "react";

const sizeClasses = {
  content: "max-w-content",
  reading: "max-w-reading",
  wide: "max-w-wide",
} as const;

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: keyof typeof sizeClasses;
};

export function Container({
  className,
  size = "content",
  ...props
}: ContainerProps) {
  const classes = [
    "mx-auto w-full px-gutter sm:px-gutter-sm lg:px-gutter-lg",
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
