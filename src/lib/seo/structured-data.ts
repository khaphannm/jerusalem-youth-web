export const serializeStructuredData = (value: unknown) =>
  JSON.stringify(value).replaceAll("<", "\\u003c");
