import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database<'postgres'> => {
  const client = env('DATABASE_CLIENT', 'postgres');

  if (client !== 'postgres') {
    throw new Error(`Unsupported DATABASE_CLIENT: ${client}. CMS-001 requires "postgres".`);
  }

  const connectionString = env('DATABASE_URL');
  const password = env('DATABASE_PASSWORD', '');

  if (!connectionString && password.length === 0) {
    throw new Error('DATABASE_PASSWORD is required when DATABASE_URL is not set.');
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        ...(connectionString ? { connectionString } : {}),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'jerusalem_youth'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password,
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

export default config;
