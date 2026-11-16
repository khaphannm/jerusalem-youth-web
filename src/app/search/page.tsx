import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SafeLink } from "@/components/ui/safe-link";
import { SearchInput } from "@/components/ui/search-input";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  parseSearchQuery,
  searchPublicContent,
  type SearchData,
  type SearchResultGroup,
} from "@/features/search/data";

type SearchPageProps = Readonly<{
  searchParams: Promise<{
    q?: string | string[];
  }>;
}>;

const searchDescription =
  "Tìm trong các bài viết, sự kiện, bài giảng, câu chuyện và tài liệu đã đăng trên trang.";

export const metadata: Metadata = {
  description: searchDescription,
  robots: { follow: true, index: false },
  title: "Tìm kiếm",
};

function ResultGroup({ group }: Readonly<{ group: SearchResultGroup }>) {
  const visibleDescription =
    group.total > group.items.length
      ? `Hiển thị ${group.items.length} trên ${group.total}`
      : `${group.total} kết quả`;

  return (
    <section aria-labelledby={`search-${group.id}-title`} className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <h3
          className="font-heading text-heading-3 font-bold"
          id={`search-${group.id}-title`}
        >
          {group.label}
        </h3>
        <p className="text-body-small text-muted">{visibleDescription}</p>
      </div>

      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {group.items.map((result) => (
          <li className="motion-reveal h-full" key={`${group.id}-${result.id}`}>
            <article className="flex h-full flex-col rounded-large border border-border bg-surface p-6 sm:rounded-xlarge sm:p-8 transition-transform duration-normal ease-emphasized hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
              <p className="font-label text-label font-bold uppercase text-primary">
                {result.typeLabel}
                {result.context ? (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span className="text-secondary">{result.context}</span>
                  </>
                ) : null}
              </p>
              <h4 className="mt-4 font-heading text-body-large font-bold">
                <SafeLink
                  className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
                  href={result.href}
                >
                  {result.title}
                </SafeLink>
              </h4>
              <p className="mt-3 flex-1 text-muted">{result.summary}</p>
              <SafeLink
                className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
                href={result.href}
              >
                Xem {result.typeLabel.toLowerCase()}
                <span aria-hidden="true">→</span>
              </SafeLink>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchResults({
  data,
  query,
}: Readonly<{ data: SearchData | null; query: ReturnType<typeof parseSearchQuery> }>) {
  if (query.status === "empty") {
    return (
      <EmptyState
        description="Nhập chủ đề, tên sự kiện, người chia sẻ hoặc tên tài liệu để tìm trong nội dung đã đăng."
        title="Bắt đầu tìm kiếm"
      />
    );
  }

  if (query.status === "too-short") {
    return (
      <EmptyState
        description="Hãy nhập thêm ký tự để tìm chính xác hơn."
        title="Cần ít nhất hai ký tự để tìm"
      />
    );
  }

  if (!data || data.status === "error") {
    return (
      <EmptyState
        description="Hiện chưa tìm kiếm được. Bạn vui lòng thử lại sau ít phút."
        title="Tạm thời chưa tìm kiếm được"
      />
    );
  }

  const availabilityNotice =
    data.unavailableTypes.length > 0 ? (
      <p
        className="mb-6 rounded-medium border border-border bg-background p-4 text-body-small text-muted"
        role="status"
      >
        Một số kết quả tạm thời chưa xem được: {data.unavailableTypes.join(", ")}.
      </p>
    ) : null;

  if (data.matchedTotal === 0) {
    return (
      <>
        {availabilityNotice}
        <EmptyState
          description="Hãy thử chủ đề rộng hơn, kiểm tra chính tả hoặc tìm một sự kiện, bài giảng, câu chuyện hay tài liệu khác."
          title={`Không có kết quả cho “${query.value}”`}
        />
      </>
    );
  }

  return (
    <>
      {availabilityNotice}
      {data.groups.map((group) => (
        <ResultGroup group={group} key={group.id} />
      ))}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = parseSearchQuery(params.q);
  const data =
    query.status === "ready" ? await searchPublicContent(query.value) : null;
  const resultsDescription =
    query.status !== "ready"
      ? "Nhập từ khóa ở trên để tìm trong nội dung đã đăng."
      : data?.status === "ready"
        ? `${data.matchedTotal} kết quả cho “${query.value}”.`
        : `Chưa tải được kết quả cho “${query.value}”.`;

  return (
    <main className="flex-1" id="main-content" lang="vi" tabIndex={-1}>
      <Section aria-labelledby="search-title" tone="secondary">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-calm">
              Tìm điều bạn cần
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="search-title"
            >
              Tìm kiếm trên trang
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              {searchDescription}
            </p>
          </div>
          <SearchInput defaultValue={query.value} />
        </Container>
      </Section>

      <Section aria-labelledby="search-results-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={resultsDescription}
            eyebrow="Nội dung đã đăng"
            id="search-results-title"
            tone="white"
            title="Kết quả tìm kiếm"
          />
          <div className="mt-10">
            <SearchResults data={data} query={query} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
