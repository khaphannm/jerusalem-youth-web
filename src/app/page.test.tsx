import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("renders the UI foundation fixture", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Modern Editorial UI foundation",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Primary action" }),
    ).toHaveAttribute("type", "button");
    expect(
      screen.getByRole("button", { name: "Secondary action" }),
    ).toBeInTheDocument();
  });
});
