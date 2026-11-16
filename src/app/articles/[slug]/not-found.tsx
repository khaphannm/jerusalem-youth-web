import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function ArticleNotFound() {
  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="article-not-found-title" tone="calm">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-secondary">
            Bài viết
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="article-not-found-title"
          >
            Không tìm thấy bài viết
          </h1>
          <p className="mt-6 text-pretty text-body-large text-calm-foreground">
            Bài viết này có thể đã được chuyển hoặc chưa được đăng. Hãy xem
            thư viện bài viết để tìm thêm sự khích lệ.
          </p>
          <div className="mt-8">
            <LinkButton href="/articles">Xem tất cả bài viết</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
