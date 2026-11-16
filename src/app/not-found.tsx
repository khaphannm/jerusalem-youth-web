import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  description: "Không tìm thấy trang bạn yêu cầu.",
  robots: { follow: false, index: false },
  title: "Không tìm thấy trang",
};

export default function NotFound() {
  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="not-found-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Lỗi 404
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="not-found-title"
          >
            Không tìm thấy trang
          </h1>
          <p className="mt-6 text-pretty text-body-large text-foreground">
            Trang này có thể đã được chuyển hoặc đường dẫn chưa đúng. Bạn có
            thể quay về trang chủ hoặc tìm nội dung mình cần.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/">Về trang chủ</LinkButton>
            <LinkButton href="/search" variant="outline">
              Tìm kiếm
            </LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
