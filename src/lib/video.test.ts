import { describe, expect, it } from "vitest";

import { getExternalVideoEmbed } from "@/lib/video";

describe("external video embeds", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  ])("maps a supported YouTube URL to its privacy-enhanced embed", (url) => {
    expect(getExternalVideoEmbed(url)).toEqual({
      embedUrl:
        "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
      provider: "YouTube",
    });
  });

  it.each([
    "https://vimeo.com/123456789",
    "https://player.vimeo.com/video/123456789",
  ])("maps a supported Vimeo URL to its embed", (url) => {
    expect(getExternalVideoEmbed(url)).toEqual({
      embedUrl: "https://player.vimeo.com/video/123456789?autoplay=1",
      provider: "Vimeo",
    });
  });

  it.each([
    "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://user:password@youtu.be/dQw4w9WgXcQ",
    "https://video.example.test/watch/message",
    "javascript:alert(1)",
  ])("does not embed an unsupported or unsafe URL %s", (url) => {
    expect(getExternalVideoEmbed(url)).toBeNull();
  });
});
