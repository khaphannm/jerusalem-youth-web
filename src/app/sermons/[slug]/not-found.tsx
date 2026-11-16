import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function SermonNotFound() {
  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="sermon-not-found-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Bài giảng
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="sermon-not-found-title"
          >
            Không tìm thấy bài giảng
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            Bài giảng này có thể đã được chuyển hoặc chưa được đăng. Hãy xem
            thư viện bài giảng để tìm một sứ điệp khác.
          </p>
          <div className="mt-8">
            <LinkButton href="/sermons">Xem tất cả bài giảng</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
