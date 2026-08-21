import type { Core } from '@strapi/strapi';

import {
  getOptionalUrlOrigin,
  uploadMaxFileSizeBytes,
} from './utils/media';

const cdnOrigin = getOptionalUrlOrigin(process.env.CDN_URL);
const mediaSources = [
  "'self'",
  'data:',
  'blob:',
  'market-assets.strapi.io',
  ...(cdnOrigin ? [cdnOrigin] : []),
];

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': mediaSources,
          'media-src': mediaSources,
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formidable: {
        maxFileSize: uploadMaxFileSizeBytes,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
