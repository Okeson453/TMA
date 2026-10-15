import { HydratedSession } from '../../types/domain';
import { config } from '../../config/env';

export interface BuiltOriginRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
}

export class EgressRequestBuilder {
  /**
   * Constructs the outgoing request to the target origin (e.g. m.facebook.com),
   * injecting cookies, fingerprint headers, and rewriting Host/Origin/Referer.
   */
  public buildRequest(
    session: HydratedSession,
    subpath: string,
    method: string,
    incomingHeaders: Record<string, string | string[] | undefined>
  ): BuiltOriginRequest {
    const origin = config.targetOrigin;
    const cleanSubpath = subpath.startsWith('/') ? subpath : `/${subpath}`;
    const targetUrl = `${origin}${cleanSubpath}`;
    const originHost = new URL(origin).host;

    const headers: Record<string, string> = {
      'host': originHost,
      'user-agent': session.fingerprint.userAgent,
      'accept-language': session.fingerprint.acceptLanguage,
      'origin': origin,
      'referer': `${origin}/`,
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'upgrade-insecure-requests': '1',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    };

    // Device hints
    if (session.fingerprint.userAgent.includes('iPhone')) {
      headers['sec-ch-ua-mobile'] = '?1';
      headers['sec-ch-ua-platform'] = '"iOS"';
    } else if (session.fingerprint.userAgent.includes('Android')) {
      headers['sec-ch-ua-mobile'] = '?1';
      headers['sec-ch-ua-platform'] = '"Android"';
    }

    // Inject decrypted vault cookies
    if (session.cookieString) {
      headers['cookie'] = session.cookieString;
    }

    // Preserve content-type for POST requests
    const contentType = incomingHeaders['content-type'];
    if (contentType && typeof contentType === 'string') {
      headers['content-type'] = contentType;
    }

    return {
      url: targetUrl,
      method,
      headers,
    };
  }
}

export const egressRequestBuilder = new EgressRequestBuilder();
