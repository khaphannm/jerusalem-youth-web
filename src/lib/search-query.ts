export const minimumSearchQueryLength = 2;
export const maximumSearchQueryLength = 80;

export function normalizeSearchQuery(value: string) {
  const normalized = value
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return [...normalized].slice(0, maximumSearchQueryLength).join("");
}
