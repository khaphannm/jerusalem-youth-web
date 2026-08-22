import Link from "next/link";

type ArticlePaginationProps = Readonly<{
  basePath?: string;
  currentPage: number;
  pageCount: number;
}>;

const articlePageHref = (basePath: string, page: number) =>
  page === 1 ? basePath : `${basePath}?page=${page}`;

export function ArticlePagination({
  basePath = "/articles",
  currentPage,
  pageCount,
}: ArticlePaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Article pages"
      className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"
    >
      {currentPage > 1 ? (
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border bg-background px-4 py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:border-primary hover:text-secondary motion-reduce:transition-none"
          href={articlePageHref(basePath, currentPage - 1)}
          rel="prev"
        >
          <span aria-hidden="true">←</span>
          Previous
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border px-4 py-2 font-label text-label font-bold text-muted"
        >
          <span aria-hidden="true">←</span>
          Previous
        </span>
      )}

      <p className="text-body-small text-muted">
        Page {currentPage} of {pageCount}
      </p>

      {currentPage < pageCount ? (
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border bg-background px-4 py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:border-primary hover:text-secondary motion-reduce:transition-none"
          href={articlePageHref(basePath, currentPage + 1)}
          rel="next"
        >
          Next
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border px-4 py-2 font-label text-label font-bold text-muted"
        >
          Next
          <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
