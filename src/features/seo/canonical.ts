export function canonicalPath(path: `/${string}` | "/", page = 1) {
  return page > 1 ? `${path}?page=${page}` : path;
}
