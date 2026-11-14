import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VisionStatement } from "./vision-statement";

const title = "Vô số bạn trẻ gọi Chúa Giê-xu là người bạn thân nhất.";

describe("VisionStatement", () => {
  it("exposes one plain sentence and marks the highlighted phrase", () => {
    const { container } = render(
      <VisionStatement
        eyebrow="Tầm nhìn"
        highlight="người bạn thân nhất"
        id="vision"
        title={title}
      >
        <p>Mô tả</p>
      </VisionStatement>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: title }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".statement-word")).toHaveLength(13);
    expect(container.querySelector(".statement-mark")).toHaveTextContent(
      "người bạn thân nhất",
    );
    expect(
      container.querySelector("[aria-hidden='true']")?.textContent,
    ).toBe(title);
    expect(screen.getByText("Tầm nhìn")).toBeInTheDocument();
    expect(screen.getByText("Mô tả")).toBeInTheDocument();
  });

  it("marks several phrases separated by a vertical bar", () => {
    const { container } = render(
      <VisionStatement
        eyebrow={null}
        highlight="bạn thân | Vô số bạn trẻ|không có|số bạn"
        id="vision"
        title={title}
      />,
    );

    expect(
      [...container.querySelectorAll(".statement-mark")].map(
        (mark) => mark.textContent,
      ),
    ).toEqual(["Vô số bạn trẻ", "bạn thân"]);
    expect(
      container.querySelector("[aria-hidden='true']")?.textContent,
    ).toBe(title);
    expect(
      screen.getByRole("heading", { level: 2, name: title }),
    ).toBeInTheDocument();
  });

  it("renders without a highlight when the phrase is missing or not in the sentence", () => {
    const { container, rerender } = render(
      <VisionStatement eyebrow={null} highlight={null} id="vision" title={title} />,
    );
    expect(container.querySelector(".statement-mark")).toBeNull();

    rerender(
      <VisionStatement
        eyebrow={null}
        highlight="không có trong câu"
        id="vision"
        title={title}
      />,
    );
    expect(container.querySelector(".statement-mark")).toBeNull();
    expect(
      screen.getByRole("heading", { level: 2, name: title }),
    ).toBeInTheDocument();
  });
});
