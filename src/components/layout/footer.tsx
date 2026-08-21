import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <Container className="py-8">
        <p className="font-label text-label font-medium">{siteConfig.name}</p>
      </Container>
    </footer>
  );
}
