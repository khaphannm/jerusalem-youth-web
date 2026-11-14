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
import { homeCopy } from "@/features/home/copy";
import { loadHomePageData, loadHomeSiteSettings } from "@/features/home/data";
import { HeroGallery } from "@/features/home/hero-gallery";

const textLink =
  "inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-primary underline underline-offset-4 transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none";

function FacebookInvitation() {
  return (
    <LinkButton href={homeCopy.facebookUrl} size="large">
      {homeCopy.facebookLabel}
    </LinkButton>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadHomeSiteSettings();
  const seo = settings?.defaultSeo;
  const siteName = settings?.siteName ?? "Jerusalem Youth";
  const title = seo?.metaTitle ?? `${siteName} — ${homeCopy.headline}`;
  const description = seo?.metaDescription ?? homeCopy.description;
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
    latestArticle,
    latestSermon,
    siteSettings,
    stories,
    upcomingEvents,
  } = await loadHomePageData();
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
      <Section aria-labelledby="home-title">
        <Container size="wide">
          <div
            className={
              heroSlides.length
                ? "grid items-center gap-10 lg:grid-cols-5 lg:gap-12"
                : "max-w-reading"
            }
          >
            <div className={heroSlides.length ? "lg:col-span-2" : undefined}>
              <p className="font-label text-label font-bold uppercase text-primary">
                {siteName}
              </p>
              <h1
                className="mt-5 text-balance font-display text-display font-extrabold leading-tight"
                id="home-title"
              >
                {homeCopy.headline}
              </h1>
              <p className="mt-6 text-pretty text-body-large text-muted">
                {homeCopy.description}
              </p>
              <div className="mt-8 flex flex-col items-start gap-3">
                <FacebookInvitation />
                <a className={textLink} href="#gioi-thieu">
                  Khám phá cộng đồng{" "}
                  <span aria-hidden="true" className="ml-2">
                    ↓
                  </span>
                </a>
              </div>
            </div>
            {heroSlides.length ? (
              <div className="min-w-0 lg:col-span-3">
                <HeroGallery slides={heroSlides} locale="vi" />
              </div>
            ) : null}
          </div>
          <nav
            aria-label="Khám phá Jerusalem Youth"
            className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-5"
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
        id="gioi-thieu"
        tone="white"
      >
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <SectionHeading
              eyebrow="Chúng mình là ai?"
              id="introduction-title"
              title="Đức tin được vun đắp trong sự đồng hành."
            />
            <div>
              <p className="text-pretty text-body-large text-muted">
                {homeCopy.introduction}
              </p>
              {aboutPage ? (
                <div className="mt-6 border-l-2 border-accent pl-6">
                  <p className="font-label text-label font-bold uppercase text-secondary">
                    Sứ mệnh của chúng mình
                  </p>
                  <p className="mt-3 whitespace-pre-line text-pretty">
                    {aboutPage.mission}
                  </p>
                </div>
              ) : null}
              <Link className={`${textLink} mt-6`} href="/about">
                Tìm hiểu về {siteName}{" "}
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="community-title" tone="surface">
        <Container size="wide">
          <SectionHeading
            eyebrow="Đời sống cộng đồng"
            id="community-title"
            title="Cùng nhau sống đức tin."
          />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {homeCopy.themes.map((theme, index) => (
              <li className="border-t border-border pt-6" key={theme.title}>
                <span
                  aria-hidden="true"
                  className="font-display text-heading-3 font-bold text-primary"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-heading text-heading-3 font-bold">
                  {theme.title}
                </h3>
                <p className="mt-4 text-muted">{theme.description}</p>
              </li>
            ))}
          </ol>
          <Link className={`${textLink} mt-8`} href="/events">
            Xem các buổi gặp gỡ{" "}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        </Container>
      </Section>

      <Section aria-labelledby="gathering-title" id="gap-go" tone="secondary">
        <Container size="wide">
          <SectionHeading
            eyebrow="Hẹn gặp bạn"
            id="gathering-title"
            title="Buổi gặp gỡ sắp tới"
            description="Xem chủ đề, thời gian và địa điểm để chuẩn bị cho buổi gặp gỡ cùng Jerusalem Youth."
            tone="secondary"
          />
          {featuredEvent ? (
            <div className="mt-10">
              <EventCard
                event={featuredEvent}
                featured
                status="upcoming"
                locale="vi"
              />
            </div>
          ) : (
            <div className="mt-8 max-w-reading">
              <p>
                Thời gian cho buổi gặp gỡ tiếp theo sẽ được cập nhật tại đây.
                Bạn có thể nhắn tin qua Facebook để hỏi thêm thông tin.
              </p>
              <div className="mt-6">
                <FacebookInvitation />
              </div>
            </div>
          )}
          {upcomingEvents.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard
                  event={event}
                  status="upcoming"
                  locale="vi"
                  key={event.id}
                />
              ))}
            </div>
          ) : null}
          <div className="mt-8">
            <LinkButton href="/events" variant="secondary">
              Xem tất cả sự kiện
            </LinkButton>
          </div>
        </Container>
      </Section>

      {stories.length ? (
        <Section aria-labelledby="stories-title" tone="white">
          <Container size="wide">
            <SectionHeading
              eyebrow="Câu chuyện cộng đồng"
              id="stories-title"
              title="Mỗi hành trình đều có một câu chuyện."
              description="Lắng nghe những chia sẻ về đức tin và cuộc sống từ các bạn trong cộng đồng Jerusalem Youth."
            />
            <div className="mt-10">
              <StoryCard story={stories[0]} featured locale="vi" />
            </div>
            {stories.length > 1 ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {stories.slice(1, 3).map((story) => (
                  <StoryCard story={story} locale="vi" key={story.id} />
                ))}
              </div>
            ) : null}
            <Link className={`${textLink} mt-6`} href="/stories">
              Xem các câu chuyện{" "}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </Container>
        </Section>
      ) : null}

      <Section aria-labelledby="grow-title" tone="calm">
        <Container size="wide">
          <SectionHeading
            eyebrow="Nuôi dưỡng đức tin mỗi ngày"
            id="grow-title"
            title="Tiếp tục hành trình sau mỗi buổi gặp gỡ."
            description="Dành một khoảng lặng để suy ngẫm, lắng nghe và học thêm qua những bài chia sẻ và tài liệu được giới thiệu tại đây."
            tone="calm"
          />
          {hasTeaching ? (
            <div className="mt-10 grid items-start gap-8 xl:grid-cols-2">
              {latestSermon ? (
                <div className="min-w-0 [&>article]:md:grid-cols-1">
                  <SermonCard sermon={latestSermon} locale="vi" />
                </div>
              ) : null}
              {latestArticle ? (
                <div className="min-w-0 [&>article]:md:grid-cols-1">
                  <ArticleCard article={latestArticle} locale="vi" />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="mt-8">
            <LinkButton href="/resources" variant="outline">
              Khám phá tài liệu
            </LinkButton>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="visit-title" id="lan-dau" tone="white">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Lần đầu tìm hiểu Jerusalem Youth?"
                id="visit-title"
                title="Bắt đầu từ một lời chào."
                description="Nếu bạn đang tìm hiểu về Jerusalem Youth, hãy nhắn tin cho chúng mình. Bạn có thể hỏi về buổi gặp gỡ sắp tới, địa điểm hoặc cách kết nối với cộng đồng."
              />
              <div className="mt-8">
                <FacebookInvitation />
              </div>
              <Link className={`${textLink} mt-4`} href="/join">
                Tìm hiểu cách tham gia{" "}
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </div>
            <ol className="space-y-8">
              <li className="border-t border-border pt-6">
                <p className="font-label text-label font-bold text-primary">
                  01
                </p>
                <h3 className="mt-3 font-heading text-heading-3 font-bold">
                  Xem thông tin buổi gặp gỡ
                </h3>
                <p className="mt-4 text-muted">
                  Kiểm tra thời gian, địa điểm và những lưu ý được ghi trong
                  trang sự kiện.
                </p>
              </li>
              <li className="border-t border-border pt-6">
                <p className="font-label text-label font-bold text-primary">
                  02
                </p>
                <h3 className="mt-3 font-heading text-heading-3 font-bold">
                  Hỏi điều bạn muốn biết
                </h3>
                <p className="mt-4 text-muted">
                  Nhắn tin qua trang Facebook chính thức khi bạn cần thêm thông
                  tin trước khi tham gia.
                </p>
              </li>
            </ol>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="invitation-title" tone="secondary">
        <Container size="reading">
          <SectionHeading
            eyebrow="Một lời mời dành cho bạn"
            id="invitation-title"
            title={`Cùng bắt đầu hành trình với ${siteName}.`}
            description={`Bạn muốn tìm hiểu thêm hoặc kết nối với chúng mình? Hãy gửi một lời chào qua trang Facebook chính thức của ${siteName}.`}
            tone="secondary"
          />
          <div className="mt-8">
            <FacebookInvitation />
          </div>
        </Container>
      </Section>
    </main>
  );
}
