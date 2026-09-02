const localHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function configurationError(reason: string) {
  return new Error(`Invalid SITE_URL: ${reason} See .env.example.`);
}

export function resolveSiteUrl(
  value: string | undefined,
  environment = process.env.NODE_ENV,
) {
  if (!value?.trim()) {
    throw configurationError("a web origin is required.");
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw configurationError("use an absolute HTTP(S) URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw configurationError("use an HTTP(S) URL.");
  }

  if (url.username || url.password) {
    throw configurationError("credentials are not allowed.");
  }

  if (url.pathname !== "/" || url.search || url.hash) {
    throw configurationError("use an origin without a path, query, or fragment.");
  }

  if (environment === "production") {
    if (url.protocol !== "https:") {
      throw configurationError("production must use HTTPS.");
    }

    if (localHostnames.has(url.hostname)) {
      throw configurationError("production must use a public hostname.");
    }
  }

  return new URL(url.origin);
}

export function getSiteUrl() {
  return resolveSiteUrl(process.env.SITE_URL);
}
