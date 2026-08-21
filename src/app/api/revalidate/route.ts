import { revalidateTag } from "next/cache";

import { handleCmsRevalidation } from "@/lib/cms/revalidation";

export const runtime = "nodejs";

export const POST = (request: Request) =>
  handleCmsRevalidation(request, {
    revalidate: (tag) => revalidateTag(tag, { expire: 0 }),
    secret: process.env.CMS_REVALIDATION_SECRET,
  });
