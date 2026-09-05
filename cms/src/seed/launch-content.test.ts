import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertLaunchSeedSafety,
  launchArticles,
  launchAssets,
  launchEvents,
  launchResources,
  launchSeedCounts,
  launchSermons,
  launchSingles,
  launchStories,
  REVIEW_SEED_PREFIX,
} from './launch-content';

const editorialEntries = [
  ...launchArticles,
  ...launchEvents,
  ...launchResources,
  ...launchSermons,
  ...launchStories,
];

test('review seed requires explicit confirmation and is blocked in production', () => {
  assert.throws(
    () => assertLaunchSeedSafety({ confirmed: false }),
    /not confirmed/,
  );
  assert.throws(
    () =>
      assertLaunchSeedSafety({ confirmed: true, environment: 'production' }),
    /blocked in NODE_ENV=production/,
  );
  assert.doesNotThrow(() =>
    assertLaunchSeedSafety({ confirmed: true, environment: 'development' }),
  );
});

test('review seed meets the recommended launch content volume', () => {
  assert.ok(launchSeedCounts.articles >= 5);
  assert.ok(launchSeedCounts.sermons >= 5);
  assert.ok(launchSeedCounts.stories >= 3);
  assert.ok(launchSeedCounts.events >= 1);
  assert.ok(launchSeedCounts.resources >= 1);
});

test('fictional editorial entries stay visibly labeled and non-indexable', () => {
  for (const entry of editorialEntries) {
    assert.match(entry.slug, /^review-/);
    assert.ok(String(entry.data.title).startsWith(REVIEW_SEED_PREFIX));
    assert.equal(
      (entry.data.seo as { noIndex?: boolean } | undefined)?.noIndex,
      true,
    );
  }

  assert.equal(new Set(editorialEntries.map(({ slug }) => slug)).size, 19);
});

test('supplied ministry facts are preserved exactly where the CMS supports them', () => {
  assert.equal(launchSingles.siteSetting.siteName, 'Jerusalem Youth');
  assert.equal(
    launchSingles.siteSetting.organizationContact.address,
    '99 Trương Đăng Quế, phường Hạnh Thông, Gò Vấp',
  );
  assert.deepEqual(launchSingles.socialLinks.links, [
    {
      platform: 'Facebook',
      url: 'https://www.facebook.com/jerusalemyouth20',
      displayOrder: 1,
    },
  ]);
});

test('provisional event keeps the supplied date and venue reviewable', () => {
  const [event] = launchEvents;
  assert.equal(event.data.startDateTime, '2026-09-11T19:00:00+07:00');
  assert.equal(event.data.endDateTime, '2026-09-11T21:00:00+07:00');
  assert.equal(event.data.locationName, 'DINO Coffee');
  assert.match(String(event.data.summary), /Confirm the year, exact time/);
});

test('unverified outbound links use the reserved review-only example domain', () => {
  for (const entry of [...launchSermons, ...launchResources]) {
    const url = String(entry.data.videoURL ?? entry.data.externalURL);
    assert.match(url, /^https:\/\/example\.com\/review-only\//);
  }
});

test('generated image placeholders have unique names and editorial metadata', () => {
  const assets = Object.values(launchAssets);
  assert.equal(new Set(assets.map(({ fileName }) => fileName)).size, 5);

  for (const asset of assets) {
    assert.match(asset.fileName, /^review-.*\.webp$/);
    assert.ok(asset.alternativeText.length > 20);
    assert.match(asset.caption, /Generated review placeholder/);
  }
});
