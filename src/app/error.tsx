"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";

export default function PageError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="page-error-title" tone="surface">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-primary">
            Đã có lỗi
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="page-error-title"
          >
            Trang này tạm thời chưa hiển thị được
          </h1>
          <p className="mt-6 text-pretty text-body-large text-foreground">
            Đã xảy ra sự cố khi tải trang. Bạn vui lòng thử lại, hoặc quay về
            trang chủ.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={reset}>Thử lại</Button>
            <LinkButton href="/" variant="outline">
              Về trang chủ
            </LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
