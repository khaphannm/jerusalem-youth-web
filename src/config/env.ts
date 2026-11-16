import { resolveCmsSource } from "../lib/cms/source.ts";

export type EnvironmentDefinition = Readonly<{
  server: readonly string[];
  public: readonly `NEXT_PUBLIC_${string}`[];
}>;

export const environmentDefinition = {
  server: ["CMS_BASE_URL", "CMS_REVALIDATION_SECRET", "SITE_URL"],
  public: [],
} as const satisfies EnvironmentDefinition;

type Environment = Readonly<Record<string, string | undefined>>;

function isMissing(value: string | undefined) {
  return value === undefined || value.trim().length === 0;
}

// A snapshot deployment reads no CMS and accepts no publication webhook, so
// it needs neither the CMS origin nor the revalidation secret.
export const snapshotEnvironmentDefinition = {
  server: ["SITE_URL"],
  public: [],
} as const satisfies EnvironmentDefinition;

export function validateEnvironment(
  environment: Environment,
  definition: EnvironmentDefinition = resolveCmsSource(environment) ===
  "snapshot"
    ? snapshotEnvironmentDefinition
    : environmentDefinition,
) {
  const requiredNames = [...definition.server, ...definition.public];
  const missingNames = requiredNames.filter((name) =>
    isMissing(environment[name]),
  );

  if (missingNames.length === 0) {
    return;
  }

  const variableLabel = missingNames.length === 1 ? "variable" : "variables";

  throw new Error(
    `Missing required environment ${variableLabel}: ${missingNames.join(", ")}. See .env.example.`,
  );
}
