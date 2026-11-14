import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import {
  cmsUidCacheTags,
  type CmsCacheTag,
  type CmsContentUid,
} from "./cache";

const minimumSecretLength = 32;
const maximumBodyBytes = 16 * 1024;

const webhookEventSchema = z.enum([
  "entry.create",
  "entry.update",
  "entry.delete",
  "entry.publish",
  "entry.unpublish",
]);

const contentUidSchema = z.enum(
  Object.keys(cmsUidCacheTags) as [CmsContentUid, ...CmsContentUid[]],
);

const cmsUidModelNames = {
  "api::about-page.about-page": "about-page",
  "api::article.article": "article",
  "api::author.author": "author",
  "api::category.category": "category",
  "api::event.event": "event",
  "api::home-page.home-page": "home-page",
  "api::navigation.navigation": "navigation",
  "api::resource.resource": "resource",
  "api::sermon-series.sermon-series": "sermon-series",
  "api::sermon.sermon": "sermon",
  "api::site-setting.site-setting": "site-setting",
  "api::social-links.social-links": "social-links",
  "api::story.story": "story",
} as const satisfies Record<CmsContentUid, string>;

const webhookPayloadSchema = z
  .object({
    event: webhookEventSchema,
    createdAt: z.iso.datetime({ offset: true }),
    model: z.string().trim().min(1),
    uid: contentUidSchema,
    entry: z.record(z.string(), z.unknown()),
  })
  .strict();

type WebhookEvent = z.infer<typeof webhookEventSchema>;

type RevalidationDependencies = Readonly<{
  revalidate: (tag: CmsCacheTag) => void;
  secret: string | undefined;
}>;

const supportingContentUids = new Set<CmsContentUid>([
  "api::author.author",
  "api::category.category",
  "api::sermon-series.sermon-series",
]);

const supportingContentEvents = new Set<WebhookEvent>([
  "entry.create",
  "entry.update",
  "entry.delete",
]);

const publishableContentEvents = new Set<WebhookEvent>([
  "entry.publish",
  "entry.unpublish",
  "entry.delete",
]);

const ignoredPublishableEvents = new Set<WebhookEvent>([
  "entry.create",
  "entry.update",
]);

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

const isValidSecret = (secret: string | undefined): secret is string =>
  typeof secret === "string" && secret.length >= minimumSecretLength;

const isAuthorized = (authorization: string | null, secret: string) => {
  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const digest = (value: string) => createHash("sha256").update(value).digest();
  const supplied = digest(authorization);
  const expected = digest(`Bearer ${secret}`);

  return timingSafeEqual(supplied, expected);
};

const getContentLength = (request: Request) => {
  const value = request.headers.get("content-length");

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
};

export const handleCmsRevalidation = async (
  request: Request,
  { revalidate, secret }: RevalidationDependencies,
) => {
  if (!isValidSecret(secret)) {
    return jsonResponse({ error: "Revalidation is unavailable." }, 500);
  }

  if (!isAuthorized(request.headers.get("authorization"), secret)) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
        "WWW-Authenticate": "Bearer",
      },
    });
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0];

  if (contentType?.trim().toLowerCase() !== "application/json") {
    return jsonResponse({ error: "Content-Type must be application/json." }, 415);
  }

  const declaredLength = getContentLength(request);

  if (declaredLength !== undefined && declaredLength > maximumBodyBytes) {
    return jsonResponse({ error: "Request body is too large." }, 413);
  }

  let body: string;

  try {
    body = await request.text();
  } catch {
    return jsonResponse({ error: "Request body could not be read." }, 400);
  }

  if (Buffer.byteLength(body, "utf8") > maximumBodyBytes) {
    return jsonResponse({ error: "Request body is too large." }, 413);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(body) as unknown;
  } catch {
    return jsonResponse({ error: "Request body must contain valid JSON." }, 400);
  }

  const parsedPayload = webhookPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return jsonResponse({ error: "Invalid Strapi webhook payload." }, 400);
  }

  const { event, model, uid } = parsedPayload.data;

  if (model !== cmsUidModelNames[uid]) {
    return jsonResponse(
      { error: "Webhook model does not match its content UID." },
      400,
    );
  }

  if (supportingContentUids.has(uid)) {
    if (!supportingContentEvents.has(event)) {
      return jsonResponse(
        { error: "Webhook event is invalid for this content type." },
        400,
      );
    }
  } else if (ignoredPublishableEvents.has(event)) {
    return jsonResponse({ revalidated: false, reason: "draft-change" }, 202);
  } else if (!publishableContentEvents.has(event)) {
    return jsonResponse(
      { error: "Webhook event is invalid for this content type." },
      400,
    );
  }

  const tag = cmsUidCacheTags[uid];
  revalidate(tag);

  return jsonResponse({ revalidated: true, tag }, 200);
};
