export type EnvironmentDefinition = Readonly<{
  server: readonly string[];
  public: readonly `NEXT_PUBLIC_${string}`[];
}>;

// No application-specific variables have been approved for the foundation.
export const environmentDefinition = {
  server: [],
  public: [],
} as const satisfies EnvironmentDefinition;

type Environment = Readonly<Record<string, string | undefined>>;

function isMissing(value: string | undefined) {
  return value === undefined || value.trim().length === 0;
}

export function validateEnvironment(
  environment: Environment,
  definition: EnvironmentDefinition = environmentDefinition,
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
