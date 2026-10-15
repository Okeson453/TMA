import { profileRepository } from '../repositories/profileRepository';
import { cookieVaultRepository } from '../repositories/cookieVaultRepository';
import { fingerprintRepository } from '../repositories/fingerprintRepository';
import { HydratedSession } from '../types/domain';
import { logger } from '../infrastructure/logger';

export class SessionService {
  public async hydrateSession(profileId: string, telegramUserId: number): Promise<HydratedSession | null> {
    const profile = await profileRepository.findById(profileId);
    if (!profile) {
      logger.warn('Session hydration failed: profile not found', { profileId });
      return null;
    }

    if (profile.telegramUserId !== telegramUserId) {
      logger.warn('Session hydration forbidden: profile does not belong to telegram user', {
        profileId,
        telegramUserId,
        ownerId: profile.telegramUserId,
      });
      return null;
    }

    const cookieString = (await cookieVaultRepository.getCookies(profileId)) || '';
    const fingerprint = (await fingerprintRepository.getFingerprint(profileId)) || {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      acceptLanguage: 'en-US,en;q=0.9',
      screenWidth: 393,
      screenHeight: 852,
    };

    return {
      profileId,
      telegramUserId,
      displayName: profile.displayName,
      cookieString,
      fingerprint,
    };
  }

  /**
   * Traps origin Set-Cookie headers, parses them, merges with the existing cookie vault,
   * and saves the updated encrypted cookie string to the database.
   */
  public async trapAndPersistCookies(profileId: string, setCookieHeaders: string[] | string | undefined): Promise<string | null> {
    if (!setCookieHeaders) return null;

    const headersArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    if (headersArray.length === 0) return null;

    const currentCookies = (await cookieVaultRepository.getCookies(profileId)) || '';
    const cookieMap = new Map<string, string>();

    // Parse existing cookies
    currentCookies.split(';').forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const name = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        cookieMap.set(name, val);
      }
    });

    // Merge new Set-Cookie updates
    for (const header of headersArray) {
      const firstPart = header.split(';')[0]?.trim();
      if (firstPart) {
        const eqIdx = firstPart.indexOf('=');
        if (eqIdx !== -1) {
          const name = firstPart.substring(0, eqIdx).trim();
          const val = firstPart.substring(eqIdx + 1).trim();
          if (val && val !== 'deleted') {
            cookieMap.set(name, val);
          } else if (val === 'deleted') {
            cookieMap.delete(name);
          }
        }
      }
    }

    const updatedCookieString = Array.from(cookieMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

    await cookieVaultRepository.saveCookies(profileId, updatedCookieString);
    logger.info('Trapped Set-Cookie and updated vault', {
      profileId,
      cookieCount: cookieMap.size,
      updatedNames: headersArray.map((h) => h.split('=')[0]),
    });

    return updatedCookieString;
  }
}

export const sessionService = new SessionService();
