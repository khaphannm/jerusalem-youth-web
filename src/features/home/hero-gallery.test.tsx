import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { HeroSlide } from "@/lib/cms/domain";
import { HeroGallery } from "./hero-gallery";

const slides: HeroSlide[] = ["Worship", "Community", "Serving"].map((label, index) => ({
  label,
  caption: label + " together",
  image: {
    id: String(index), name: label, url: "/image-" + index + ".webp",
    alternativeText: label + " photograph", mimeType: "image/webp",
    width: 1600, height: 900, sizeInKilobytes: 100, variants: [],
  },
}));

describe("HeroGallery", () => {
  it("renders the first photograph without JavaScript or inactive image downloads", () => {
    const html = renderToString(<HeroGallery slides={slides} />);
    expect(html).toContain("/image-0.webp");
    expect(html).not.toContain("/image-1.webp");
    expect(html).not.toContain("<button");
  });

  it("supports direct selection and wrapping while preserving focus", () => {
    render(<HeroGallery slides={slides} />);
    const previous = screen.getByRole("button", { name: "Previous photograph" });
    previous.focus();
    fireEvent.click(previous);
    expect(screen.getByRole("img", { name: "Serving photograph" })).toBeVisible();
    expect(previous).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Next photograph" }));
    expect(screen.getByRole("img", { name: "Worship photograph" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Show photograph 2: Community" }));
    expect(screen.getByRole("button", { name: "Show photograph 2: Community" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Photograph 2 of 3: Community")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Worship photograph" })).not.toBeInTheDocument();
  });

  it("supports horizontal swipe without treating a vertical scroll as navigation", () => {
    const { container } = render(<HeroGallery slides={slides} />);
    const stage = container.querySelector(".touch-pan-y");
    if (!stage) throw new Error("Missing photograph stage");
    fireEvent.touchStart(stage, { touches: [{ clientX: 200, clientY: 50 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 100, clientY: 200 }] });
    expect(screen.getByRole("img", { name: "Worship photograph" })).toBeVisible();
    fireEvent.touchStart(stage, { touches: [{ clientX: 200, clientY: 50 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 100, clientY: 55 }] });
    expect(screen.getByRole("img", { name: "Community photograph" })).toBeVisible();
  });

  it("keeps navigation available when an image fails", () => {
    render(<HeroGallery slides={slides} />);
    fireEvent.error(screen.getByRole("img", { name: "Worship photograph" }));
    expect(screen.getByText(/This photograph is unavailable/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Next photograph" }));
    expect(screen.getByRole("img", { name: "Community photograph" })).toBeVisible();
  });

  it("renders a single image without controls and nothing for zero slides", () => {
    const { rerender, container } = render(<HeroGallery slides={slides.slice(0, 1)} />);
    expect(screen.getByRole("img")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<HeroGallery slides={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
