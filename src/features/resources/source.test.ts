import { describe, expect, it } from "vitest";

import { getResourceSourcePresentation } from "@/features/resources/source";
import type { MediaAsset, ResourceSource } from "@/lib/cms/domain";

const fileAsset = {
  id: "file-1",
  name: "guide",
  url: "https://media.example.test/guide",
  alternativeText: null,
  mimeType: "application/octet-stream",
  width: null,
  height: null,
  sizeInKilobytes: 20,
  variants: [],
} satisfies MediaAsset;

describe("resource source presentation", () => {
  it.each([
    ["application/pdf", "PDF", "Open PDF"],
    ["audio/mpeg", "Audio", "Play audio"],
    ["video/mp4", "Video", "Watch video"],
    ["image/jpeg", "Image", "View image"],
    [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Document",
      "Open document",
    ],
    ["application/octet-stream", "File", "Open file"],
  ])("uses the validated MIME type %s", (mimeType, typeLabel, actionLabel) => {
    const source = {
      asset: { ...fileAsset, mimeType },
      kind: "file",
    } satisfies ResourceSource;

    expect(getResourceSourcePresentation(source)).toEqual({
      actionLabel,
      destination: fileAsset.url,
      typeLabel,
    });
  });

  it("labels an external source without making file assumptions", () => {
    expect(
      getResourceSourcePresentation({
        kind: "external",
        url: "https://partner.example.test/guide",
      }),
    ).toEqual({
      actionLabel: "Open external resource",
      destination: "https://partner.example.test/guide",
      typeLabel: "External link",
    });
  });
});
