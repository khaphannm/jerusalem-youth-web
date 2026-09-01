export type ExternalVideoEmbed = Readonly<{
  embedUrl: string;
  provider: "Vimeo" | "YouTube";
}>;

const youtubeHosts = new Set([
  "m.youtube.com",
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "youtube.com",
]);
const vimeoHosts = new Set([
  "player.vimeo.com",
  "vimeo.com",
  "www.vimeo.com",
]);
const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
const vimeoIdPattern = /^\d+$/;

const getYoutubeId = (url: URL) => {
  if (url.hostname === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  const segments = url.pathname.split("/").filter(Boolean);

  if (segments[0] === "watch") {
    return url.searchParams.get("v");
  }

  if (["embed", "live", "shorts"].includes(segments[0] ?? "")) {
    return segments[1] ?? null;
  }

  return null;
};

const getVimeoId = (url: URL) =>
  url.pathname
    .split("/")
    .filter(Boolean)
    .findLast((segment) => vimeoIdPattern.test(segment)) ?? null;

export function getExternalVideoEmbed(
  value: string,
): ExternalVideoEmbed | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    return null;
  }

  if (youtubeHosts.has(url.hostname)) {
    const videoId = getYoutubeId(url);

    return videoId && youtubeIdPattern.test(videoId)
      ? {
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
          provider: "YouTube",
        }
      : null;
  }

  if (vimeoHosts.has(url.hostname)) {
    const videoId = getVimeoId(url);

    return videoId
      ? {
          embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
          provider: "Vimeo",
        }
      : null;
  }

  return null;
}
