/**
 * Origin for Location headers from /auth/callback. In production, prefer
 * NEXT_PUBLIC_APP_ORIGIN so redirects match the public site (avoids bad
 * x-forwarded-host, internal request URLs, or stale localhost values).
 */
export function resolveAuthCallbackOrigin(request: Request): string {
  const envOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "") ?? "";
  const isDev = process.env.NODE_ENV === "development";

  if (envOrigin && !isDev) {
    return envOrigin;
  }

  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  if (!isDev && forwardedHost) {
    const proto =
      forwardedProto && forwardedProto !== "" ? forwardedProto : "https";
    return `${proto}://${forwardedHost}`;
  }

  return url.origin;
}
