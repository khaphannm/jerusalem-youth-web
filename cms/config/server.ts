import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => {
  const appKeys = env.array('APP_KEYS', []);

  if (appKeys.length === 0 || appKeys.some((key) => key.trim().length === 0)) {
    throw new Error('APP_KEYS must contain comma-separated non-empty values.');
  }

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: appKeys,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};

export default config;
