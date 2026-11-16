export type CmsSource = "live" | "snapshot";

type Environment = Readonly<Record<string, string | undefined>>;

/**
 * Where public content is read from. `live` (the default) reads Strapi over
 * HTTP; `snapshot` reads the content file captured for this deployment.
 */
export function resolveCmsSource(environment: Environment): CmsSource {
  const value = environment.CMS_SOURCE?.trim();

  if (!value || value === "live") {
    return "live";
  }

  if (value === "snapshot") {
    return "snapshot";
  }

  throw new Error(
    'CMS_SOURCE must be "live" or "snapshot". See .env.example.',
  );
}
