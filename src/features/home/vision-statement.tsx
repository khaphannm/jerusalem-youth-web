import type { CSSProperties, ReactNode } from "react";

type VisionStatementProps = Readonly<{
  children?: ReactNode;
  tone?: "calm" | "dark" | "light";
  eyebrow: string | null;
  highlight: string | null;
  id: string;
  title: string;
}>;

const pillClasses = {
  calm: "bg-secondary/10 text-secondary",
  dark: "bg-primary-foreground/10 text-calm",
  light: "bg-primary/10 text-primary",
} as const;

type Word = Readonly<{ index: number; text: string }>;

const cssVariables = (variables: Record<`--${string}`, number>) =>
  variables as CSSProperties;

// `highlight` holds one phrase, or several separated by "|". Each is matched
// at its first occurrence; phrases that are missing or overlap an earlier
// match are ignored.
function findHighlights(title: string, highlight: string | null) {
  const ranges = (highlight ?? "")
    .split("|")
    .map((phrase) => phrase.trim())
    .filter(Boolean)
    .map((phrase) => ({ phrase, start: title.indexOf(phrase) }))
    .filter(({ start }) => start >= 0)
    .map(({ phrase, start }) => ({ end: start + phrase.length, start }))
    .sort((first, second) => first.start - second.start);

  return ranges.filter(
    (range, position) =>
      position === 0 ||
      ranges.slice(0, position).every((earlier) => earlier.end <= range.start),
  );
}

function splitStatement(title: string, highlight: string | null) {
  const segments: { marked: boolean; text: string }[] = [];
  let cursor = 0;

  for (const range of findHighlights(title, highlight)) {
    segments.push({ marked: false, text: title.slice(cursor, range.start) });
    segments.push({ marked: true, text: title.slice(range.start, range.end) });
    cursor = range.end;
  }

  segments.push({ marked: false, text: title.slice(cursor) });

  let index = 0;
  const parts = segments
    .map((segment, position) => ({
      // Punctuation right after the phrase must stay attached to it.
      leadingSpace:
        /^\s/.test(segment.text) ||
        (position > 0 && /\s$/.test(segments[position - 1].text)),
      marked: segment.marked,
      words: segment.text
        .split(/\s+/)
        .filter(Boolean)
        .map((text): Word => ({ index: index++, text })),
    }))
    .filter((part) => part.words.length > 0);

  return { parts, wordCount: index };
}

function Words({ words }: { words: readonly Word[] }) {
  return words.map((word, position) => (
    <span key={word.index}>
      {position > 0 ? " " : null}
      <span
        className="statement-word"
        style={cssVariables({ "--word": word.index })}
      >
        {word.text}
      </span>
    </span>
  ));
}

/**
 * The landing-page vision sentence. Words light up in reading order as the
 * block scrolls into view and an optional phrase gets a highlighter stroke.
 * Assistive technology reads one plain sentence; the animated words are
 * presentational. See "Vision statement" in docs/04-design-system.md.
 */
export function VisionStatement({
  children,
  eyebrow,
  highlight,
  id,
  title,
  tone = "light",
}: VisionStatementProps) {
  const { parts, wordCount } = splitStatement(title, highlight);

  return (
    <div
      className={`statement mx-auto max-w-content text-center ${tone === "dark" ? "statement-dark" : ""}`}
      style={cssVariables({ "--words": Math.max(wordCount, 1) })}
    >
      {eyebrow ? (
        <p
          className={`inline-block rounded-full px-4 py-1.5 font-label text-label font-bold uppercase ${pillClasses[tone]}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-8 text-balance font-display text-heading-1 font-extrabold lg:text-display ${tone === "dark" ? "text-secondary-foreground" : "text-foreground"}`}
        id={id}
      >
        <span className="sr-only">{title}</span>
        <span aria-hidden="true">
          {parts.map((part, position) => (
            <span key={position}>
              {position > 0 && part.leadingSpace ? " " : null}
              {part.marked ? (
                <span className="statement-mark">
                  <Words words={part.words} />
                </span>
              ) : (
                <Words words={part.words} />
              )}
            </span>
          ))}
        </span>
      </h2>
      {children ? <div className="statement-after mt-10">{children}</div> : null}
    </div>
  );
}
