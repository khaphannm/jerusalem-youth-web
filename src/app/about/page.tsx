import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import {
  loadAboutPageData,
  loadAboutSiteSettings,
} from "@/features/about/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadAboutSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const siteDescription =
    settings?.siteDescription ?? siteConfig.description;
  const description = `Tìm hiểu tầm nhìn, sứ mệnh và giá trị của ${siteName}. ${siteDescription}`;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? siteName,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    alternates: { canonical: "/about" },
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      locale: "vi_VN",
      siteName,
      title: `Giới thiệu ${siteName}`,
      type: "website",
      url: "/about",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "Giới thiệu",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title: `Giới thiệu ${siteName}`,
    },
  };
}

export default async function AboutPage() {
  const { aboutPage, siteSettings } = await loadAboutPageData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const siteDescription =
    siteSettings?.siteDescription ?? siteConfig.description;
  const callToAction =
    aboutPage?.callToAction ??
    siteSettings?.primaryCallToAction ??
    { label: "Tham gia cùng chúng mình", url: "/join" };

  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="about-title">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-primary">
              Về chúng mình
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="about-title"
            >
              Giới thiệu {siteName}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-muted">
              {siteDescription}
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="purpose-title" tone="secondary">
        <Container size="wide">
          <SectionHeading
            description="Tầm nhìn cho biết nơi chúng mình hướng đến. Sứ mệnh mô tả cách chúng mình cùng nhau bước đi."
            eyebrow="Mục đích"
            id="purpose-title"
            tone="secondary"
            title="Vì sao chúng mình gặp gỡ"
          />

          <div className="mt-10">
            {aboutPage ? (
              <div className="grid gap-8 lg:grid-cols-2">
                <article className="border-t border-calm pt-6">
                  <h3 className="font-heading text-heading-3 font-bold">
                    Tầm nhìn
                  </h3>
                  <p className="mt-4 whitespace-pre-line text-pretty text-body-large text-secondary-foreground/80">
                    {aboutPage.vision}
                  </p>
                </article>
                <article className="border-t border-accent pt-6">
                  <h3 className="font-heading text-heading-3 font-bold">
                    Sứ mệnh
                  </h3>
                  <p className="mt-4 whitespace-pre-line text-pretty text-body-large text-secondary-foreground/80">
                    {aboutPage.mission}
                  </p>
                </article>
              </div>
            ) : (
              <EmptyState
                description="Nhóm đang chuẩn bị trang này. Bạn hãy quay lại sau để tìm hiểu về tầm nhìn và sứ mệnh nhé."
                title="Mục đích của chúng mình sẽ được chia sẻ tại đây"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="values-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="Những giá trị này định hướng cách chúng mình gặp gỡ, lớn lên và quan tâm đến nhau."
            eyebrow="Giá trị cốt lõi"
            id="values-title"
            tone="white"
            title="Điều định hình cộng đồng chúng mình"
          />

          <div className="mt-10">
            {aboutPage ? (
              <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {aboutPage.values.map((value, index) => (
                  <li
                    className="rounded-medium border border-border bg-surface p-6 sm:p-8"
                    key={`${value.title}-${index}`}
                  >
                    <p className="font-label text-label font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-6 font-heading text-heading-3 font-bold">
                      {value.title}
                    </h3>
                    <p className="mt-4 whitespace-pre-line text-muted">
                      {value.description}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                description="Các giá trị của cộng đồng đang được chuẩn bị và sẽ sớm có tại đây."
                title="Giá trị của chúng mình sắp được cập nhật"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="about-action-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Dù bạn mới ghé thăm lần đầu hay muốn tham gia nhiều hơn, chúng mình luôn sẵn lòng giúp bạn kết nối."
            eyebrow="Bước tiếp theo"
            id="about-action-title"
            tone="calm"
            title="Tìm chỗ của bạn trong cộng đồng"
          />
          <div className="mt-8">
            <LinkButton href={callToAction.url} size="large">
              {callToAction.label}
            </LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
