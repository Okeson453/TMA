import { Request, Response } from 'express';
import { proxyService } from '../../services/proxy/proxyService';
import { sessionService } from '../../services/sessionService';

export class ProxyController {
  public async proxy(req: Request, res: Response): Promise<void> {
    const { profileId } = req.params;
    const userId = req.telegramUserId!;
    // Subpath after /proxy/:profileId
    // req.params[0] holds wildcard in Express if route is /proxy/:profileId/*
    const wildcard = req.params[0] || '';
    const queryStr = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const fullSubpath = `${wildcard.startsWith('/') ? wildcard : `/${wildcard}`}${queryStr}`;

    // Test simulation route to test cookie mutation trapping
    if (wildcard === '/test-mutate' || wildcard === 'test-mutate') {
      await sessionService.trapAndPersistCookies(profileId, [
        'act=1728994401; Path=/; Domain=.facebook.com; Secure; HttpOnly',
        'datr=fr_updated_token_test; Path=/; Domain=.facebook.com; Secure; HttpOnly',
      ]);
      res.status(200).json({ status: 'ok', message: 'Set-Cookie trapped & saved' });
      return;
    }

    await proxyService.handleProxyRequest(
      profileId,
      userId,
      fullSubpath,
      req.method,
      req.headers,
      req.body,
      res,
      req.traceId
    );
  }
}

export const proxyController = new ProxyController();
