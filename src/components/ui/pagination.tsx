import Link from "next/link";

type PaginationProps = Readonly<{
  ariaLabel: string;
  basePath: string;
  currentPage: number;
  pageCount: number;
}>;

const pageHref = (basePath: string, page: number) =>
  page === 1 ? basePath : `${basePath}?page=${page}`;

export function Pagination({
  ariaLabel,
  basePath,
  currentPage,
  pageCount,
}: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"
    >
      {currentPage > 1 ? (
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border bg-background px-4 py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:border-primary hover:text-secondary motion-reduce:transition-none"
          href={pageHref(basePath, currentPage - 1)}
          rel="prev"
        >
          <span aria-hidden="true">←</span>
          Trước
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border px-4 py-2 font-label text-label font-bold text-muted"
        >
          <span aria-hidden="true">←</span>
          Trước
        </span>
      )}

      <p className="text-body-small text-muted">
        Trang {currentPage} / {pageCount}
      </p>

      {currentPage < pageCount ? (
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border bg-background px-4 py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:border-primary hover:text-secondary motion-reduce:transition-none"
          href={pageHref(basePath, currentPage + 1)}
          rel="next"
        >
          Sau
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex min-h-11 items-center gap-2 rounded-small border border-border px-4 py-2 font-label text-label font-bold text-muted"
        >
          Sau
          <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
