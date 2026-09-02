import { Fragment, type ReactNode } from "react";

import { ContentImage } from "@/components/ui/content-image";
import { SafeLink } from "@/components/ui/safe-link";
import type {
  RichText as RichTextContent,
  RichTextBlock,
  RichTextInline,
  RichTextList,
  RichTextListItem,
  RichTextText,
} from "@/lib/cms/domain";

type RichTextProps = Readonly<{
  content: RichTextContent;
}>;

const renderText = (node: RichTextText, key: string) => {
  const lines = node.text.split(/\r?\n|\r/);
  let content: ReactNode = lines.map((line, index) => (
    <Fragment key={`${key}-line-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));

  if (node.code) {
    content = (
      <code className="rounded-small bg-surface px-1 py-0.5 font-mono text-body-small">
        {content}
      </code>
    );
  }
  if (node.strikethrough) {
    content = <del>{content}</del>;
  }
  if (node.underline) {
    content = <u>{content}</u>;
  }
  if (node.italic) {
    content = <em>{content}</em>;
  }
  if (node.bold) {
    content = <strong>{content}</strong>;
  }

  return <Fragment key={key}>{content}</Fragment>;
};

const renderInline = (node: RichTextInline, key: string): ReactNode => {
  if (node.type === "text") {
    return renderText(node, key);
  }

  const children = node.children.map((child, index) =>
    renderText(child, `${key}-text-${index}`),
  );

  return (
    <SafeLink
      className="rounded-small font-semibold text-primary underline decoration-border underline-offset-4 transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
      fallback={children}
      href={node.url}
      key={key}
    >
      {children}
    </SafeLink>
  );
};

const renderInlineChildren = (
  children: readonly RichTextInline[],
  key: string,
) =>
  children.map((child, index) => renderInline(child, `${key}-${index}`));

const toPlainText = (children: readonly RichTextInline[]) =>
  children
    .map((child) =>
      child.type === "text"
        ? child.text
        : child.children.map(({ text }) => text).join(""),
    )
    .join("");

type ListEntry = {
  item: RichTextListItem | null;
  nestedLists: RichTextList[];
};

const groupListChildren = (list: RichTextList): readonly ListEntry[] => {
  const entries: ListEntry[] = [];

  for (const child of list.children) {
    if (child.type === "list-item") {
      entries.push({ item: child, nestedLists: [] });
      continue;
    }

    const parent = entries.at(-1);
    if (parent) {
      parent.nestedLists.push(child);
    } else {
      entries.push({ item: null, nestedLists: [child] });
    }
  }

  return entries;
};

const renderList = (list: RichTextList, key: string): ReactNode => {
  const entries = groupListChildren(list).map((entry, index) => (
    <li className="pl-1" key={`${key}-item-${index}`}>
      {entry.item
        ? renderInlineChildren(entry.item.children, `${key}-item-${index}`)
        : null}
      {entry.nestedLists.map((nestedList, nestedIndex) =>
        renderList(nestedList, `${key}-nested-${index}-${nestedIndex}`),
      )}
    </li>
  ));
  const classes =
    list.format === "ordered"
      ? "mt-6 list-decimal space-y-2 pl-7 marker:font-semibold marker:text-secondary"
      : "mt-6 list-disc space-y-2 pl-7 marker:text-secondary";

  return list.format === "ordered" ? (
    <ol className={classes} key={key}>
      {entries}
    </ol>
  ) : (
    <ul className={classes} key={key}>
      {entries}
    </ul>
  );
};

const renderHeading = (
  block: Extract<RichTextBlock, { type: "heading" }>,
  key: string,
) => {
  const children = renderInlineChildren(block.children, key);

  switch (block.level) {
    case 1:
    case 2:
      return (
        <h2 className="mt-12 font-heading text-heading-2 font-bold" key={key}>
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 className="mt-10 font-heading text-heading-3 font-bold" key={key}>
          {children}
        </h3>
      );
    case 4:
      return (
        <h4 className="mt-8 font-heading text-body-large font-bold" key={key}>
          {children}
        </h4>
      );
    case 5:
      return (
        <h5 className="mt-8 font-heading text-body-large font-bold" key={key}>
          {children}
        </h5>
      );
    case 6:
      return (
        <h6 className="mt-8 font-heading text-body-large font-bold" key={key}>
          {children}
        </h6>
      );
  }
};

const renderBlock = (block: RichTextBlock, index: number): ReactNode => {
  const key = `block-${index}`;

  switch (block.type) {
    case "paragraph":
      return (
        <p className="mt-6 first:mt-0" key={key}>
          {renderInlineChildren(block.children, key)}
        </p>
      );
    case "heading":
      return renderHeading(block, key);
    case "quote":
      return (
        <blockquote
          className="mt-8 border-l-4 border-calm pl-5 font-heading text-body-large font-semibold text-secondary sm:pl-7"
          key={key}
        >
          {renderInlineChildren(block.children, key)}
        </blockquote>
      );
    case "code":
      return (
        <pre
          className="mt-8 overflow-x-auto rounded-medium bg-secondary p-5 text-body-small text-secondary-foreground"
          key={key}
        >
          <code>{toPlainText(block.children)}</code>
        </pre>
      );
    case "list":
      return renderList(block, key);
    case "image":
      return (
        <figure className="mt-10" key={key}>
          <div className="overflow-hidden rounded-large border border-border bg-surface">
            <ContentImage
              asset={block.image}
              className="h-auto w-full object-cover"
              sizes="(min-width: 768px) 672px, 100vw"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-3 text-body-small text-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
  }
};

export function RichText({ content }: RichTextProps) {
  return (
    <div className="text-pretty text-body-large text-foreground">
      {content.map(renderBlock)}
    </div>
  );
}
