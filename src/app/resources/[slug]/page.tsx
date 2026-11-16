import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { ContentImage } from "@/components/ui/content-image";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { loadResourceDetail } from "@/features/resources/data";
import { getResourcePresentation } from "@/features/resources/source";
import type { MediaAsset, Resource } from "@/lib/cms/domain";
import { formatPublicationDate } from "@/lib/format-date";

type ResourcePageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

const getMetadataImage = (resource: Resource): MediaAsset | null => {
  if (resource.seo?.socialImage) {
    return resource.seo.socialImage;
  }
  if (resource.thumbnail) {
    return resource.thumbnail;
  }
  if (
    resource.source.kind === "file" &&
    resource.source.asset.mimeType.toLowerCase().startsWith("image/")
  ) {
    return resource.source.asset;
  }

  return null;
};

export async function generateMetadata({
  params,
}: ResourcePageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadResourceDetail(slug);

  if (result.status === "not-found") {
    return {
      description: "Không tìm thấy tài liệu bạn yêu cầu.",
      robots: { follow: false, index: false },
      title: "Không tìm thấy tài liệu",
    };
  }

  if (result.status === "error") {
    return {
      description: "Explore practical resources from our youth ministry.",
      robots: { follow: false, index: false },
      title: "Resource",
    };
  }

  const { resource } = result;
  const title = resource.seo?.metaTitle ?? resource.title;
  const description =
    resource.seo?.metaDescription ?? resource.description;
  const canonical =
    resource.seo?.canonical ?? `/resources/${encodeURIComponent(resource.slug)}`;
  const media = getMetadataImage(resource);
  const image = media
    ? {
        alt: media.alternativeText ?? title,
        height: media.height ?? undefined,
        url: media.url,
        width: media.width ?? undefined,
    }
    : undefined;
  const parentMetadata = !image ? await parent : undefined;
  const openGraphImages = image
    ? [image]
    : parentMetadata?.openGraph?.images;
  const twitterImages = image
    ? [image.url]
    : parentMetadata?.twitter?.images;

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: openGraphImages,
      title,
      type: "website",
      url: canonical,
    },
    robots: resource.seo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title,
    twitter: {
      card: twitterImages?.length ? "summary_large_image" : "summary",
      description,
      images: twitterImages,
      title,
    },
  };
}

function ResourceErrorState() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="resource-error-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Resources
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="resource-error-title"
          >
            This resource is temporarily unavailable
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            We could not load the resource right now. Please return to the
            resource library and try again in a little while.
          </p>
          <div className="mt-8">
            <LinkButton href="/resources">Browse all resources</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const result = await loadResourceDetail(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return <ResourceErrorState />;
  }

  const { resource } = result;
  const source = getResourcePresentation(resource);

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <article>
        <Section aria-labelledby="resource-title" tone="surface">
          <Container size="reading">
            <Link
              className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
              href="/resources"
            >
              <span aria-hidden="true">←</span>
              All resources
            </Link>
            <p className="mt-8 font-label text-label font-bold uppercase text-primary">
              {resource.category.name}
              <span aria-hidden="true"> · </span>
              {source.typeLabel}
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="resource-title"
            >
              {resource.title}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-muted">
              {resource.description}
            </p>
            <p className="mt-6 text-body-small text-muted">
              {resource.author ? (
                <>
                  <span>By {resource.author.displayName}</span>
                  <span aria-hidden="true"> · </span>
                </>
              ) : null}
              <time dateTime={resource.publishedAt}>
                {formatPublicationDate(resource.publishedAt)}
              </time>
            </p>
          </Container>
        </Section>

        <Section aria-labelledby="resource-source-title" tone="white">
          <Container size="wide">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:items-start">
              {resource.thumbnail ? (
                <div className="motion-settle overflow-hidden rounded-large border border-border bg-surface sm:rounded-xlarge">
                  <ContentImage
                    asset={resource.thumbnail}
                    className="aspect-[4/3] h-auto w-full object-cover"
                    sizes="(min-width: 1024px) 60vw, 100vw"
                  />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="flex aspect-[4/3] items-end rounded-large bg-secondary p-8 sm:rounded-xlarge font-heading text-heading-2 font-bold text-secondary-foreground"
                >
                  {source.typeLabel}
                </div>
              )}

              <aside className="motion-reveal rounded-large border border-border bg-background p-6 sm:rounded-xlarge sm:p-8">
                <p className="font-label text-label font-bold uppercase text-primary">
                  {source.typeLabel}
                </p>
                <h2
                  className="mt-4 font-heading text-heading-2 font-bold"
                  id="resource-source-title"
                >
                  Use this resource
                </h2>
                <p className="mt-4 text-muted">
                  {resource.source.kind === "external"
                    ? "This resource is hosted on another website."
                    : "This resource is provided as a file. Your browser will decide whether it opens or saves the file."}
                </p>
                <div className="mt-8">
                  <LinkButton href={source.destination}>
                    {source.actionLabel}
                  </LinkButton>
                </div>
              </aside>
            </div>
          </Container>
        </Section>
      </article>

      <Section aria-labelledby="resource-next-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Find more practical tools for conversation, faith, and service."
            eyebrow="Keep exploring"
            id="resource-next-title"
            tone="calm"
            title="Explore more resources"
          />
          <div className="mt-8">
            <LinkButton href="/resources">Browse all resources</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
