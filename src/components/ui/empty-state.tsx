import type { ReactNode } from "react";

type EmptyStateProps = Readonly<{
  action?: ReactNode;
  className?: string;
  description: ReactNode;
  title: ReactNode;
}>;

export function EmptyState({
  action,
  className,
  description,
  title,
}: EmptyStateProps) {
  const classes = [
    "rounded-medium border border-border bg-background p-6 text-foreground sm:p-8",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <h3 className="font-heading text-body-large font-bold">{title}</h3>
      <p className="mt-2 max-w-reading text-body-small text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
