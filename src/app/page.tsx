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
import { VisionStatement } from "@/features/home/vision-statement";
import type {
  CallToAction,
  HomeSectionKey,
  MinistryValue,
} from "@/lib/cms/domain";

const textLinkBase =
  "inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold underline underline-offset-4 transition-colors duration-fast ease-standard motion-reduce:transition-none";
const textLink = `${textLinkBase} text-primary hover:text-secondary`;
const textLinkOnDark = `${textLinkBase} text-primary-foreground hover:text-calm`;
const textLinkOnCalm = `${textLinkBase} text-secondary hover:text-foreground`;

const sectionOrder = [
  "introduction",
  "community",
  "gathering",
  "stories",
  "teaching",
  "newcomer",
  "invitation",
] as const satisfies readonly HomeSectionKey[];

// Backgrounds rotate dark, light, sage, light. The light turns cycle through
// the pale tints and sand so neighbouring sections never share a tone.
const toneRotation = ["secondary", "light", "calm", "light"] as const;
const lightTones = ["primarySoft", "accentSoft", "surface"] as const;

type SectionTone = "secondary" | "calm" | (typeof lightTones)[number];

// The hero is light, so the first section that is actually rendered is dark
// and the rotation continues from there, whichever sections are switched off.
function rotateTones(rendered: Readonly<Record<HomeSectionKey, boolean>>) {
  const tones = {} as Record<HomeSectionKey, SectionTone>;
  let position = 0;
  let lightTurns = 0;

  for (const key of sectionOrder) {
    const turn = toneRotation[position % toneRotation.length];

    tones[key] =
      turn === "light" ? lightTones[lightTurns % lightTones.length] : turn;

    if (rendered[key]) {
      position += 1;
      if (turn === "light") lightTurns += 1;
    }
  }

  return tones;
}

// Blue text fails contrast on sage, so sage sections use navy for accents.
const linkOn = (tone: SectionTone) =>
  tone === "secondary"
    ? textLinkOnDark
    : tone === "calm"
      ? textLinkOnCalm
      : textLink;

const softTextOn = (tone: SectionTone) =>
  tone === "secondary"
    ? "text-secondary-foreground/80"
    : tone === "calm"
      ? "text-calm-foreground"
      : "text-foreground";

const statementTone = (tone: SectionTone) =>
  tone === "secondary" ? "dark" : tone === "calm" ? "calm" : "light";

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

const bentoSpans = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  6: "lg:col-span-6",
} as const;

// Rows of three on a six-column grid; a short last row is widened to fill it
// (five items become 3 + 2, four become 2 + 2).
function bentoSpan(index: number, total: number): keyof typeof bentoSpans {
  if (total <= 2) return total === 1 ? 6 : 3;
  if (total === 4) return 3;
  const remainder = total % 3;
  if (remainder && index >= total - remainder) return remainder === 2 ? 3 : 6;
  return 2;
}

