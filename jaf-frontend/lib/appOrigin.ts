/**
 * Canonical site origin for OAuth redirects and absolute links.
 * Set NEXT_PUBLIC_APP_ORIGIN in production (e.g. https://main.xxx.amplifyapp.com).
 * In the browser, falls back to window.location.origin when unset.
 */
export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "") ?? "";
  if (typeof window !== "undefined") {
    return fromEnv || window.location.origin;
  }
  return fromEnv;
}

/** Build an absolute URL on this app (path must start with /). */
export function appUrl(path: string): string {
  const origin = getAppOrigin();
  if (!path.startsWith("/")) {
    return path;
  }
  if (!origin) {
    return path;
  }
  return `${origin}${path}`;
}

/** True if the string is an http(s) URL on the same host as this app. */
export function isAppUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const origin = getAppOrigin();
    if (!origin) {
      return typeof window !== "undefined" && u.origin === window.location.origin;
    }
    return u.origin === origin;
  } catch {
    return false;
  }
}

/**
 * Resolve post-auth redirect: same-app absolute URLs and root-relative paths stay on this deployment.
 */
export function resolveAuthRedirect(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("/")) {
    return appUrl(pathOrUrl);
  }
  if (isAppUrl(pathOrUrl)) {
    return pathOrUrl;
  }
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return appUrl("/chat");
}
