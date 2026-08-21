import type { Core } from '@strapi/strapi';

import {
  allowedUploadMimeTypes,
  requireEnvironmentValue,
  uploadMaxFileSizeBytes,
} from './utils/media';

const config: Core.Config.Shared.ConfigFunction<Core.Config.Plugin> = ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      sizeLimit: uploadMaxFileSizeBytes,
      security: {
        allowedTypes: [...allowedUploadMimeTypes],
      },
    },
  },
  'users-permissions': {
    config: {
      jwtSecret: requireEnvironmentValue(env, 'JWT_SECRET'),
    },
  },
});

export default config;
