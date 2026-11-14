import type { MouseEventHandler } from "react";

import { SafeLink } from "@/components/ui/safe-link";
import type { NavigationItem } from "@/lib/cms/domain";

type NavigationLinkProps = Readonly<{
  item: NavigationItem;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  tone?: keyof typeof toneClasses;
  locale?: "en" | "vi";
}>;

const toneClasses = {
  default: "text-foreground hover:bg-surface hover:text-primary",
  inverse:
    "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
} as const;

const baseClasses =
  "inline-flex min-h-11 max-w-full items-center rounded-small px-3 py-2 font-label text-label font-semibold transition-colors duration-fast ease-standard motion-reduce:transition-none";

const vietnameseLabels: Readonly<Record<string, string>> = {
  About: "Giới thiệu",
  Events: "Sự kiện",
  Articles: "Bài viết",
  Sermons: "Sứ điệp",
  Stories: "Câu chuyện",
  Resources: "Tài liệu",
  "Join Us": "Tham gia",
  "Join us": "Tham gia",
  Contact: "Liên hệ",
  Home: "Trang chủ",
  Media: "Hình ảnh",
  Search: "Tìm kiếm",
};

export function NavigationLink({
  item,
  onClick,
  tone = "default",
  locale = "en",
}: NavigationLinkProps) {
  return (
    <SafeLink
      className={`${baseClasses} ${toneClasses[tone]}`}
      href={item.url}
      onClick={onClick}
      openInNewTab={item.openInNewTab}
    >
      {locale === "vi"
        ? (vietnameseLabels[item.label] ?? item.label)
        : item.label}
    </SafeLink>
  );
}
