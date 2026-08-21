export type ContentValues = Record<string, unknown>;

const hasOwn = (value: ContentValues, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const hasText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const hasExplicitTimezone = (value: string) =>
  /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);

export const getEventTimingError = (
  values: ContentValues,
): string | undefined => {
  const { startDateTime, endDateTime } = values;

  if (
    (hasText(startDateTime) && !hasExplicitTimezone(startDateTime)) ||
    (hasText(endDateTime) && !hasExplicitTimezone(endDateTime))
  ) {
    return 'Event date-times must include an explicit ISO 8601 timezone offset.';
  }

  if (!hasText(startDateTime) || !hasText(endDateTime)) {
    return undefined;
  }

  if (Date.parse(endDateTime) < Date.parse(startDateTime)) {
    return 'Event endDateTime must be on or after startDateTime.';
  }

  return undefined;
};

export const resolveSingleMediaPresence = (
  update: unknown,
  currentlyPresent: boolean,
): boolean => {
  if (update === null || update === undefined || update === '') {
    return false;
  }

  if (typeof update === 'number' || typeof update === 'string') {
    return true;
  }

  if (Array.isArray(update)) {
    return update.length > 0;
  }

  if (typeof update !== 'object') {
    return false;
  }

  const relationUpdate = update as ContentValues;

  if (Array.isArray(relationUpdate.set)) {
    return relationUpdate.set.length > 0;
  }

  if (Array.isArray(relationUpdate.connect) && relationUpdate.connect.length > 0) {
    return true;
  }

  if (
    Array.isArray(relationUpdate.disconnect) &&
    relationUpdate.disconnect.length > 0
  ) {
    return false;
  }

  if (hasOwn(relationUpdate, 'id') || hasOwn(relationUpdate, 'documentId')) {
    return true;
  }

  return currentlyPresent;
};

export const getResourceSourceError = (
  incoming: ContentValues,
  existing: ContentValues = {},
): string | undefined => {
  const currentlyHasFile = Boolean(existing.file);
  const hasFile = hasOwn(incoming, 'file')
    ? resolveSingleMediaPresence(incoming.file, currentlyHasFile)
    : currentlyHasFile;
  const externalURL = hasOwn(incoming, 'externalURL')
    ? incoming.externalURL
    : existing.externalURL;
  const hasExternalURL = hasText(externalURL);

  if (hasFile === hasExternalURL) {
    return 'Resource must have exactly one source: file or externalURL.';
  }

  return undefined;
};
