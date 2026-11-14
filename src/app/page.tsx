import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/content/article-card";
import { EventCard } from "@/components/content/event-card";
import { SermonCard } from "@/components/content/sermon-card";
import { StoryCard } from "@/components/content/story-card";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { defaultHomePage } from "@/features/home/copy";
import { loadHomePageData, loadHomeSiteSettings } from "@/features/home/data";
import { HeroGallery } from "@/features/home/hero-gallery";
import type { CallToAction, MinistryValue } from "@/lib/cms/domain";

const textLink =
  "inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-primary underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none";

const centeredHeading = "mx-auto text-center";

const tile =
  "h-full rounded-large p-8 transition-transform duration-normal ease-emphasized hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none sm:rounded-xlarge sm:p-10";

function Invitation({ action }: { action: CallToAction }) {
  return (
    <LinkButton href={action.url} size="large">
      {action.label}
    </LinkButton>
  );
}

function Arrow({ direction = "→" }: { direction?: "→" | "↓" }) {
  return (
    <span aria-hidden="true" className="ml-2">
      {direction}
    </span>
  );
}

function NumberedTiles({
  items,
  tone,
}: {
  items: readonly MinistryValue[];
  tone: "surface" | "white";
}) {
  return (
    <ol className="grid gap-5">
      {items.map((item, index) => (
        <li className="motion-reveal" key={item.title}>
          <div
            className={`${tile} ${tone === "white" ? "bg-primary-foreground" : "bg-surface"}`}
          >
            <span
              aria-hidden="true"
              className="font-display text-heading-3 font-bold text-primary"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-5 font-heading text-heading-3 font-bold">
              {item.title}
            </h3>
            <p className="mt-4 text-body-large text-muted">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadHomeSiteSettings();
  const seo = settings?.defaultSeo;
  const siteName = settings?.siteName ?? "Jerusalem Youth";
  const title =
    seo?.metaTitle ?? `${siteName} — ${defaultHomePage.heroHeadline}`;
  const description = seo?.metaDescription ?? defaultHomePage.heroDescription;
  const socialImage = seo?.socialImage ?? settings?.defaultSocialImage;
  const canonical = seo?.canonical ?? "/";
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? siteName,
        height: socialImage.height ?? undefined,
        width: socialImage.width ?? undefined,
        url: socialImage.url,
      }
    : undefined;

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      locale: "vi_VN",
      siteName,
      title,
      type: "website",
      url: canonical,
    },
    robots: seo?.noIndex ? { follow: true, index: false } : undefined,
    title: { absolute: title },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}

export default async function Home() {
  const {
    aboutPage,
    featuredEvent,
    homePage,
    latestArticle,
    latestSermon,
    siteSettings,
    stories,
    upcomingEvents,
  } = await loadHomePageData();
  const content = homePage ?? defaultHomePage;
  const siteName = siteSettings?.siteName ?? "Jerusalem Youth";
  const fallbackImage =
    featuredEvent?.banner ??
    stories[0]?.featuredImage ??
    latestArticle?.featuredImage ??
    siteSettings?.defaultSocialImage;
  const heroSlides = siteSettings?.heroSlides?.length
    ? siteSettings.heroSlides
    : fallbackImage
      ? [{ image: fallbackImage, label: siteName, caption: null }]
      : [];
  const hasTeaching = Boolean(latestArticle || latestSermon);

  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section
        aria-labelledby="home-title"
        className="overflow-x-clip"
        spacing="compact"
      >
        <Container size="wide">
          <div className="motion-recede mx-auto max-w-content text-center">
            <p className="motion-enter font-label text-label font-bold uppercase text-primary">
              {siteName}
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold leading-tight [--motion-step:1]"
              id="home-title"
            >
              {content.heroHeadline}
            </h1>
            <p className="motion-enter mx-auto mt-6 max-w-reading text-pretty text-body-large text-muted [--motion-step:2]">
              {content.heroDescription}
            </p>
            <div className="motion-enter mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 [--motion-step:3]">
              <Invitation action={content.callToAction} />
              <a className={textLink} href="#gioi-thieu">
                Khám phá cộng đồng <Arrow direction="↓" />
              </a>
            </div>
          </div>
          {heroSlides.length ? (
            <div className="mt-12 min-w-0 sm:mt-16">
              <HeroGallery slides={heroSlides} locale="vi" />
            </div>
          ) : null}
          <nav
            aria-label="Khám phá Jerusalem Youth"
            className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-border pt-5"
          >
            <a className={textLink} href="#gioi-thieu">
              Về chúng mình
            </a>
            <a className={textLink} href="#gap-go">
              Buổi gặp gỡ
            </a>
            <a className={textLink} href="#lan-dau">
              Lần đầu tham gia
            </a>
          </nav>
        </Container>
      </Section>

      <Section
        aria-labelledby="introduction-title"
        className="scroll-mt-16"
        id="gioi-thieu"
        tone="white"
      >
        <Container size="wide">
          <div className="motion-reveal">
            <SectionHeading
              className={centeredHeading}
              eyebrow={content.introduction.eyebrow}
              id="introduction-title"
              title={content.introduction.title}
              description={content.introduction.description}
            />
          </div>
          {aboutPage ? (
            <div className="motion-reveal mx-auto mt-12 max-w-content">
              <div className="rounded-large bg-surface p-8 text-center sm:rounded-xlarge sm:p-14">
                <p className="font-label text-label font-bold uppercase text-secondary">
                  Sứ mệnh của chúng mình
                </p>
                <p className="mx-auto mt-5 max-w-reading whitespace-pre-line text-pretty font-heading text-heading-3 font-semibold">
                  {aboutPage.mission}
                </p>
              </div>
            </div>
          ) : null}
          <div className="mt-8 text-center">
            <Link className={textLink} href="/about">
              Tìm hiểu về {siteName} <Arrow />
            </Link>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="community-title" tone="surface">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                eyebrow={content.community.eyebrow}
                id="community-title"
                title={content.community.title}
                description={content.community.description}
                tone="surface"
              />
              <Link className={`${textLink} mt-6`} href="/events">
                Xem các buổi gặp gỡ <Arrow />
              </Link>
            </div>
            <NumberedTiles items={content.communityThemes} tone="white" />
          </div>
        </Container>
      </Section>

      <Section
        aria-labelledby="gathering-title"
        className="scroll-mt-16"
        id="gap-go"
        tone="secondary"
      >
        <Container size="wide">
          <div className="motion-reveal">
            <SectionHeading
              className={centeredHeading}
              eyebrow={content.gathering.eyebrow}
              id="gathering-title"
              title={content.gathering.title}
              description={content.gathering.description}
              tone="secondary"
            />
          </div>
          {featuredEvent ? (
            <div className="motion-reveal mt-12">
              <EventCard
                event={featuredEvent}
                featured
                status="upcoming"
                locale="vi"
              />
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-reading text-center">
              <p>{content.gatheringEmptyMessage}</p>
              <div className="mt-6">
                <Invitation action={content.callToAction} />
              </div>
            </div>
          )}
          {upcomingEvents.length ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <div className="motion-reveal" key={event.id}>
                  <EventCard event={event} status="upcoming" locale="vi" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-10 text-center">
            <LinkButton href="/events" variant="secondary">
              Xem tất cả sự kiện
            </LinkButton>
          </div>
        </Container>
      </Section>

      {stories.length ? (
        <Section aria-labelledby="stories-title" tone="white">
          <Container size="wide">
            <div className="motion-reveal">
              <SectionHeading
                className={centeredHeading}
                eyebrow={content.stories.eyebrow}
                id="stories-title"
                title={content.stories.title}
                description={content.stories.description}
              />
            </div>
            <div className="motion-reveal mt-12">
              <StoryCard story={stories[0]} featured locale="vi" />
            </div>
            {stories.length > 1 ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {stories.slice(1, 3).map((story) => (
                  <div className="motion-reveal" key={story.id}>
                    <StoryCard story={story} locale="vi" />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-8 text-center">
              <Link className={textLink} href="/stories">
                Xem các câu chuyện <Arrow />
              </Link>
            </div>
          </Container>
        </Section>
      ) : null}

      <Section aria-labelledby="grow-title" tone="calm">
        <Container size="wide">
          <div className="motion-reveal">
            <SectionHeading
              className={centeredHeading}
              eyebrow={content.teaching.eyebrow}
              id="grow-title"
              title={content.teaching.title}
              description={content.teaching.description}
              tone="calm"
            />
          </div>
          {hasTeaching ? (
            <div className="mt-12 grid items-start gap-6 xl:grid-cols-2">
              {latestSermon ? (
                <div className="motion-reveal min-w-0 [&>article]:md:grid-cols-1">
                  <SermonCard sermon={latestSermon} locale="vi" />
                </div>
              ) : null}
              {latestArticle ? (
                <div className="motion-reveal min-w-0 [&>article]:md:grid-cols-1">
                  <ArticleCard article={latestArticle} locale="vi" />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="mt-10 text-center">
            <LinkButton href="/resources" variant="outline">
              Khám phá tài liệu
            </LinkButton>
          </div>
        </Container>
      </Section>

      <Section
        aria-labelledby="visit-title"
        className="scroll-mt-16"
        id="lan-dau"
        tone="white"
      >
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading
                eyebrow={content.newcomer.eyebrow}
                id="visit-title"
                title={content.newcomer.title}
                description={content.newcomer.description}
              />
              <div className="mt-8">
                <Invitation action={content.callToAction} />
              </div>
              <Link className={`${textLink} mt-4`} href="/join">
                Tìm hiểu cách tham gia <Arrow />
              </Link>
            </div>
            <NumberedTiles items={content.newcomerSteps} tone="surface" />
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="invitation-title" tone="secondary">
        <Container size="content">
          <div className="motion-reveal text-center">
            <SectionHeading
              className={centeredHeading}
              eyebrow={content.invitation.eyebrow}
              id="invitation-title"
              title={content.invitation.title}
              description={content.invitation.description}
              tone="secondary"
            />
            <div className="mt-10">
              <Invitation action={content.callToAction} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
