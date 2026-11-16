import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function ResourceNotFound() {
  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="resource-not-found-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Tài liệu
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="resource-not-found-title"
          >
            Không tìm thấy tài liệu
          </h1>
          <p className="mt-6 text-pretty text-body-large text-muted">
            Tài liệu này có thể đã được chuyển hoặc chưa được đăng. Hãy xem
            thư viện tài liệu để tìm một hướng dẫn hữu ích khác.
          </p>
          <div className="mt-8">
            <LinkButton href="/resources">Xem tất cả tài liệu</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
