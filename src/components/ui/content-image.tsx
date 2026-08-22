import Image from "next/image";

import type { MediaAsset } from "@/lib/cms/domain";

type ContentImageProps = Readonly<{
  asset: MediaAsset;
  className?: string;
  sizes: string;
}>;

const fallbackWidth = 1_600;
const fallbackHeight = 900;

export function ContentImage({
  asset,
  className,
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
        sizes={sizes}
        src={asset.url}
        unoptimized
        width={asset.width ?? fallbackWidth}
      />
    </picture>
  );
}
