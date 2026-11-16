import { createHash } from "node:crypto";

import { z } from "zod";

import {
  snapshotCollections,
  snapshotSingles,
  type SnapshotCollectionEndpoint,
  type SnapshotSingleEndpoint,
} from "./manifest.ts";

/**
 * Bump when the content schemas change in a way that makes older snapshot
 * files unsafe to serve. A deployment refuses a file with another revision.
 */
export const snapshotFormatVersion = 1;

export const snapshotDirectory = "content-snapshot";
export const snapshotFileName = "public-content.json";

type Document = Readonly<Record<string, unknown>>;

export type Snapshot = Readonly<{
  formatVersion: typeof snapshotFormatVersion;
  /** Hash of the content, used to tell releases apart. */
  id: string;
  capturedAt: string;
  /** Origin the content was read from; resolves relative media URLs. */
  sourceOrigin: string;
  collections: Readonly<Record<SnapshotCollectionEndpoint, readonly Document[]>>;
  singles: Readonly<Record<SnapshotSingleEndpoint, Document | null>>;
}>;

export class SnapshotError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SnapshotError";
  }
}

const envelopeSchema = z.object({
  formatVersion: z.number().int(),
  id: z.string().regex(/^[a-f0-9]{16}$/),
  capturedAt: z.iso.datetime({ offset: true }),
  sourceOrigin: z.url(),
  collections: z.record(z.string(), z.array(z.unknown())),
  singles: z.record(z.string(), z.unknown()),
});

const describeIssue = (error: z.ZodError) => {
  const [issue] = error.issues;

  return issue ? `${issue.path.join(".") || "(root)"}: ${issue.message}` : "";
};

const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([first], [second]) => (first < second ? -1 : 1))
        .map(([key, nested]) => [key, sortKeys(nested)]),
    );
  }

  return value;
};

/** Stable text form of the content, independent of object key order. */
export const canonicalContent = (
  content: Pick<Snapshot, "collections" | "singles">,
) =>
  JSON.stringify(
    sortKeys({ collections: content.collections, singles: content.singles }),
  );

export const computeSnapshotId = (
  content: Pick<Snapshot, "collections" | "singles">,
) =>
  createHash("sha256").update(canonicalContent(content)).digest("hex").slice(0, 16);

const asDocument = (value: unknown) => value as Document;

/**
 * Validates every record against the same schemas the live client uses and
 * returns only the fields those schemas know about. Duplicate identifiers and
 * slugs are rejected because lookups by slug must be unambiguous.
 */
export function validateSnapshotContent(content: {
  collections: Readonly<Record<string, readonly unknown[]>>;
  singles: Readonly<Record<string, unknown>>;
}): Pick<Snapshot, "collections" | "singles"> {
  const collections = {} as Record<SnapshotCollectionEndpoint, Document[]>;
  const singles = {} as Record<SnapshotSingleEndpoint, Document | null>;

  for (const { endpoint, schema } of snapshotCollections) {
    const items = content.collections[endpoint];

    if (!items) {
      throw new SnapshotError(`Snapshot is missing the ${endpoint} collection.`);
    }

    const seen = { documentId: new Set<unknown>(), slug: new Set<unknown>() };

    collections[endpoint] = items.map((item, index) => {
      const result = schema.safeParse(item);

      if (!result.success) {
        throw new SnapshotError(
          `Snapshot ${endpoint}[${index}] is invalid: ${describeIssue(result.error)}`,
        );
      }

      const document = asDocument(result.data);

      for (const key of ["documentId", "slug"] as const) {
        const value = document[key];

        if (value === undefined) continue;

        if (seen[key].has(value)) {
          throw new SnapshotError(
            `Snapshot ${endpoint} contains a duplicate ${key}: ${String(value)}.`,
          );
        }

        seen[key].add(value);
      }

      return document;
    });
  }

  for (const { endpoint, required, schema } of snapshotSingles) {
    const value = content.singles[endpoint] ?? null;

    if (value === null) {
      if (required) {
        throw new SnapshotError(
          `Snapshot requires a published ${endpoint} entry.`,
        );
      }

      singles[endpoint] = null;
      continue;
    }

    const result = schema.safeParse(value);

    if (!result.success) {
      throw new SnapshotError(
        `Snapshot ${endpoint} is invalid: ${describeIssue(result.error)}`,
      );
    }

    singles[endpoint] = asDocument(result.data);
  }

  return { collections, singles };
}

/** Parses and fully validates a snapshot file's contents. */
export function parseSnapshot(value: unknown): Snapshot {
  const envelope = envelopeSchema.safeParse(value);

  if (!envelope.success) {
    throw new SnapshotError(
      `Snapshot file is malformed: ${describeIssue(envelope.error)}`,
    );
  }

  if (envelope.data.formatVersion !== snapshotFormatVersion) {
    throw new SnapshotError(
      `Snapshot format ${envelope.data.formatVersion} is not supported by this release (expected ${snapshotFormatVersion}). Capture a new snapshot.`,
    );
  }

  const content = validateSnapshotContent(envelope.data);

  if (computeSnapshotId(content) !== envelope.data.id) {
    throw new SnapshotError(
      "Snapshot content does not match its identifier. The file was changed after capture.",
    );
  }

  return {
    formatVersion: snapshotFormatVersion,
    id: envelope.data.id,
    capturedAt: envelope.data.capturedAt,
    sourceOrigin: new URL(envelope.data.sourceOrigin).origin,
    ...content,
  };
}
