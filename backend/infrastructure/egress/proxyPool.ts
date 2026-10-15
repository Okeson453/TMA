import { config } from '../../config/env';
import { logger } from '../logger';

export interface ProxyLease {
  proxyUrl?: string;
  isResidential: boolean;
  release(): void;
}

export class ResidentialProxyPool {
  private residentialUrl?: string;

  constructor() {
    this.residentialUrl = config.residentialProxyUrl;
    if (this.residentialUrl) {
      this.validateNotDatacenter(this.residentialUrl);
    }
  }

  private validateNotDatacenter(urlStr: string) {
    try {
      const parsed = new URL(urlStr);
      const hostname = parsed.hostname.toLowerCase();
      // Datacenter IP/host blacklist checks
      const dcKeywords = ['amazonaws.com', 'digitalocean.com', 'gcp.internal', 'linode.com', 'azure.com', 'ovh.net', 'hetzner'];
      for (const kw of dcKeywords) {
        if (hostname.includes(kw)) {
          logger.warn(`Configured proxy ${hostname} appears to be a datacenter IP! Residential proxies recommended.`);
        }
      }
    } catch {
      // ignore parse error
    }
  }

  public acquire(): ProxyLease {
    return {
      proxyUrl: this.residentialUrl,
      isResidential: Boolean(this.residentialUrl),
      release: () => {
        // Pool lease release
      },
    };
  }
}

export const proxyPool = new ResidentialProxyPool();
