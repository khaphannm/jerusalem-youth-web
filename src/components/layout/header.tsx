import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="border-b bg-background">
      <Container className="flex min-h-16 items-center py-3">
        <span className="font-heading text-body-large font-bold tracking-tight">
          {siteConfig.name}
        </span>
      </Container>
    </header>
  );
}
