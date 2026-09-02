import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeferredVideoPlayer } from "@/components/content/deferred-video-player";
import { RichText } from "@/components/content/rich-text";
import { Container } from "@/components/ui/container";
import { ContentImage } from "@/components/ui/content-image";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { loadStoryDetail } from "@/features/stories/data";
import type { Story } from "@/lib/cms/domain";
import { formatPublicationDate } from "@/lib/format-date";
import { getExternalVideoEmbed } from "@/lib/video";

type StoryPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

const metadataImage = (story: Story, title: string) => {
  const image = story.seo?.socialImage ?? story.featuredImage;

  return {
    alt: image.alternativeText ?? title,
    height: image.height ?? undefined,
    url: image.url,
    width: image.width ?? undefined,
  };
};

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadStoryDetail(slug);

  if (result.status === "not-found") {
    return {
      description: "The requested story could not be found.",
      robots: { follow: false, index: false },
      title: "Story not found",
    };
  }

  if (result.status === "error") {
    return {
      description: "Read stories from our youth ministry community.",
      robots: { follow: false, index: false },
      title: "Story",
    };
  }

  const { story } = result;
  const title = story.seo?.metaTitle ?? story.title;
  const description = story.seo?.metaDescription ?? story.summary;
  const image = metadataImage(story, title);
  const canonical =
    story.seo?.canonical ?? `/stories/${encodeURIComponent(story.slug)}`;

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: [image],
      publishedTime: story.publishedAt,
      title,
      type: "article",
      url: canonical,
    },
    robots: story.seo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [image.url],
      title,
    },
  };
}

function StoryErrorState() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="story-error-title" tone="calm">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-secondary">
            Stories
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="story-error-title"
          >
            This story is temporarily unavailable
          </h1>
          <p className="mt-6 text-pretty text-body-large text-calm-foreground">
            We could not load the story right now. Please return to the story
            library and try again in a little while.
          </p>
          <div className="mt-8">
            <LinkButton href="/stories">Browse all stories</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const result = await loadStoryDetail(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return <StoryErrorState />;
  }

  const { story } = result;
  const videoEmbed = story.videoUrl
    ? getExternalVideoEmbed(story.videoUrl)
    : null;

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <article>
        <Section aria-labelledby="story-title" tone="calm">
          <Container size="reading">
            <Link
              className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-secondary transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
              href="/stories"
            >
              <span aria-hidden="true">←</span>
              All stories
            </Link>
            <p className="mt-8 font-label text-label font-bold uppercase text-secondary">
              Community story
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="story-title"
            >
              {story.title}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-calm-foreground">
              {story.summary}
            </p>
            <p className="mt-6 text-body-small text-calm-foreground">
              {story.personDisplayName ? (
                <>
                  {story.personDisplayName}
                  <span aria-hidden="true"> · </span>
                </>
              ) : null}
              <time dateTime={story.publishedAt}>
                {formatPublicationDate(story.publishedAt)}
              </time>
            </p>
          </Container>
        </Section>

        <Section aria-label="Story image" spacing="compact" tone="white">
          <Container size="wide">
            <div className="overflow-hidden rounded-large border border-border bg-surface">
              <ContentImage
                asset={story.featuredImage}
                className="aspect-[16/9] h-auto w-full object-cover"
                sizes="(min-width: 1280px) 1152px, 100vw"
              />
            </div>
          </Container>
        </Section>

        <Section aria-label="Story content" tone="white">
          <Container size="reading">
            <RichText content={story.body} />
          </Container>
        </Section>

        {story.videoUrl ? (
          <Section aria-labelledby="story-video-title" tone="surface">
            <Container size="wide">
              <div className="mx-auto max-w-4xl">
                <h2
                  className="font-heading text-heading-2 font-bold"
                  id="story-video-title"
                >
                  Watch the story
                </h2>
                <div className="mt-8 overflow-hidden rounded-large border border-border bg-background">
                  {videoEmbed ? (
                    <DeferredVideoPlayer
                      contentTitle={story.title}
                      embed={videoEmbed}
                      playLabel="Play story"
                      thumbnail={story.featuredImage}
                    />
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center gap-5 bg-background p-8 text-center">
                      <p className="max-w-reading text-muted">
                        This video opens on the provider&apos;s website.
                      </p>
                      <LinkButton href={story.videoUrl} variant="outline">
                        Watch story video
                      </LinkButton>
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </Section>
        ) : null}
      </article>

      <Section aria-labelledby="story-next-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Discover more moments of faith, friendship, service, and belonging from our community."
            eyebrow="Keep exploring"
            id="story-next-title"
            tone="calm"
            title="Explore more stories"
          />
          <div className="mt-8">
            <LinkButton href="/stories">Browse all stories</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
