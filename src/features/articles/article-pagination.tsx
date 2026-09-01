import { Pagination } from "@/components/ui/pagination";

type ArticlePaginationProps = Readonly<{
  basePath?: string;
  currentPage: number;
  pageCount: number;
}>;

export function ArticlePagination({
  basePath = "/articles",
  currentPage,
  pageCount,
}: ArticlePaginationProps) {
  return (
    <Pagination
      ariaLabel="Article pages"
      basePath={basePath}
      currentPage={currentPage}
      pageCount={pageCount}
    />
  );
}
