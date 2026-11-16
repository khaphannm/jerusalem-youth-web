import type { Metadata } from "next";

import { EventCard } from "@/components/content/event-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import {
  loadEventListing,
  loadEventSiteSettings,
} from "@/features/events/data";
import type { EventStatus } from "@/features/events/dates";
import type { Event } from "@/lib/cms/domain";

const listingDescription =
  "Xem các buổi gặp gỡ sắp tới của ban thanh niên, thời gian, địa điểm và những sự kiện đã diễn ra.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadEventSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const socialTitle = `Sự kiện | ${siteName}`;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? socialTitle,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    alternates: { canonical: "/events" },
    description: listingDescription,
    openGraph: {
      description: listingDescription,
      images: image ? [image] : undefined,
      locale: "vi_VN",
      siteName,
      title: socialTitle,
      type: "website",
      url: "/events",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "Sự kiện",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description: listingDescription,
      images: image ? [image.url] : undefined,
      title: socialTitle,
    },
  };
}

function EventGrid({
  events,
  status,
}: Readonly<{ events: readonly Event[]; status: EventStatus }>) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li className="motion-reveal h-full" key={event.id}>
          <EventCard event={event} locale="vi" status={status} />
        </li>
      ))}
    </ul>
  );
}

export default async function EventsPage() {
  const listing = await loadEventListing();

  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="events-title" tone="surface">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-accent">
              Hẹn gặp bạn
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="events-title"
            >
              Những buổi gặp gỡ đáng để có mặt
            </h1>
            <p className="mt-6 text-pretty text-body-large text-muted">
              Tìm buổi gặp gỡ tiếp theo, rủ bạn bè cùng tham gia và xem lại
              những sự kiện đã qua. Thời gian hiển thị theo giờ Việt Nam.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="upcoming-events-list-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={
              listing.status === "ready"
                ? `${listing.groups.upcoming.length} sự kiện, xếp theo ngày giờ.`
                : "Sự kiện sẽ hiển thị tại đây khi kết nối được khôi phục."
            }
            eyebrow="Sắp tới"
            id="upcoming-events-list-title"
            tone="white"
            title="Sự kiện sắp tới"
          />
          <div className="mt-10">
            {listing.status === "error" ? (
              <EmptyState
                action={<LinkButton href="/events">Thử lại</LinkButton>}
                description="Hiện chưa tải được danh sách sự kiện. Bạn vui lòng thử lại sau ít phút."
                title="Tạm thời chưa xem được sự kiện"
              />
            ) : listing.groups.upcoming.length > 0 ? (
              <EventGrid events={listing.groups.upcoming} status="upcoming" />
            ) : (
              <EmptyState
                description="Hiện chưa có lịch mới. Các buổi gặp gỡ sắp tới sẽ xuất hiện tại đây khi được đăng."
                title="Sự kiện tiếp theo sắp được công bố"
              />
            )}
          </div>
        </Container>
      </Section>

      {listing.status === "ready" ? (
        <Section aria-labelledby="past-events-list-title" tone="surface">
          <Container size="wide">
            <SectionHeading
              description={`${listing.groups.past.length} sự kiện, mới nhất trước.`}
              eyebrow="Lưu trữ"
              id="past-events-list-title"
              tone="surface"
              title="Sự kiện đã qua"
            />
            <div className="mt-10">
              {listing.groups.past.length > 0 ? (
                <EventGrid events={listing.groups.past} status="past" />
              ) : (
                <EmptyState
                  description="Các buổi gặp gỡ đã diễn ra sẽ được lưu tại đây."
                  title="Chưa có sự kiện đã qua"
                />
              )}
            </div>
          </Container>
        </Section>
      ) : null}
    </main>
  );
}
