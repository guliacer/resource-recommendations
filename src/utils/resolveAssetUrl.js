/**
 * Resolve site asset paths so they work under GitHub Pages subpaths.
 * Absolute http(s)/data/blob URLs are returned as-is.
 * Paths starting with "/" are prefixed with Vite's BASE_URL.
 */
export function resolveAssetUrl(path) {
  if (!path) return "";
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path;

  const base = import.meta.env.BASE_URL || "./";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = String(path).replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

export function resolveAssetUrls(paths) {
  if (!Array.isArray(paths)) return [];
  return paths.map(resolveAssetUrl).filter(Boolean);
}
