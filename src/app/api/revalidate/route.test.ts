import { revalidateTag } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const webhookSecret = "test-only-revalidation-secret-32-characters";

const validPayload = {
  event: "entry.publish",
  createdAt: "2026-08-21T06:00:00.000Z",
  model: "article",
  uid: "api::article.article",
  entry: { documentId: "article-1", slug: "published-article" },
};

const createRequest = (
  payload: unknown = validPayload,
  options: Readonly<{
    authorization?: string;
    contentType?: string;
    rawBody?: string;
  }> = {},
) =>
  new Request("https://website.example.test/api/revalidate", {
    method: "POST",
    headers: {
      Authorization: options.authorization ?? `Bearer ${webhookSecret}`,
      "Content-Type": options.contentType ?? "application/json",
    },
    body: options.rawBody ?? JSON.stringify(payload),
  });

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.stubEnv("CMS_REVALIDATION_SECRET", webhookSecret);
    vi.mocked(revalidateTag).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses to report publication on a snapshot deployment", async () => {
    vi.stubEnv("CMS_SOURCE", "snapshot");

    const response = await POST(createRequest());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error:
        "This deployment serves a content snapshot. Publish with a new release.",
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("immediately expires the fixed cache tag for published content", async () => {
    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      revalidated: true,
      tag: "cms:articles",
    });
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("cms:articles", {
      expire: 0,
    });
  });

  it("expires the About Page cache after publication", async () => {
    const response = await POST(
      createRequest({
        ...validPayload,
        model: "about-page",
        uid: "api::about-page.about-page",
      }),
    );

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("cms:about-page", {
      expire: 0,
    });
  });

  it("expires the Home Page cache after publication", async () => {
    const response = await POST(
      createRequest({
        ...validPayload,
        model: "home-page",
        uid: "api::home-page.home-page",
      }),
    );

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("cms:home-page", {
      expire: 0,
    });
  });

  it("expires supporting-content tags on public data changes", async () => {
    const response = await POST(
      createRequest({
        ...validPayload,
        event: "entry.update",
        model: "author",
        uid: "api::author.author",
      }),
    );

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("cms:authors", {
      expire: 0,
    });
  });

  it("accepts but does not revalidate draft-only changes", async () => {
    const response = await POST(
      createRequest({ ...validPayload, event: "entry.update" }),
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      revalidated: false,
      reason: "draft-change",
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects missing or incorrect bearer credentials", async () => {
    const response = await POST(
      createRequest(validPayload, { authorization: "Bearer incorrect-secret" }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe("Bearer");
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects unknown or mismatched UIDs and caller-supplied targets", async () => {
    const unknownUidResponse = await POST(
      createRequest({ ...validPayload, uid: "api::unknown.unknown" }),
    );
    const mismatchedModelResponse = await POST(
      createRequest({ ...validPayload, model: "event" }),
    );
    const suppliedTargetResponse = await POST(
      createRequest({ ...validPayload, path: "/", tags: ["everything"] }),
    );

    expect(unknownUidResponse.status).toBe(400);
    expect(mismatchedModelResponse.status).toBe(400);
    expect(suppliedTargetResponse.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects event and content-type combinations Strapi cannot produce", async () => {
    const response = await POST(
      createRequest({
        ...validPayload,
        event: "entry.publish",
        model: "category",
        uid: "api::category.category",
      }),
    );

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and incorrect content types", async () => {
    const malformedResponse = await POST(
      createRequest(undefined, { rawBody: "{" }),
    );
    const contentTypeResponse = await POST(
      createRequest(validPayload, { contentType: "text/plain" }),
    );

    expect(malformedResponse.status).toBe(400);
    expect(contentTypeResponse.status).toBe(415);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects request bodies larger than the webhook limit", async () => {
    const response = await POST(
      createRequest(undefined, { rawBody: "x".repeat(16 * 1024 + 1) }),
    );

    expect(response.status).toBe(413);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails closed when the configured secret is too short", async () => {
    vi.stubEnv("CMS_REVALIDATION_SECRET", "too-short");

    const response = await POST(createRequest());

    expect(response.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
