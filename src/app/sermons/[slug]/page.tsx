import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { loadSermonDetail } from "@/features/sermons/data";
import { getSermonVideoEmbed } from "@/features/sermons/video";
import { SermonVideoPlayer } from "@/features/sermons/video-player";
import type { Sermon } from "@/lib/cms/domain";
import { formatPublicationDate } from "@/lib/format-date";

type SermonPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

const metadataImage = (sermon: Sermon, title: string) => {
  const image = sermon.seo?.socialImage ?? sermon.thumbnail;

  return image
    ? {
        alt: image.alternativeText ?? title,
        height: image.height ?? undefined,
        url: image.url,
        width: image.width ?? undefined,
      }
    : undefined;
};

export async function generateMetadata({
  params,
}: SermonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadSermonDetail(slug);

  if (result.status === "not-found") {
    return {
      description: "The requested sermon could not be found.",
      robots: { follow: false, index: false },
      title: "Sermon not found",
    };
  }

  if (result.status === "error") {
    return {
      description: "Watch and listen to sermons from our youth ministry.",
      robots: { follow: false, index: false },
      title: "Sermon",
    };
  }

  const { sermon } = result;
  const title = sermon.seo?.metaTitle ?? sermon.title;
  const description = sermon.seo?.metaDescription ?? sermon.summary;
  const image = metadataImage(sermon, title);
  const canonical = sermon.seo?.canonical ?? undefined;

  return {
    alternates: canonical ? { canonical } : undefined,
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      title,
      type: "website",
      url: canonical,
    },
    robots: sermon.seo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title,
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}

function SermonErrorState() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="sermon-error-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Sermons
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="sermon-error-title"
          >
            This sermon is temporarily unavailable
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            We could not load the sermon right now. Please return to the sermon
            library and try again in a little while.
          </p>
          <div className="mt-8">
            <LinkButton href="/sermons">Browse all sermons</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export default async function SermonPage({ params }: SermonPageProps) {
  const { slug } = await params;
  const result = await loadSermonDetail(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return <SermonErrorState />;
  }

  const { sermon } = result;
  const videoEmbed = getSermonVideoEmbed(sermon.videoUrl);

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <article>
        <Section aria-labelledby="sermon-title" tone="secondary">
          <Container size="reading">
            <Link
              className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-calm transition-colors duration-fast ease-standard hover:text-primary-foreground motion-reduce:transition-none"
              href="/sermons"
            >
              <span aria-hidden="true">←</span>
              All sermons
            </Link>
            <p className="mt-8 font-label text-label font-bold uppercase text-calm">
              {sermon.series ? (
                <>
                  <span className="sr-only">Series: </span>
                  {sermon.series.name}
                </>
              ) : (
                "Sermon"
              )}
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="sermon-title"
            >
              {sermon.title}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              {sermon.summary}
            </p>
            <p className="mt-6 text-body-small text-secondary-foreground">
              <span className="sr-only">Speaker: </span>
              {sermon.speaker}
              <span aria-hidden="true"> · </span>
              <time dateTime={sermon.date}>
                {formatPublicationDate(sermon.date)}
              </time>
            </p>
          </Container>
        </Section>

        <Section aria-labelledby="sermon-video-title" tone="white">
          <Container size="wide">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
              <div>
                <h2
                  className="font-heading text-heading-2 font-bold"
                  id="sermon-video-title"
                >
                  Watch the sermon
                </h2>
                <div className="mt-8 overflow-hidden rounded-large border border-border bg-surface">
                  {videoEmbed ? (
                    <SermonVideoPlayer
                      embed={videoEmbed}
                      sermonTitle={sermon.title}
                      thumbnail={sermon.thumbnail}
                    />
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center gap-5 bg-surface p-8 text-center">
                      <p className="max-w-reading text-muted">
                        This video opens on the provider&apos;s website.
                      </p>
                      <LinkButton href={sermon.videoUrl} variant="outline">
                        Watch sermon video
                      </LinkButton>
                    </div>
                  )}
                </div>
              </div>

              <aside
                aria-labelledby="sermon-details-title"
                className="rounded-medium border border-border bg-background p-6 sm:p-8"
              >
                <h2
                  className="font-heading text-heading-3 font-bold"
                  id="sermon-details-title"
                >
                  Message details
                </h2>
                <dl className="mt-6 space-y-6">
                  <div>
                    <dt className="font-label text-label font-bold uppercase text-primary">
                      Speaker
                    </dt>
                    <dd className="mt-2 font-semibold">{sermon.speaker}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-label font-bold uppercase text-primary">
                      Date
                    </dt>
                    <dd className="mt-2 text-body-small text-muted">
                      <time dateTime={sermon.date}>
                        {formatPublicationDate(sermon.date)}
                      </time>
                    </dd>
                  </div>
                  {sermon.biblePassage ? (
                    <div>
                      <dt className="font-label text-label font-bold uppercase text-primary">
                        Bible passage
                      </dt>
                      <dd className="mt-2 font-semibold">
                        {sermon.biblePassage}
                      </dd>
                    </div>
                  ) : null}
                  {sermon.series ? (
                    <div>
                      <dt className="font-label text-label font-bold uppercase text-primary">
                        Series
                      </dt>
                      <dd className="mt-2 font-semibold">
                        {sermon.series.name}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {sermon.audioUrl || sermon.notesUrl ? (
                  <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                    {sermon.audioUrl ? (
                      <LinkButton href={sermon.audioUrl} variant="outline">
                        Listen to audio
                      </LinkButton>
                    ) : null}
                    {sermon.notesUrl ? (
                      <LinkButton href={sermon.notesUrl} variant="outline">
                        Open sermon notes
                      </LinkButton>
                    ) : null}
                  </div>
                ) : null}
              </aside>
            </div>
          </Container>
        </Section>
      </article>

      <Section aria-labelledby="sermon-next-title" tone="surface">
        <Container size="reading">
          <SectionHeading
            description="Continue exploring biblical teaching from our youth gatherings."
            eyebrow="Keep growing"
            id="sermon-next-title"
            tone="surface"
            title="Explore more sermons"
          />
          <div className="mt-8">
            <LinkButton href="/sermons">Browse all sermons</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
