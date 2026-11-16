import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function ArticleCategoryNotFound() {
  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="category-not-found-title" tone="calm">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-secondary">
            Bài viết
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="category-not-found-title"
          >
            Không tìm thấy chuyên mục
          </h1>
          <p className="mt-6 text-pretty text-body-large text-calm-foreground">
            Chuyên mục này có thể đã được chuyển hoặc không còn nữa. Hãy xem
            tất cả bài viết đã đăng để tiếp tục khám phá.
          </p>
          <div className="mt-8">
            <LinkButton href="/articles">Xem tất cả bài viết</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
