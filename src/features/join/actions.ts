import type { CallToAction } from "@/lib/cms/domain";

const fallbackJoinAction = {
  label: "Tìm một buổi gặp gỡ",
  url: "/events",
} satisfies CallToAction;

const pointsBackToJoinPage = (url: string) => {
  if (!url.startsWith("/")) {
    return false;
  }

  try {
    const parsedUrl = new URL(url, "https://site.example.invalid");
    return parsedUrl.pathname.replace(/\/$/, "") === "/join";
  } catch {
    return false;
  }
};

export function resolveJoinPrimaryAction(
  configuredAction: CallToAction | null,
): CallToAction {
  return configuredAction && !pointsBackToJoinPage(configuredAction.url)
    ? configuredAction
    : fallbackJoinAction;
}
