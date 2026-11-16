import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { resolveJoinPrimaryAction } from "@/features/join/actions";
import {
  loadJoinPageData,
  loadJoinSiteSettings,
} from "@/features/join/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadJoinSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = `Tham gia ${siteName}`;
  const description = `Tìm bước tiếp theo để đến với các buổi gặp gỡ, cộng đồng và đời sống đức tin cùng ${siteName}.`;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? title,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    alternates: { canonical: "/join" },
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      locale: "vi_VN",
      siteName,
      title,
      type: "website",
      url: "/join",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "Tham gia",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}

const nextSteps = [
  {
    action: "Xem sự kiện",
    description:
      "Chọn một buổi gặp gỡ phù hợp và xem thông tin cần biết trước khi đến.",
    href: "/events",
    title: "Tìm một buổi gặp gỡ",
  },
  {
    action: "Đọc câu chuyện cộng đồng",
    description:
      "Cảm nhận cộng đồng qua những câu chuyện chân thật về đức tin, tình bạn và sự gắn bó.",
    href: "/stories",
    title: "Cảm nhận đời sống cộng đồng",
  },
  {
    action: "Khám phá tài liệu",
    description:
      "Tiếp tục lớn lên trong đức tin mỗi ngày với bài giảng, hướng dẫn và tài liệu đáng tin cậy.",
    href: "/resources",
    title: "Tiếp tục lớn lên",
  },
] as const;

export default async function JoinPage() {
  const { siteSettings, socialLinks } = await loadJoinPageData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const primaryAction = resolveJoinPrimaryAction(
    siteSettings?.primaryCallToAction ?? null,
  );
  const secondaryAction = primaryAction.url.startsWith("/events")
    ? { label: "Tìm hiểu về chúng mình", url: "/about" }
    : { label: "Xem sự kiện sắp tới", url: "/events" };
  const communityLinks = socialLinks?.links ?? [];

  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="join-title" tone="secondary">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-calm">
              Chào đón bạn
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="join-title"
            >
              Tìm bước tiếp theo cùng {siteName}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              Dù đây là lần đầu bạn ghé thăm hay bạn muốn tham gia nhiều hơn,
              hãy bắt đầu từ bước phù hợp với bạn.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <LinkButton href={primaryAction.url} size="large">
                {primaryAction.label}
              </LinkButton>
              <LinkButton
                href={secondaryAction.url}
                size="large"
                variant="secondary"
              >
                {secondaryAction.label}
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="join-steps-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="Không có một cách bắt đầu duy nhất. Đây là ba nơi đơn giản để khởi đầu."
            eyebrow="Chọn bước tiếp theo"
            id="join-steps-title"
            tone="white"
            title="Bắt đầu từ nơi bạn đang đứng"
          />

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <li
                className="motion-reveal flex flex-col rounded-large border border-border bg-surface p-6 sm:rounded-xlarge sm:p-8"
                key={step.href}
              >
                <p className="font-label text-label font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-6 font-heading text-heading-3 font-bold">
                  {step.title}
                </h3>
                <p className="mt-4 flex-1 text-muted">{step.description}</p>
                <Link
                  className="mt-6 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
                  href={step.href}
                >
                  {step.action}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section aria-labelledby="join-community-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Kết nối qua các kênh chính thức của chúng mình. Trang này không yêu cầu hay lưu thông tin cá nhân của bạn."
            eyebrow="Giữ kết nối"
            id="join-community-title"
            tone="calm"
            title="Kết nối không cần điền biểu mẫu"
          />

          {communityLinks.length > 0 ? (
            <nav aria-labelledby="join-community-title" className="mt-8">
              <ul className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                {communityLinks.map((item, index) => (
                  <li key={`${item.platform}-${item.url}-${index}`}>
                    <LinkButton href={item.url} variant="outline">
                      Kết nối qua {item.platform}
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="mt-8">
              <p className="text-muted">
                Các kênh cộng đồng chính thức đang được cập nhật. Bạn vẫn có
                thể bắt đầu bằng việc tìm buổi gặp gỡ sắp tới.
              </p>
              <div className="mt-6">
                <LinkButton href="/events">Xem sự kiện sắp tới</LinkButton>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
