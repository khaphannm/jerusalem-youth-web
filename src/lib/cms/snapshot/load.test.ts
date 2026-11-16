import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { snapshotDirectory, snapshotFileName } from "./format";

const emptyRoot = () => mkdtempSync(path.join(tmpdir(), "snapshot-"));

const rootWith = (text: string) => {
  const root = emptyRoot();

  mkdirSync(path.join(root, snapshotDirectory));
  writeFileSync(path.join(root, snapshotDirectory, snapshotFileName), text);

  return root;
};

describe("loading the deployment snapshot", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("stops with a clear message when the file is missing or unreadable", async () => {
    const { loadSnapshotFromDisk } = await import("./load");

    expect(() => loadSnapshotFromDisk(emptyRoot())).toThrow(
      /needs content-snapshot\/public-content\.json/,
    );
    expect(() => loadSnapshotFromDisk(rootWith("{not json"))).toThrow(
      "Snapshot file is not valid JSON.",
    );
    expect(() => loadSnapshotFromDisk(rootWith("{}"))).toThrow(
      /Snapshot file is malformed/,
    );
  });
});
