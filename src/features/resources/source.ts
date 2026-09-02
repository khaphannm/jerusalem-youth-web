import type { Resource, ResourceSource } from "@/lib/cms/domain";

export type ResourceSourcePresentation = Readonly<{
  actionLabel: string;
  destination: string;
  typeLabel: string;
}>;

const getFileTypeLabel = (mimeType: string) => {
  const normalizedMimeType = mimeType.toLowerCase();

  if (normalizedMimeType === "application/pdf") {
    return "PDF";
  }
  if (normalizedMimeType.startsWith("audio/")) {
    return "Audio";
  }
  if (normalizedMimeType.startsWith("video/")) {
    return "Video";
  }
  if (normalizedMimeType.startsWith("image/")) {
    return "Image";
  }
  if (
    normalizedMimeType.startsWith("text/") ||
    normalizedMimeType === "application/msword" ||
    normalizedMimeType.includes("wordprocessingml")
  ) {
    return "Document";
  }
  if (
    normalizedMimeType.includes("spreadsheet") ||
    normalizedMimeType.includes("excel")
  ) {
    return "Spreadsheet";
  }
  if (
    normalizedMimeType.includes("presentation") ||
    normalizedMimeType.includes("powerpoint")
  ) {
    return "Presentation";
  }
  if (
    normalizedMimeType.includes("zip") ||
    normalizedMimeType.includes("compressed")
  ) {
    return "Archive";
  }

  return "File";
};

const getFileActionLabel = (typeLabel: string) => {
  switch (typeLabel) {
    case "Audio":
      return "Play audio";
    case "Image":
      return "View image";
    case "PDF":
      return "Open PDF";
    case "Video":
      return "Watch video";
    default:
      return `Open ${typeLabel.toLowerCase()}`;
  }
};

export function getResourceSourcePresentation(
  source: ResourceSource,
): ResourceSourcePresentation {
  if (source.kind === "external") {
    return {
      actionLabel: "Open external resource",
      destination: source.url,
      typeLabel: "External link",
    };
  }

  const typeLabel = getFileTypeLabel(source.asset.mimeType);

  return {
    actionLabel: getFileActionLabel(typeLabel),
    destination: source.asset.url,
    typeLabel,
  };
}

export const getResourcePresentation = (resource: Resource) =>
  getResourceSourcePresentation(resource.source);
