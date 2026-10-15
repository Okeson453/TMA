export class UrlRewriter {
  /**
   * Rewrites HTML content so that relative paths, origin links, and form actions
   * route through the backend proxy path `/proxy/:profileId/`.
   */
  public rewriteHtml(html: string, profileId: string, originUrl: string): string {
    const proxyBase = `/proxy/${profileId}`;
    const escapedOrigin = originUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Replace absolute origin URLs: https://m.facebook.com/... -> /proxy/:profileId/...
    let output = html.replace(new RegExp(escapedOrigin, 'gi'), proxyBase);

    // 2. Replace root-relative attributes: src="/...", href="/...", action="/..."
    // Matches src="/path", href="/path", action="/path", data-uri="/path"
    output = output.replace(
      /\b(href|src|action|poster|data-uri)=["']\/(?!\/)([^"']*)["']/gi,
      (match, attr, path) => {
        // Don't double proxy if already starts with proxy
        if (path.startsWith(`proxy/${profileId}`)) {
          return `${attr}="/${path}"`;
        }
        return `${attr}="${proxyBase}/${path}"`;
      }
    );

    // 3. Replace url('/...') in CSS within style tags or attributes
    output = output.replace(
      /url\((['"]?)\/(?!\/)([^"')]+)\1\)/gi,
      (match, quote, path) => {
        if (path.startsWith(`proxy/${profileId}`)) {
          return `url(${quote}/${path}${quote})`;
        }
        return `url(${quote}${proxyBase}/${path}${quote})`;
      }
    );

    // 4. Inject runtime fetch/XHR hook script to intercept dynamic AJAX calls
    const hookScript = `
<script data-proxy-injected="true">
  (function() {
    var proxyPrefix = "${proxyBase}";
    var targetOrigin = "${originUrl}";

    // Intercept fetch
    if (window.fetch) {
      var origFetch = window.fetch;
      window.fetch = function(resource, init) {
        if (typeof resource === 'string') {
          if (resource.startsWith('/' ) && !resource.startsWith(proxyPrefix)) {
            resource = proxyPrefix + resource;
          } else if (resource.startsWith(targetOrigin)) {
            resource = resource.replace(targetOrigin, proxyPrefix);
          }
        }
        return origFetch.call(this, resource, init);
      };
    }

    // Intercept XMLHttpRequest
    if (window.XMLHttpRequest) {
      var origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url) {
        if (typeof url === 'string') {
          if (url.startsWith('/') && !url.startsWith(proxyPrefix)) {
            url = proxyPrefix + url;
          } else if (url.startsWith(targetOrigin)) {
            url = url.replace(targetOrigin, proxyPrefix);
          }
        }
        return origOpen.apply(this, arguments);
      };
    }
  })();
</script>
`;

    // Inject right after <head> or at beginning of document
    if (output.includes('<head>')) {
      output = output.replace('<head>', `<head>${hookScript}`);
    } else if (output.includes('<html>')) {
      output = output.replace('<html>', `<html><head>${hookScript}</head>`);
    } else {
      output = hookScript + output;
    }

    return output;
  }

  /**
   * Rewrites CSS content (url(...) references)
   */
  public rewriteCss(css: string, profileId: string): string {
    const proxyBase = `/proxy/${profileId}`;
    return css.replace(
      /url\((['"]?)\/(?!\/)([^"')]+)\1\)/gi,
      (match, quote, path) => `url(${quote}${proxyBase}/${path}${quote})`
    );
  }
}

export const urlRewriter = new UrlRewriter();
