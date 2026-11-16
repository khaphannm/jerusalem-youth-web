import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { SafeLink } from "@/components/ui/safe-link";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import {
  loadContactPageData,
  loadContactSiteSettings,
} from "@/features/contact/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadContactSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = `Liên hệ ${siteName}`;
  const description = `Email, số điện thoại, địa chỉ và các kênh cộng đồng chính thức của ${siteName}.`;
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
    alternates: { canonical: "/contact" },
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      locale: "vi_VN",
      siteName,
      title,
      type: "website",
      url: "/contact",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "Liên hệ",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}

const contactLinkClasses =
  "mt-4 inline-flex min-h-11 max-w-full items-center break-all rounded-small py-2 font-label text-body-large font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none";

export default async function ContactPage() {
  const { siteSettings, socialLinks } = await loadContactPageData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const contact = siteSettings?.organizationContact;
  const hasContact = Boolean(
    contact?.email || contact?.phone || contact?.address,
  );
  const communityLinks = socialLinks?.links ?? [];

  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="contact-title" tone="secondary">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-calm">
              Liên hệ chính thức
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="contact-title"
            >
              Liên hệ {siteName}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              Hãy dùng các kênh chính thức bên dưới. Trang này không đăng thông
              tin cá nhân của người phụ trách và không thu thập tin nhắn.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="contact-channels-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="Chọn kênh phù hợp với câu hỏi của bạn. Liên kết email và điện thoại sẽ mở ứng dụng có sẵn trên thiết bị."
            eyebrow="Liên hệ với chúng mình"
            id="contact-channels-title"
            tone="white"
            title="Các kênh liên hệ chính thức"
          />

          <div className="mt-10">
            {hasContact ? (
              <address className="not-italic">
                <ul className="grid gap-6 md:grid-cols-3">
                  {contact?.email ? (
                    <li className="motion-reveal rounded-large border border-border bg-surface p-6 sm:rounded-xlarge sm:p-8">
                      <h3 className="font-heading text-heading-3 font-bold">
                        Email
                      </h3>
                      <p className="mt-3 text-muted">
                        Gửi thư qua ứng dụng email của bạn.
                      </p>
                      <SafeLink
                        aria-label={`Gửi email cho ${siteName} qua ${contact.email}`}
                        className={contactLinkClasses}
                        href={`mailto:${contact.email}`}
                      >
                        {contact.email}
                      </SafeLink>
                    </li>
                  ) : null}

                  {contact?.phone ? (
                    <li className="motion-reveal rounded-large border border-border bg-surface p-6 sm:rounded-xlarge sm:p-8">
                      <h3 className="font-heading text-heading-3 font-bold">
                        Điện thoại
                      </h3>
                      <p className="mt-3 text-muted">
                        Gọi bằng ứng dụng điện thoại trên thiết bị.
                      </p>
                      <SafeLink
                        aria-label={`Gọi ${siteName} theo số ${contact.phone}`}
                        className={contactLinkClasses}
                        href={`tel:${contact.phone}`}
                      >
                        {contact.phone}
                      </SafeLink>
                    </li>
                  ) : null}

                  {contact?.address ? (
                    <li className="motion-reveal rounded-large border border-border bg-surface p-6 sm:rounded-xlarge sm:p-8">
                      <h3 className="font-heading text-heading-3 font-bold">
                        Địa chỉ
                      </h3>
                      <p className="mt-3 text-muted">
                        Địa chỉ chính thức của chúng mình.
                      </p>
                      <p className="mt-4 whitespace-pre-line text-body-large font-bold">
                        {contact.address}
                      </p>
                    </li>
                  ) : null}
                </ul>
              </address>
            ) : (
              <EmptyState
                action={<LinkButton href="/join">Xem cách tham gia</LinkButton>}
                description="Thông tin liên hệ trực tiếp đang được cập nhật. Bạn vẫn có thể tìm bước tiếp theo ở trang Tham gia."
                title="Thông tin liên hệ đang được cập nhật"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="contact-community-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Các liên kết này thuộc danh sách kênh công khai đã được duyệt. Bạn không cần điền biểu mẫu nào để xem."
            eyebrow="Kênh cộng đồng"
            id="contact-community-title"
            tone="calm"
            title="Kết nối qua kênh chính thức"
          />

          {communityLinks.length > 0 ? (
            <nav aria-labelledby="contact-community-title" className="mt-8">
              <ul className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                {communityLinks.map((item, index) => (
                  <li key={`${item.platform}-${item.url}-${index}`}>
                    <LinkButton href={item.url} variant="outline">
                      Mở {item.platform}
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <p className="mt-8 text-calm-foreground">
              Các kênh cộng đồng đang được cập nhật. Bạn vui lòng dùng kênh
              liên hệ chính thức ở trên hoặc xem trang Tham gia.
            </p>
          )}
        </Container>
      </Section>
    </main>
  );
}
