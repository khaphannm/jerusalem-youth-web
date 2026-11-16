import { revalidateTag } from "next/cache";

import { handleCmsRevalidation } from "@/lib/cms/revalidation";
import { resolveCmsSource } from "@/lib/cms/source";

export const runtime = "nodejs";

// Tag expiry cannot publish a snapshot deployment: its content changes only
// with a new release, so the webhook must not report success here.
export const POST = (request: Request) =>
  resolveCmsSource(process.env) === "snapshot"
    ? Response.json(
        {
          error:
            "This deployment serves a content snapshot. Publish with a new release.",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      )
    : handleCmsRevalidation(request, {
        revalidate: (tag) => revalidateTag(tag, { expire: 0 }),
        secret: process.env.CMS_REVALIDATION_SECRET,
      });
