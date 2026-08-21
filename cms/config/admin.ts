import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const requireSecret = (name: string) => {
    const value = env(name);

    if (!value || value.trim().length === 0) {
      throw new Error(`${name} is required.`);
    }

    return value;
  };

  return {
    auth: {
      secret: requireSecret('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: requireSecret('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: requireSecret('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: requireSecret('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
  };
};

export default config;
