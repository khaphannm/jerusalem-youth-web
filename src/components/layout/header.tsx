import Link from "next/link";

import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NavigationLink } from "@/components/layout/navigation-link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { getCmsClient } from "@/lib/cms";
import type { NavigationItem } from "@/lib/cms/domain";

async function loadPrimaryNavigation(): Promise<readonly NavigationItem[]> {
  try {
    return (await getCmsClient().navigation())?.primaryItems ?? [];
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error.";

    console.error(`Header navigation could not be loaded: ${reason}`);
    return [];
  }
}

export async function Header({ locale = "en" }: { locale?: "en" | "vi" } = {}) {
  const navigationItems = await loadPrimaryNavigation();

  return (
    <header className="relative z-40 border-b bg-background" lang={locale}>
      <Container
        className="flex min-h-20 items-center justify-between gap-6 py-3"
        size="wide"
      >
        <Link
          className="rounded-small font-heading text-body-large font-extrabold tracking-tight transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
          href="/"
        >
          {locale === "vi" ? "Jerusalem Youth" : siteConfig.name}
        </Link>

        {navigationItems.length > 0 ? (
          <>
            <nav
              aria-label={
                locale === "vi" ? "Điều hướng chính" : "Primary navigation"
              }
              className="hidden lg:block"
            >
              <ul className="flex items-center gap-1">
                {navigationItems.map((item, index) => (
                  <li key={`${item.label}-${item.url}-${index}`}>
                    <NavigationLink item={item} locale={locale} />
                  </li>
                ))}
              </ul>
            </nav>
            <MobileNavigation items={navigationItems} locale={locale} />
          </>
        ) : null}
      </Container>
    </header>
  );
}
