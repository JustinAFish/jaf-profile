/**
 * Build an absolute URL to the deployed backend. Trailing slashes on
 * NEXT_PUBLIC_BACKEND_URL are stripped so paths never become `//api/...`.
 */
export function backendApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/+$/, "");
  if (!base) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
