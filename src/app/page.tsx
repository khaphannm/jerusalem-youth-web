import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

export default function Home() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="ui-foundation-title">
        <Container>
          <SectionHeading
            description="A responsive, accessible base for future content stories. No CMS data is connected."
            eyebrow="Youth Ministry Website V1"
            headingLevel="h1"
            id="ui-foundation-title"
            title="Modern Editorial UI foundation"
          />
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary action</Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
