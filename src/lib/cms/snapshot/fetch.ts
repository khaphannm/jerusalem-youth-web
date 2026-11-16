import type { Snapshot } from "./format.ts";

type Document = Readonly<Record<string, unknown>>;

type Condition = Readonly<{
  operator: string;
  path: readonly string[];
  value: string;
}>;

const defaultPageSize = 25;
const maximumPageSize = 100;
const dateTimePattern = /^\d{4}-\d{2}-\d{2}T/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const unsupported = (message: string) =>
  json({ data: null, error: { message, status: 400 } }, 400);

const readPath = (document: unknown, path: readonly string[]) =>
  path.reduce<unknown>(
    (value, segment) =>
      value && typeof value === "object"
        ? (value as Document)[segment]
        : undefined,
    document,
  );

// Date-times are compared as instants so offsets never change the order;
// everything else compares as Strapi returns it.
const comparable = (value: unknown) =>
  typeof value === "string" && dateTimePattern.test(value)
    ? Date.parse(value)
    : value;

const compare = (first: unknown, second: unknown) => {
  const a = comparable(first);
  const b = comparable(second);

  if (typeof a === "number" && typeof b === "number") return a - b;

  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
};

const isNullish = (value: unknown) => value === null || value === undefined;

const matches = (document: Document, condition: Condition): boolean => {
  const actual = readPath(document, condition.path);

  switch (condition.operator) {
    case "$eq":
      return !isNullish(actual) && String(actual) === condition.value;
    case "$gte":
      return !isNullish(actual) && compare(actual, condition.value) >= 0;
    case "$null":
      return isNullish(actual) === (condition.value === "true");
    case "$containsi":
      return (
        typeof actual === "string" &&
        actual.toLowerCase().includes(condition.value.toLowerCase())
      );
    default:
      return false;
  }
};

const supportedOperators = new Set(["$containsi", "$eq", "$gte", "$null"]);

type Query = Readonly<{
  all: readonly Condition[];
  anyOf: readonly (readonly Condition[])[];
  page: number;
  pageSize: number;
  sort: readonly Readonly<{ descending: boolean; field: string }>[];
}>;

const parseQuery = (parameters: URLSearchParams): Query | string => {
  const all: Condition[] = [];
  const branches = new Map<number, Condition[]>();
  const sort: { descending: boolean; field: string; index: number }[] = [];
  let page = 1;
  let pageSize = defaultPageSize;

  for (const [key, value] of parameters) {
    if (key === "populate" || key === "status") continue;

    if (key === "pagination[page]" || key === "pagination[pageSize]") {
      const parsed = Number(value);

      if (!Number.isInteger(parsed) || parsed <= 0) {
        return `Invalid ${key}.`;
      }

      if (key === "pagination[page]") page = parsed;
      else pageSize = Math.min(parsed, maximumPageSize);
      continue;
    }

    const sortMatch = /^sort\[(\d+)\]$/.exec(key);

    if (sortMatch) {
      const [field, direction = "asc"] = value.split(":");

      if (!field || !["asc", "desc"].includes(direction)) {
        return `Invalid sort: ${value}.`;
      }

      sort.push({
        descending: direction === "desc",
        field,
        index: Number(sortMatch[1]),
      });
      continue;
    }

    if (key.startsWith("filters")) {
      const segments = [...key.slice("filters".length).matchAll(/\[([^\]]+)\]/g)].map(
        (match) => match[1],
      );
      const operator = segments.pop();
      let target = all;

      if (segments[0] === "$or") {
        const branch = Number(segments[1]);

        if (!Number.isInteger(branch)) return `Invalid filter: ${key}.`;

        segments.splice(0, 2);
        target = branches.get(branch) ?? [];
        branches.set(branch, target);
      }

      if (!operator || !supportedOperators.has(operator) || segments.length === 0) {
        return `Unsupported filter: ${key}.`;
      }

      target.push({ operator, path: segments, value });
      continue;
    }

    return `Unsupported query parameter: ${key}.`;
  }

  return {
    all,
    anyOf: [...branches.entries()]
      .sort(([first], [second]) => first - second)
      .map(([, conditions]) => conditions),
    page,
    pageSize,
    sort: sort.sort((first, second) => first.index - second.index),
  };
};

const sortDocuments = (documents: readonly Document[], sort: Query["sort"]) =>
  [...documents].sort((first, second) => {
    for (const { descending, field } of sort) {
      const a = first[field];
      const b = second[field];

      // Matches PostgreSQL: nulls last ascending, first descending.
      if (isNullish(a) || isNullish(b)) {
        if (isNullish(a) && isNullish(b)) continue;

        return isNullish(a) === descending ? -1 : 1;
      }

      const order = compare(a, b);

      if (order !== 0) return descending ? -order : order;
    }

    return 0;
  });

/**
 * A `fetch` that answers the Strapi REST reads the CMS client makes, from a
 * snapshot. It supports exactly the query features the client uses and
 * answers 400 for anything else, so an unsupported query fails loudly instead
 * of returning wrong content. It never touches the network.
 */
export function createSnapshotFetch(snapshot: Snapshot): typeof fetch {
  const collections = snapshot.collections as Readonly<
    Record<string, readonly Document[] | undefined>
  >;
  const singles = snapshot.singles as Readonly<
    Record<string, Document | null | undefined>
  >;

  return async (input) => {
    const url = new URL(
      typeof input === "string" || input instanceof URL ? input : input.url,
    );
    const endpoint = /^\/api\/([a-z-]+)$/.exec(url.pathname)?.[1];

    if (!endpoint) {
      return unsupported(`Unsupported path: ${url.pathname}.`);
    }

    if (endpoint in singles) {
      const single = singles[endpoint] ?? null;

      return single
        ? json({ data: single, meta: {} })
        : json({ data: null, error: { message: "Not Found", status: 404 } }, 404);
    }

    const documents = collections[endpoint];

    if (!documents) {
      return unsupported(`Unknown content type: ${endpoint}.`);
    }

    const query = parseQuery(url.searchParams);

    if (typeof query === "string") {
      return unsupported(query);
    }

    const matched = sortDocuments(
      documents.filter(
        (document) =>
          query.all.every((condition) => matches(document, condition)) &&
          (query.anyOf.length === 0 ||
            query.anyOf.some((branch) =>
              branch.every((condition) => matches(document, condition)),
            )),
      ),
      query.sort,
    );
    const start = (query.page - 1) * query.pageSize;

    return json({
      data: matched.slice(start, start + query.pageSize),
      meta: {
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          pageCount: Math.ceil(matched.length / query.pageSize),
          total: matched.length,
        },
      },
    });
  };
}
