import assert from "node:assert/strict";
import test from "node:test";

import worker, { objectKeyFromPath } from "./src/index.js";

const stored = (body, contentType) => ({
  body,
  httpEtag: '"abc123"',
  size: body.length,
  writeHttpMetadata: (headers) => headers.set("Content-Type", contentType),
});

const createBucket = () => {
  const calls = [];
  const objects = { "uploads/photo_1a2b.webp": stored("image-bytes", "image/webp") };

  return {
    calls,
    MEDIA: {
      async get(key, options) {
        calls.push(["get", key]);
        const object = objects[key];

        if (!object) return null;

        if (options.onlyIf.get("If-None-Match") === object.httpEtag) {
          return { ...object, body: undefined };
        }

        if (options.range.has("Range")) {
          return { ...object, body: "image", range: { offset: 0, length: 5 } };
        }

        return object;
      },
      async head(key) {
        calls.push(["head", key]);

        return objects[key] ?? null;
      },
    },
  };
};

const request = (path, init) =>
  new Request(`https://media.example.workers.dev${path}`, init);

test("serves a stored file with type, cache and CORS headers", async () => {
  const env = createBucket();
  const response = await worker.fetch(request("/uploads/photo_1a2b.webp"), env);

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "image-bytes");
  assert.equal(response.headers.get("Content-Type"), "image/webp");
  assert.equal(response.headers.get("ETag"), '"abc123"');
  assert.equal(response.headers.get("Cache-Control"), "public, max-age=2592000");
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
});

test("answers HEAD, conditional and range requests", async () => {
  const env = createBucket();
  const head = await worker.fetch(
    request("/uploads/photo_1a2b.webp", { method: "HEAD" }),
    env,
  );
  const unchanged = await worker.fetch(
    request("/uploads/photo_1a2b.webp", {
      headers: { "If-None-Match": '"abc123"' },
    }),
    env,
  );
  const partial = await worker.fetch(
    request("/uploads/photo_1a2b.webp", { headers: { Range: "bytes=0-4" } }),
    env,
  );

  assert.equal(head.status, 200);
  assert.equal(head.headers.get("Content-Length"), "11");
  assert.equal(await head.text(), "");
  assert.equal(unchanged.status, 304);
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get("Content-Range"), "bytes 0-4/11");
});

test("refuses writes and never touches the bucket for them", async () => {
  const env = createBucket();

  for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
    const response = await worker.fetch(
      request("/uploads/photo_1a2b.webp", { method }),
      env,
    );

    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Allow"), "GET, HEAD");
  }

  assert.deepEqual(env.calls, []);
});

test("returns 404 for missing files, listings and unsafe keys", async () => {
  const env = createBucket();

  for (const path of ["/", "/missing.webp", "/uploads/%2e%2e/secret", "/a//b", "/%E0%A4%A"]) {
    const response = await worker.fetch(request(path), env);

    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }

  assert.equal(objectKeyFromPath("/uploads/../secret"), null);
  assert.equal(objectKeyFromPath("/.hidden"), null);
  assert.equal(objectKeyFromPath("/uploads/photo_1a2b.webp"), "uploads/photo_1a2b.webp");
});
