import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

describe("UI foundation", () => {
  it("keeps button behavior explicit and forwards native props", () => {
    render(
      <Button disabled name="join" type="submit" variant="outline">
        Join us
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Join us" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("name", "join");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("renders link actions with the shared button styles", () => {
    render(<LinkButton href="/join">Join us</LinkButton>);

    expect(screen.getByRole("link", { name: "Join us" })).toMatchObject({
      href: expect.stringContaining("/join"),
    });
    expect(screen.getByRole("link", { name: "Join us" })).toHaveClass(
      "bg-primary",
      "min-h-11",
    );
  });

  it("renders composable semantic layout primitives", () => {
    render(
      <Section aria-labelledby="section-title" tone="surface">
        <Container data-testid="container" size="reading">
          <SectionHeading
            description="Readable supporting copy"
            eyebrow="Foundation"
            headingLevel="h3"
            id="section-title"
            tone="surface"
            title="A semantic section heading"
          />
        </Container>
      </Section>,
    );

    expect(screen.getByRole("region")).toHaveAccessibleName(
      "A semantic section heading",
    );
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "A semantic section heading",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Readable supporting copy")).toBeInTheDocument();
    expect(screen.getByTestId("container")).toHaveClass("max-w-reading");
  });
});
