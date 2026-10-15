import { storage } from '../infrastructure/storage';
import { encryptCookie, decryptCookie } from '../infrastructure/crypto';
import { config } from '../config/env';

export class CookieVaultRepository {
  public async getCookies(profileId: string): Promise<string | null> {
    const record = storage.getCookieVault(profileId);
    if (!record) return null;
    try {
      return decryptCookie(record.encryptedCookieBlob, config.cookieVaultKey);
    } catch {
      return null;
    }
  }

  public async saveCookies(profileId: string, cookieString: string): Promise<void> {
    const encryptedCookieBlob = encryptCookie(cookieString, config.cookieVaultKey);
    storage.upsertCookieVault({
      profileId,
      encryptedCookieBlob,
      updatedAt: new Date().toISOString(),
    });
  }

  public async hasCookies(profileId: string): Promise<boolean> {
    return Boolean(storage.getCookieVault(profileId));
  }
}

export const cookieVaultRepository = new CookieVaultRepository();
