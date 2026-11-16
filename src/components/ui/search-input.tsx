import { Button } from "@/components/ui/button";
import {
  maximumSearchQueryLength,
  minimumSearchQueryLength,
} from "@/lib/search-query";

type SearchInputProps = Readonly<{
  defaultValue?: string;
}>;

export function SearchInput({ defaultValue = "" }: SearchInputProps) {
  return (
    <form
      action="/search"
      aria-label="Tìm kiếm trong trang"
      className="mt-8 max-w-reading"
      method="get"
      role="search"
    >
      <label
        className="font-label text-label font-bold text-secondary-foreground"
        htmlFor="site-search-query"
      >
        Bạn đang tìm gì?
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          aria-describedby="site-search-help"
          className="min-h-12 w-full rounded-small border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors duration-fast ease-standard placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary motion-reduce:transition-none"
          defaultValue={defaultValue}
          enterKeyHint="search"
          id="site-search-query"
          maxLength={maximumSearchQueryLength}
          minLength={minimumSearchQueryLength}
          name="q"
          placeholder="Ví dụ: đức tin, cầu nguyện"
          required
          type="search"
        />
        <Button
          className="w-full shrink-0 whitespace-nowrap sm:w-auto"
          size="large"
          type="submit"
        >
          Tìm kiếm
        </Button>
      </div>
      <p
        className="mt-3 text-body-small text-secondary-foreground/80"
        id="site-search-help"
      >
        Nhập ít nhất {minimumSearchQueryLength} ký tự. Tìm trong bài viết, sự
        kiện, bài giảng, câu chuyện và tài liệu đã đăng.
      </p>
    </form>
  );
}
