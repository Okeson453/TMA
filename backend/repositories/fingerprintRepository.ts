import { storage } from '../infrastructure/storage';
import { Fingerprint } from '../../shared/dto';
import { FingerprintRecord } from '../types/domain';

export class FingerprintRepository {
  public async getFingerprint(profileId: string): Promise<Fingerprint | null> {
    const record = storage.getFingerprint(profileId);
    if (!record) return null;
    return {
      userAgent: record.userAgent,
      acceptLanguage: record.acceptLanguage,
      screenWidth: record.screenWidth,
      screenHeight: record.screenHeight,
    };
  }

  public async saveFingerprint(profileId: string, fp: Fingerprint): Promise<void> {
    const record: FingerprintRecord = {
      profileId,
      userAgent: fp.userAgent,
      acceptLanguage: fp.acceptLanguage,
      screenWidth: fp.screenWidth,
      screenHeight: fp.screenHeight,
      updatedAt: new Date().toISOString(),
    };
    storage.upsertFingerprint(record);
  }
}

export const fingerprintRepository = new FingerprintRepository();
