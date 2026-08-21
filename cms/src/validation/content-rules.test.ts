import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getEventTimingError,
  getResourceSourceError,
  resolveSingleMediaPresence,
} from './content-rules';

test('an event may omit endDateTime for a single-time event', () => {
  assert.equal(
    getEventTimingError({ startDateTime: '2026-09-01T10:00:00.000Z' }),
    undefined,
  );
});

test('an event rejects an end before its start', () => {
  assert.equal(
    getEventTimingError({
      startDateTime: '2026-09-01T10:00:00.000Z',
      endDateTime: '2026-09-01T09:59:59.000Z',
    }),
    'Event endDateTime must be on or after startDateTime.',
  );
});

test('an event requires explicit timezone offsets', () => {
  assert.equal(
    getEventTimingError({ startDateTime: '2026-09-01T10:00:00' }),
    'Event date-times must include an explicit ISO 8601 timezone offset.',
  );
  assert.equal(
    getEventTimingError({ startDateTime: '2026-09-01T10:00:00+07:00' }),
    undefined,
  );
});

test('a resource accepts exactly one source', () => {
  assert.equal(getResourceSourceError({ file: 1 }), undefined);
  assert.equal(
    getResourceSourceError({ externalURL: 'https://example.com/resource' }),
    undefined,
  );
});

test('a resource rejects missing or conflicting sources', () => {
  const expected = 'Resource must have exactly one source: file or externalURL.';

  assert.equal(getResourceSourceError({}), expected);
  assert.equal(
    getResourceSourceError({
      file: 1,
      externalURL: 'https://example.com/resource',
    }),
    expected,
  );
});

test('resource updates preserve or replace the existing source', () => {
  assert.equal(
    getResourceSourceError({ title: 'Updated' }, { file: { id: 1 } }),
    undefined,
  );
  assert.equal(
    getResourceSourceError(
      {
        file: { disconnect: [{ id: 1 }] },
        externalURL: 'https://example.com/resource',
      },
      { file: { id: 1 } },
    ),
    undefined,
  );
});

test('single-media relation operations resolve their resulting presence', () => {
  assert.equal(resolveSingleMediaPresence({ set: [] }, true), false);
  assert.equal(resolveSingleMediaPresence({ connect: [{ id: 1 }] }, false), true);
  assert.equal(
    resolveSingleMediaPresence({ disconnect: [{ id: 1 }] }, true),
    false,
  );
});
