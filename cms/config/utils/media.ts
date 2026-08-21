import type { Core } from '@strapi/strapi';

type Environment = Core.Config.Shared.ConfigParams['env'];

export const uploadMaxFileSizeBytes = 10 * 1024 * 1024;

export const allowedUploadMimeTypes = [
  'application/pdf',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const getTrimmedValue = (value: string | undefined) => value?.trim() || undefined;

export const requireEnvironmentValue = (
  env: Environment,
  name: string,
): string => {
  const value = getTrimmedValue(env(name));

  if (!value) {
    throw new Error(`${name} must be configured.`);
  }

  return value;
};

export const getOptionalEnvironmentValue = (
  env: Environment,
  name: string,
) => getTrimmedValue(env(name));

const parseHttpsUrl = (value: string, name: string): string => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL.`);
  }

  if (url.protocol !== 'https:') {
    throw new Error(`${name} must be a valid HTTPS URL.`);
  }

  return url.toString().replace(/\/$/, '');
};

export const requireHttpsUrl = (env: Environment, name: string): string =>
  parseHttpsUrl(requireEnvironmentValue(env, name), name);

export const getOptionalHttpsUrl = (
  env: Environment,
  name: string,
): string | undefined => {
  const value = getOptionalEnvironmentValue(env, name);

  return value ? parseHttpsUrl(value, name) : undefined;
};

export const getOptionalUrlOrigin = (
  value: string | undefined,
): string | undefined => {
  const normalized = getTrimmedValue(value);

  if (!normalized) {
    return undefined;
  }

  try {
    return new URL(normalized).origin;
  } catch {
    throw new Error('CDN_URL must be a valid URL.');
  }
};

export const getOptionalS3Credentials = (env: Environment) => {
  const accessKeyId = getOptionalEnvironmentValue(env, 'AWS_ACCESS_KEY_ID');
  const secretAccessKey = getOptionalEnvironmentValue(env, 'AWS_ACCESS_SECRET');

  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error(
      'AWS_ACCESS_KEY_ID and AWS_ACCESS_SECRET must be configured together.',
    );
  }

  return accessKeyId && secretAccessKey
    ? { accessKeyId, secretAccessKey }
    : undefined;
};
