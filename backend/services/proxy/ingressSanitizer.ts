export class IngressSanitizer {
  private static readonly HEADERS_TO_STRIP = new Set([
    'x-frame-options',
    'content-security-policy',
    'content-security-policy-report-only',
    'strict-transport-security',
    'cross-origin-embedder-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'set-cookie', // Trapped server-side, never forwarded to client!
  ]);

  /**
   * Sanitizes origin response headers:
   * 1. Strips anti-framing headers (X-Frame-Options, CSP, HSTS)
   * 2. Strips Set-Cookie so the client remains completely stateless
   * 3. Sets permissive frame headers for Telegram WKWebView embedding
   */
  public sanitizeHeaders(rawHeaders: Record<string, string | string[] | undefined>): Record<string, string | string[]> {
    const sanitized: Record<string, string | string[]> = {};

    for (const [key, value] of Object.entries(rawHeaders)) {
      if (!value) continue;
      const lower = key.toLowerCase();
      if (IngressSanitizer.HEADERS_TO_STRIP.has(lower)) {
        continue;
      }
      sanitized[key] = value;
    }

    // Explicitly allow embedding
    sanitized['x-frame-options'] = 'ALLOWALL';
    sanitized['access-control-allow-origin'] = '*';
    sanitized['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    sanitized['access-control-allow-headers'] = '*';

    return sanitized;
  }
}

export const ingressSanitizer = new IngressSanitizer();
