import Image from "next/image";
import type { ImageProps } from "next/image";

import type { MediaAsset } from "@/lib/cms/domain";

type ContentImageProps = Readonly<{
  asset: MediaAsset;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: ImageProps["fetchPriority"];
  onError?: ImageProps["onError"];
  sizes: string;
}>;

const fallbackWidth = 1_600;
const fallbackHeight = 900;

export function ContentImage({
  asset,
  className,
  loading,
  fetchPriority,
  onError,
  sizes,
}: ContentImageProps) {
  const responsiveSources = [
    ...asset.variants,
    ...(asset.width && asset.height
      ? [{ height: asset.height, url: asset.url, width: asset.width }]
      : []),
  ]
    .filter(
      (source, index, sources) =>
        sources.findIndex(({ width }) => width === source.width) === index,
    )
    .sort((left, right) => left.width - right.width);
  const sourceSet = responsiveSources
    .map(({ url, width }) => `${url} ${width}w`)
    .join(", ");

  return (
    <picture>
      {sourceSet ? <source sizes={sizes} srcSet={sourceSet} /> : null}
      <Image
        alt={asset.alternativeText ?? ""}
        className={className}
        decoding="async"
        height={asset.height ?? fallbackHeight}
        loading={loading}
        fetchPriority={fetchPriority}
        onError={onError}
        sizes={sizes}
        src={asset.url}
        unoptimized
        width={asset.width ?? fallbackWidth}
      />
    </picture>
  );
}
