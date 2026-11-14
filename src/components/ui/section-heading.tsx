import type { ReactNode } from "react";

const levelClasses = {
  h1: "text-heading-1",
  h2: "text-heading-2",
  h3: "text-heading-3",
} as const;

const toneClasses = {
  accentSoft: {
    description: "text-foreground",
    eyebrow: "text-primary",
    title: "text-foreground",
  },
  background: {
    description: "text-muted",
    eyebrow: "text-primary",
    title: "text-foreground",
  },
  calm: {
    description: "text-calm-foreground",
    eyebrow: "text-secondary",
    title: "text-calm-foreground",
  },
  primarySoft: {
    description: "text-foreground",
    eyebrow: "text-primary",
    title: "text-foreground",
  },
  secondary: {
    description: "text-secondary-foreground",
    eyebrow: "text-calm",
    title: "text-secondary-foreground",
  },
  surface: {
    description: "text-foreground",
    eyebrow: "text-primary",
    title: "text-foreground",
  },
  white: {
    description: "text-muted",
    eyebrow: "text-primary",
    title: "text-foreground",
  },
} as const;

export type SectionHeadingProps = {
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  headingLevel?: keyof typeof levelClasses;
  id?: string;
  tone?: keyof typeof toneClasses;
  title: ReactNode;
};

export function SectionHeading({
  className,
  description,
  eyebrow,
  headingLevel = "h2",
  id,
  tone = "background",
  title,
}: SectionHeadingProps) {
  const Heading = headingLevel;
  const colors = toneClasses[tone];
  const classes = ["max-w-reading", className].filter(Boolean).join(" ");

  return (
    <header className={classes}>
      {eyebrow ? (
        <p
          className={`mb-3 font-label text-label font-semibold uppercase ${colors.eyebrow}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={`text-balance font-heading font-bold ${levelClasses[headingLevel]} ${colors.title}`}
        id={id}
      >
        {title}
      </Heading>
      {description ? (
        <div className={`mt-4 text-pretty text-body-large ${colors.description}`}>
          {description}
        </div>
      ) : null}
    </header>
  );
}
