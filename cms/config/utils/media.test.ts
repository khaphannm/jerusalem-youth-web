import assert from 'node:assert/strict';
import test from 'node:test';

import type { Core } from '@strapi/strapi';

import {
  allowedUploadMimeTypes,
  getOptionalHttpsUrl,
  getOptionalS3Credentials,
  requireHttpsUrl,
  resolveS3AclParams,
  uploadMaxFileSizeBytes,
} from './media';

type Environment = Core.Config.Shared.ConfigParams['env'];

const createEnvironment = (values: Record<string, string>): Environment =>
  ((name: string) => values[name]) as Environment;

test('upload constraints allow approved web images and PDFs only', () => {
  const allowedTypes: readonly string[] = allowedUploadMimeTypes;

  assert.equal(uploadMaxFileSizeBytes, 10 * 1024 * 1024);
  assert.ok(allowedTypes.includes('application/pdf'));
  assert.ok(allowedTypes.includes('image/webp'));
  assert.equal(allowedTypes.includes('image/svg+xml'), false);
});

test('S3 credentials must be supplied as a complete pair', () => {
  assert.throws(
    () =>
      getOptionalS3Credentials(
        createEnvironment({ AWS_ACCESS_KEY_ID: 'access-only' }),
      ),
    /must be configured together/,
  );

  assert.deepEqual(
    getOptionalS3Credentials(
      createEnvironment({
        AWS_ACCESS_KEY_ID: 'access',
        AWS_ACCESS_SECRET: 'secret',
      }),
    ),
    { accessKeyId: 'access', secretAccessKey: 'secret' },
  );
});

test('the production CDN must use HTTPS', () => {
  assert.throws(
    () =>
      requireHttpsUrl(
        createEnvironment({ CDN_URL: 'http://cdn.test' }),
        'CDN_URL',
      ),
    /valid HTTPS URL/,
  );
  assert.equal(
    requireHttpsUrl(
      createEnvironment({ CDN_URL: 'https://cdn.test/' }),
      'CDN_URL',
    ),
    'https://cdn.test',
  );
});

test('an explicitly configured S3 endpoint must use HTTPS', () => {
  assert.equal(getOptionalHttpsUrl(createEnvironment({}), 'AWS_ENDPOINT'), undefined);
  assert.throws(
    () =>
      getOptionalHttpsUrl(
        createEnvironment({ AWS_ENDPOINT: 'http://s3.test' }),
        'AWS_ENDPOINT',
      ),
    /valid HTTPS URL/,
  );
});

test('object ACL can be defaulted, set, or switched off for stores without ACLs', () => {
  assert.deepEqual(resolveS3AclParams(undefined), {});
  assert.deepEqual(resolveS3AclParams('bucket-owner-full-control'), {
    ACL: 'bucket-owner-full-control',
  });

  const disabled = resolveS3AclParams('none');

  // The provider skips the ACL header only when the key exists and is empty.
  assert.equal('ACL' in disabled, true);
  assert.equal(disabled.ACL, undefined);
  assert.equal('ACL' in resolveS3AclParams('NONE'), true);
});
