import type { Core } from '@strapi/strapi';

import {
  getOptionalEnvironmentValue,
  getOptionalHttpsUrl,
  getOptionalS3Credentials,
  requireEnvironmentValue,
  requireHttpsUrl,
  resolveS3AclParams,
} from '../../utils/media';

const config: Core.Config.Shared.ConfigFunction<Core.Config.Plugin> = ({ env }) => {
  const credentials = getOptionalS3Credentials(env);
  const endpoint = getOptionalHttpsUrl(env, 'AWS_ENDPOINT');
  const objectAcl = getOptionalEnvironmentValue(env, 'AWS_ACL');
  const rootPath = getOptionalEnvironmentValue(env, 'CDN_ROOT_PATH');

  return {
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          baseUrl: requireHttpsUrl(env, 'CDN_URL'),
          ...(rootPath ? { rootPath } : {}),
          s3Options: {
            ...(credentials ? { credentials } : {}),
            region: requireEnvironmentValue(env, 'AWS_REGION'),
            ...(endpoint ? { endpoint } : {}),
            forcePathStyle: env.bool('AWS_FORCE_PATH_STYLE', false),
            params: {
              Bucket: requireEnvironmentValue(env, 'AWS_BUCKET'),
              ...resolveS3AclParams(objectAcl),
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};

export default config;
