// Read-only public delivery for CMS media stored in a private R2 bucket.
// GET and HEAD only: no uploads, deletes, listings or proxying elsewhere.

const CACHE_CONTROL = "public, max-age=2592000";
const SAFE_KEY = /^[A-Za-z0-9_][A-Za-z0-9._\-/]{0,511}$/;

const baseHeaders = () =>
  new Headers({
    "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff",
  });

const plain = (status, message, extra = {}) => {
  const headers = baseHeaders();

  headers.set("Content-Type", "text/plain; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  Object.entries(extra).forEach(([name, value]) => headers.set(name, value));

  return new Response(message, { status, headers });
};

export const objectKeyFromPath = (pathname) => {
  let key;

  try {
    key = decodeURIComponent(pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }

  return SAFE_KEY.test(key) && !key.includes("..") && !key.includes("//")
    ? key
    : null;
};

const handler = {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return plain(405, "Method not allowed.", { Allow: "GET, HEAD" });
    }

    const key = objectKeyFromPath(new URL(request.url).pathname);

    if (!key) {
      return plain(404, "Not found.");
    }

    const object =
      request.method === "HEAD"
        ? await env.MEDIA.head(key)
        : await env.MEDIA.get(key, {
            onlyIf: request.headers,
            range: request.headers,
          });

    if (!object) {
      return plain(404, "Not found.");
    }

    const headers = baseHeaders();

    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Cache-Control", CACHE_CONTROL);
    headers.set("Accept-Ranges", "bytes");

    if (request.method === "HEAD") {
      headers.set("Content-Length", String(object.size));

      return new Response(null, { status: 200, headers });
    }

    // A conditional request that did not match returns metadata without a body.
    if (!("body" in object) || !object.body) {
      const conditionalRead =
        request.headers.has("If-None-Match") ||
        request.headers.has("If-Modified-Since");

      return new Response(null, {
        status: conditionalRead ? 304 : 412,
        headers,
      });
    }

    if (object.range && request.headers.has("Range")) {
      const offset = object.range.offset ?? 0;
      const length = object.range.length ?? object.size - offset;

      headers.set(
        "Content-Range",
        `bytes ${offset}-${offset + length - 1}/${object.size}`,
      );

      return new Response(object.body, { status: 206, headers });
    }

    return new Response(object.body, { status: 200, headers });
  },
};

export default handler;
