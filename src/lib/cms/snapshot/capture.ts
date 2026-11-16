import { z } from "zod";

import {
  canonicalContent,
  computeSnapshotId,
  snapshotFormatVersion,
  SnapshotError,
  validateSnapshotContent,
  type Snapshot,
} from "./format.ts";
import { snapshotCollections, snapshotSingles } from "./manifest.ts";

type CaptureOptions = Readonly<{
  baseUrl: string;
  fetch?: typeof fetch;
  now?: () => Date;
  /** Reject media that would be served from the CMS origin. */
  requireAbsoluteMedia?: boolean;
  requestTimeoutMs?: number;
  sleep?: (milliseconds: number) => Promise<void>;
  /** Attempts to reach a CMS that may be starting from sleep. */
  wakeAttempts?: number;
  wakeDelayMs?: number;
}>;

const pageSize = 100;

const collectionPageSchema = z.object({
  data: z.array(z.unknown()),
  meta: z.object({
    pagination: z.object({
      page: z.number().int(),
      pageCount: z.number().int(),
      pageSize: z.number().int(),
      total: z.number().int(),
    }),
  }),
});

const singleSchema = z.object({ data: z.unknown() });

const normalizeOrigin = (baseUrl: string) => {
  let url: URL;

  try {
    url = new URL(baseUrl.trim());
  } catch (cause) {
    throw new SnapshotError("CMS_BASE_URL must be a valid URL.", { cause });
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new SnapshotError(
      "CMS_BASE_URL must be an HTTP or HTTPS origin without credentials.",
    );
  }

  return url.origin;
};

const collectMediaUrls = (value: unknown, found: string[] = []): string[] => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaUrls(item, found));
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.mime === "string" && typeof record.url === "string") {
      found.push(record.url);
    }

    Object.values(record).forEach((item) => collectMediaUrls(item, found));
  }

  return found;
};

/**
 * Reads every published public record from a running CMS and returns a
 * validated snapshot. Nothing is written here; the caller decides whether to
 * keep the result. The content is read twice and must be identical, so an
 * edit made during the capture cannot produce a half-updated snapshot.
 */
export async function captureSnapshot({
  baseUrl,
  fetch: fetchImplementation = fetch,
  now = () => new Date(),
  requireAbsoluteMedia = false,
  requestTimeoutMs = 30_000,
  sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
  wakeAttempts = 8,
  wakeDelayMs = 10_000,
}: CaptureOptions): Promise<Snapshot> {
  const origin = normalizeOrigin(baseUrl);

  const read = async (endpoint: string, parameters: URLSearchParams) => {
    const url = new URL(`/api/${endpoint}`, origin);

    url.search = parameters.toString();

    const response = await fetchImplementation(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    return response;
  };

  const withPopulate = (populate: readonly string[]) => {
    const parameters = new URLSearchParams({ status: "published" });

    populate.forEach((path) => parameters.append("populate", path));

    return parameters;
  };

  // A sleeping host can take longer to answer than one request allows.
  const wake = async () => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= wakeAttempts; attempt += 1) {
      try {
        const response = await read(
          "categories",
          new URLSearchParams({ "pagination[pageSize]": "1" }),
        );

        if (response.ok) return;

        lastError = new SnapshotError(
          `CMS answered ${response.status} while waking.`,
        );
      } catch (error) {
        lastError = error;
      }

      if (attempt < wakeAttempts) await sleep(wakeDelayMs);
    }

    throw new SnapshotError(
      `CMS at ${origin} did not become available after ${wakeAttempts} attempts.`,
      { cause: lastError },
    );
  };

  const readCollection = async (
    endpoint: string,
    populate: readonly string[],
  ) => {
    const items: unknown[] = [];
    let expectedTotal: number | undefined;

    for (let page = 1; ; page += 1) {
      const parameters = withPopulate(populate);

      parameters.set("pagination[page]", String(page));
      parameters.set("pagination[pageSize]", String(pageSize));
      parameters.set("sort[0]", "id:asc");

      const response = await read(endpoint, parameters);

      if (!response.ok) {
        throw new SnapshotError(
          `Reading ${endpoint} page ${page} failed with status ${response.status}.`,
        );
      }

      const parsed = collectionPageSchema.safeParse(await response.json());

      if (!parsed.success) {
        throw new SnapshotError(`CMS returned an invalid ${endpoint} page.`);
      }

      const { pagination } = parsed.data.meta;

      expectedTotal ??= pagination.total;

      if (pagination.total !== expectedTotal) {
        throw new SnapshotError(
          `${endpoint} changed while it was being read. Capture again.`,
        );
      }

      items.push(...parsed.data.data);

      if (page >= pagination.pageCount || parsed.data.data.length === 0) break;
    }

    if (items.length !== expectedTotal) {
      throw new SnapshotError(
        `${endpoint} returned ${items.length} of ${expectedTotal} records.`,
      );
    }

    return items;
  };

  const readSingle = async (endpoint: string, populate: readonly string[]) => {
    const response = await read(endpoint, withPopulate(populate));

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new SnapshotError(
        `Reading ${endpoint} failed with status ${response.status}.`,
      );
    }

    const parsed = singleSchema.safeParse(await response.json());

    if (!parsed.success) {
      throw new SnapshotError(`CMS returned an invalid ${endpoint} payload.`);
    }

    return parsed.data.data ?? null;
  };

  const readEverything = async () => {
    const collections: Record<string, unknown[]> = {};
    const singles: Record<string, unknown> = {};

    for (const { endpoint, populate } of snapshotCollections) {
      collections[endpoint] = await readCollection(endpoint, populate);
    }

    for (const { endpoint, populate } of snapshotSingles) {
      singles[endpoint] = await readSingle(endpoint, populate);
    }

    return validateSnapshotContent({ collections, singles });
  };

  await wake();

  const content = await readEverything();
  const confirmation = await readEverything();

  if (canonicalContent(content) !== canonicalContent(confirmation)) {
    throw new SnapshotError(
      "Content changed during the capture. Ask editors to pause, then capture again.",
    );
  }

  if (requireAbsoluteMedia) {
    const relative = collectMediaUrls(content).filter(
      (url) => !/^https:\/\//.test(url),
    );

    if (relative.length > 0) {
      throw new SnapshotError(
        `${relative.length} media file(s) are not served from an HTTPS media host (for example ${relative[0]}). Visitors would depend on the CMS being awake.`,
      );
    }
  }

  return {
    formatVersion: snapshotFormatVersion,
    id: computeSnapshotId(content),
    capturedAt: now().toISOString(),
    sourceOrigin: origin,
    ...content,
  };
}

export const summarizeSnapshot = (snapshot: Snapshot) => ({
  id: snapshot.id,
  capturedAt: snapshot.capturedAt,
  collections: Object.fromEntries(
    Object.entries(snapshot.collections).map(([endpoint, items]) => [
      endpoint,
      items.length,
    ]),
  ),
  singles: Object.fromEntries(
    Object.entries(snapshot.singles).map(([endpoint, value]) => [
      endpoint,
      value ? "published" : "missing",
    ]),
  ),
  relativeMedia: collectMediaUrls(snapshot).filter(
    (url) => !/^https?:\/\//.test(url),
  ).length,
});
