import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RichText } from "@/components/content/rich-text";
import type { RichText as RichTextContent } from "@/lib/cms/domain";

const content = [
  {
    type: "heading",
    level: 1,
    children: [{ type: "text", text: "A section title" }],
  },
  {
    type: "paragraph",
    children: [
      { type: "text", text: "Read " },
      {
        type: "link",
        url: "/articles",
        children: [{ type: "text", text: "more articles", bold: true }],
      },
      { type: "text", text: " safely.", italic: true },
    ],
  },
  {
    type: "quote",
    children: [{ type: "text", text: "Encourage one another." }],
  },
  {
    type: "list",
    format: "unordered",
    children: [
      {
        type: "list-item",
        children: [{ type: "text", text: "Gather" }],
      },
      {
        type: "list",
        format: "ordered",
        children: [
          {
            type: "list-item",
            children: [{ type: "text", text: "Listen" }],
          },
        ],
      },
    ],
  },
  {
    type: "code",
    children: [{ type: "text", text: "const hope = true;" }],
  },
  {
    type: "image",
    image: {
      id: "embedded-image",
      name: "gathering.jpg",
      url: "https://media.example.test/gathering.jpg",
      alternativeText: "Students gathering together",
      mimeType: "image/jpeg",
      width: 1_200,
      height: 800,
      sizeInKilobytes: 150,
      variants: [],
    },
    caption: "A weekly youth gathering",
  },
] satisfies RichTextContent;

describe("RichText", () => {
  it("renders supported Blocks as semantic server-safe markup", () => {
    const { container } = render(<RichText content={content} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "A section title" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "more articles" })).toHaveAttribute(
      "href",
      "/articles",
    );
    expect(screen.getByText("Encourage one another.").closest("blockquote"))
      .toBeInTheDocument();
    expect(screen.getByText("Listen").closest("ol")).toBeInTheDocument();
    expect(screen.getByText("const hope = true;").closest("pre"))
      .toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "Students gathering together",
    );
    expect(screen.getByText("A weekly youth gathering")).toBeInTheDocument();
    expect(container.querySelector("ul > li > ol")).toBeInTheDocument();
  });

  it("renders markup-looking CMS text as text instead of executable HTML", () => {
    const { container } = render(
      <RichText
        content={[
          {
            type: "paragraph",
            children: [
              { type: "text", text: "<script>alert('unsafe')</script>" },
            ],
          },
        ]}
      />,
    );

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByText("<script>alert('unsafe')</script>")).toBeVisible();
  });
});