function BentoTiles({ items }: { items: readonly MinistryValue[] }) {
  return (
    <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
      {items.map((item, index) => (
        <li
          className={`motion-reveal ${items.length % 2 && index === items.length - 1 ? "md:col-span-2" : ""} ${bentoSpans[bentoSpan(index, items.length)]}`}
          key={item.title}
        >
          <div className="h-full rounded-large border border-border/60 bg-primary-foreground p-8 transition-transform duration-normal ease-emphasized hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none sm:rounded-xlarge sm:p-10">
            <span
              aria-hidden="true"
              className="font-label text-label font-semibold tracking-widest text-muted"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 font-heading text-heading-3 font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="mt-3 text-body-small text-muted">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function NumberedTiles({ items }: { items: readonly MinistryValue[] }) {
  return (
    <ol className="grid gap-5">
      {items.map((item, index) => (
        <li className="motion-reveal" key={item.title}>
          <div className={`${tile} bg-primary-foreground text-foreground`}>
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

// Upcoming and past events depend on the current time. Re-render at most
// every five minutes so they stay correct without a CMS call or a rebuild.
export const revalidate = 300;

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
    featuredEvent,
    homePage,
    latestArticle,
    latestSermon,
    siteSettings,
    stories,
    upcomingEvents,
  } = await loadHomePageData();
  const content = homePage ?? defaultHomePage;
  const show = content.visibleSections;
  const jumpLinks = [
    { href: "#gioi-thieu", label: "Về chúng mình", visible: show.introduction },
    { href: "#gap-go", label: "Buổi gặp gỡ", visible: show.gathering },
    { href: "#lan-dau", label: "Lần đầu tham gia", visible: show.newcomer },
  ].filter((link) => link.visible);
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
  const showStories = show.stories && stories.length > 0;
  const tones = rotateTones({ ...show, stories: showStories });

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
              {show.introduction ? (
                <a className={textLink} href="#gioi-thieu">
                  Khám phá cộng đồng <Arrow direction="↓" />
                </a>
              ) : null}
            </div>
          </div>
          {heroSlides.length ? (
            <div className="mt-12 min-w-0 sm:mt-16">
              <HeroGallery slides={heroSlides} locale="vi" />
            </div>
          ) : null}
          {jumpLinks.length ? (
            <nav
              aria-label="Khám phá Jerusalem Youth"
              className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-border pt-5"
            >
              {jumpLinks.map((link) => (
                <a className={textLink} href={link.href} key={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </Container>
      </Section>

      {show.introduction ? (
        <Section
          aria-labelledby="introduction-title"
          className="scroll-mt-16"
          id="gioi-thieu"
          tone={tones.introduction}
        >
          <Container size="wide">
            <div className="py-section-compact">
              <VisionStatement
                tone={statementTone(tones.introduction)}
                eyebrow={content.introduction.eyebrow}
                highlight={content.introductionHighlight}
                id="introduction-title"
                title={content.introduction.title}
              >
                {content.introduction.description ? (
                  <p
                    className={`mx-auto max-w-reading text-pretty text-body-large ${softTextOn(tones.introduction)}`}
                  >
                    {content.introduction.description}
                  </p>
                ) : null}
                <Link
                  className={`${linkOn(tones.introduction)} mt-4`}
                  href="/about"
                >
                  Tìm hiểu về {siteName} <Arrow />
                </Link>
              </VisionStatement>
            </div>
          </Container>
        </Section>
      ) : null}

      {show.community ? (
        <Section aria-labelledby="community-title" tone={tones.community}>
          <Container size="wide">
            <div className="motion-reveal">
              <SectionHeading
                className={centeredHeading}
                eyebrow={content.community.eyebrow}
                id="community-title"
                title={content.community.title}
                description={content.community.description}
                tone={tones.community}
              />
            </div>
            <BentoTiles items={content.communityThemes} />
            <div className="mt-8 text-center">
              <Link className={linkOn(tones.community)} href="/events">
                Xem các buổi gặp gỡ <Arrow />
              </Link>
            </div>
          </Container>
        </Section>
      ) : null}

      {show.gathering ? (
        <Section
          aria-labelledby="gathering-title"
          className="scroll-mt-16"
          id="gap-go"
          tone={tones.gathering}
        >
          <Container size="wide">
            <div className="motion-reveal">
              <SectionHeading
                className={centeredHeading}
                eyebrow={content.gathering.eyebrow}
                id="gathering-title"
                title={content.gathering.title}
                description={content.gathering.description}
                tone={tones.gathering}
              />
            </div>
            {content.weeklySchedule.length ? (
              <ul
                aria-label="Lịch sinh hoạt hằng tuần"
                className="mx-auto mt-12 grid max-w-content gap-5 md:grid-cols-2"
              >
                {content.weeklySchedule.map((item) => (
                  <li className="motion-reveal" key={item.title}>
                    <div
                      className={`h-full rounded-large p-8 sm:rounded-xlarge sm:p-10 ${tones.gathering === "secondary" ? "border border-primary-foreground/20" : "bg-primary-foreground text-foreground"}`}
                    >
                      <h3
                        className={`font-label text-label font-bold uppercase ${tones.gathering === "secondary" ? "text-calm" : "text-secondary"}`}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-4 font-heading text-heading-3 font-bold">
                        {item.schedule}
                      </p>
                      {item.note ? (
                        <p
                          className={`mt-3 ${tones.gathering === "secondary" ? "text-secondary-foreground/80" : "text-foreground"}`}
                        >
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
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
          </Container>
        </Section>
      ) : null}

      {showStories ? (
        <Section aria-labelledby="stories-title" tone={tones.stories}>
          <Container size="wide">
            <div className="motion-reveal">
              <SectionHeading
                className={centeredHeading}
                eyebrow={content.stories.eyebrow}
                id="stories-title"
                title={content.stories.title}
                description={content.stories.description}
                tone={tones.stories}
              />
            </div>
            <div className="motion-reveal mt-12 text-foreground">
              <StoryCard story={stories[0]} featured locale="vi" />
            </div>
            {stories.length > 1 ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {stories.slice(1, 3).map((story) => (
                  <div className="motion-reveal text-foreground" key={story.id}>
                    <StoryCard story={story} locale="vi" />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-8 text-center">
              <Link className={linkOn(tones.stories)} href="/stories">
                Xem các câu chuyện <Arrow />
              </Link>
            </div>
          </Container>
        </Section>
      ) : null}

      {show.teaching ? (
        <Section aria-labelledby="grow-title" tone={tones.teaching}>
          <Container size="wide">
            <div className="motion-reveal">
              <SectionHeading
                className={centeredHeading}
                eyebrow={content.teaching.eyebrow}
                id="grow-title"
                title={content.teaching.title}
                description={content.teaching.description}
                tone={tones.teaching}
              />
            </div>
            {hasTeaching ? (
              <div className="mt-12 grid items-start gap-6 xl:grid-cols-2">
                {latestSermon ? (
                  <div className="motion-reveal min-w-0 text-foreground [&>article]:md:grid-cols-1">
                    <SermonCard sermon={latestSermon} locale="vi" />
                  </div>
                ) : null}
                {latestArticle ? (
                  <div className="motion-reveal min-w-0 text-foreground [&>article]:md:grid-cols-1">
                    <ArticleCard article={latestArticle} locale="vi" />
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="mt-10 text-center">
              <LinkButton
                href="/resources"
                variant={tones.teaching === "secondary" ? "secondary" : "outline"}
              >
                Khám phá tài liệu
              </LinkButton>
            </div>
          </Container>
        </Section>
      ) : null}

      {show.newcomer ? (
        <Section
          aria-labelledby="visit-title"
          className="scroll-mt-16"
          id="lan-dau"
          tone={tones.newcomer}
        >
          <Container size="wide">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeading
                  eyebrow={content.newcomer.eyebrow}
                  id="visit-title"
                  title={content.newcomer.title}
                  description={content.newcomer.description}
                  tone={tones.newcomer}
                />
                <div className="mt-8">
                  <Invitation action={content.callToAction} />
                </div>
                <Link className={`${linkOn(tones.newcomer)} mt-4`} href="/join">
                  Tìm hiểu cách tham gia <Arrow />
                </Link>
              </div>
              <NumberedTiles items={content.newcomerSteps} />
            </div>
          </Container>
        </Section>
      ) : null}

      {show.invitation ? (
        <Section aria-labelledby="invitation-title" tone={tones.invitation}>
          <Container size="content">
            <div className="motion-reveal text-center">
              <SectionHeading
                className={centeredHeading}
                eyebrow={content.invitation.eyebrow}
                id="invitation-title"
                title={content.invitation.title}
                description={content.invitation.description}
                tone={tones.invitation}
              />
              <div className="mt-10">
                <Invitation action={content.callToAction} />
              </div>
            </div>
          </Container>
        </Section>
      ) : null}
    </main>
  );
}
