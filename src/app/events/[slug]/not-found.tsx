import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function EventNotFound() {
  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="event-not-found-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-accent">
            Sự kiện
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="event-not-found-title"
          >
            Không tìm thấy sự kiện
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            Sự kiện này có thể đã được chuyển hoặc chưa được đăng. Hãy xem danh
            sách sự kiện để tìm buổi gặp gỡ tiếp theo.
          </p>
          <div className="mt-8">
            <LinkButton href="/events">Xem tất cả sự kiện</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
