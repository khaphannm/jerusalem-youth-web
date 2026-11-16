// Captures the published public content of the CMS into the snapshot file a
// snapshot deployment serves. Run with: npm run snapshot:capture
//
//   --strict-media   fail when any media file is not on an HTTPS media host
//
// The previous snapshot is replaced only after the new one is fully read,
// validated and confirmed unchanged by a second read.
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  captureSnapshot,
  summarizeSnapshot,
} from "../src/lib/cms/snapshot/capture.ts";
import {
  snapshotDirectory,
  snapshotFileName,
} from "../src/lib/cms/snapshot/format.ts";

const run = async () => {
  const baseUrl = process.env.CMS_BASE_URL;

  if (!baseUrl?.trim()) {
    throw new Error("CMS_BASE_URL is required. See .env.example.");
  }

  const snapshot = await captureSnapshot({
    baseUrl,
    requireAbsoluteMedia: process.argv.includes("--strict-media"),
  });
  const directory = path.join(process.cwd(), snapshotDirectory);
  const file = path.join(directory, snapshotFileName);
  const temporary = `${file}.${process.pid}.tmp`;

  await mkdir(directory, { recursive: true });
  await writeFile(temporary, `${JSON.stringify(snapshot)}\n`, "utf8");
  await rename(temporary, file);

  const summary = summarizeSnapshot(snapshot);

  console.log(`Snapshot ${summary.id} captured at ${summary.capturedAt}.`);
  console.table(summary.collections);
  console.table(summary.singles);

  if (summary.relativeMedia > 0) {
    console.warn(
      `${summary.relativeMedia} media file(s) are served from the CMS origin. Use --strict-media for production captures.`,
    );
  }

  console.log(`Written to ${path.relative(process.cwd(), file)}.`);
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Snapshot capture failed: ${message}`);
  process.exitCode = 1;
});
