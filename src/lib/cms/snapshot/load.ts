import { readFileSync } from "node:fs";
import path from "node:path";

import {
  parseSnapshot,
  snapshotDirectory,
  snapshotFileName,
  SnapshotError,
  type Snapshot,
} from "./format.ts";

let cached: Snapshot | undefined;

export const snapshotFilePath = (root = process.cwd()) =>
  path.join(root, snapshotDirectory, snapshotFileName);

/**
 * Reads and validates the snapshot bundled with this deployment. Throws when
 * it is missing or invalid: a snapshot deployment must not start without one.
 */
export function loadSnapshotFromDisk(root = process.cwd()): Snapshot {
  if (cached) {
    return cached;
  }

  const file = snapshotFilePath(root);
  let text: string;

  try {
    text = readFileSync(file, "utf8");
  } catch (cause) {
    throw new SnapshotError(
      `CMS_SOURCE=snapshot needs ${snapshotDirectory}/${snapshotFileName}. Run "npm run snapshot:capture" first.`,
      { cause },
    );
  }

  let json: unknown;

  try {
    json = JSON.parse(text) as unknown;
  } catch (cause) {
    throw new SnapshotError("Snapshot file is not valid JSON.", { cause });
  }

  cached = parseSnapshot(json);

  return cached;
}
