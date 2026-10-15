import crypto from 'crypto';
import { profileRepository } from '../repositories/profileRepository';
import { cookieVaultRepository } from '../repositories/cookieVaultRepository';
import { fingerprintRepository } from '../repositories/fingerprintRepository';
import { CreateProfile, Profile } from '../../shared/dto';
import { ProfileRecord } from '../types/domain';

export class ProfileService {
  public async listProfiles(telegramUserId: number): Promise<Profile[]> {
    const records = await profileRepository.findByUserId(telegramUserId);
    const profiles: Profile[] = [];

    for (const r of records) {
      const hasCookies = await cookieVaultRepository.hasCookies(r.profileId);
      const fp = await fingerprintRepository.getFingerprint(r.profileId);

      let fingerprintSummary = 'Default Mobile';
      if (fp) {
        if (fp.userAgent.includes('iPhone')) {
          fingerprintSummary = `iOS Safari (${fp.screenWidth}x${fp.screenHeight})`;
        } else if (fp.userAgent.includes('Android')) {
          fingerprintSummary = `Android Chrome (${fp.screenWidth}x${fp.screenHeight})`;
        } else {
          fingerprintSummary = `Custom (${fp.screenWidth}x${fp.screenHeight})`;
        }
      }

      profiles.push({
        profileId: r.profileId,
        displayName: r.displayName,
        telegramUserId: r.telegramUserId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        cookieStatus: hasCookies ? 'active' : 'unverified',
        fingerprintSummary,
      });
    }

    return profiles;
  }

  public async getProfile(profileId: string, telegramUserId: number): Promise<ProfileRecord | null> {
    const profile = await profileRepository.findById(profileId);
    if (!profile) return null;
    if (profile.telegramUserId !== telegramUserId) {
      // Forbidden: does not belong to user
      return null;
    }
    return profile;
  }

  public async createProfile(telegramUserId: number, input: CreateProfile): Promise<string> {
    const profileId = crypto.randomUUID();
    const now = new Date().toISOString();

    const profileRecord: ProfileRecord = {
      profileId,
      telegramUserId,
      displayName: input.displayName.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await profileRepository.create(profileRecord);
    await cookieVaultRepository.saveCookies(profileId, input.cookieString);
    await fingerprintRepository.saveFingerprint(profileId, input.fingerprint);

    return profileId;
  }

  public async updateProfile(
    profileId: string,
    telegramUserId: number,
    displayName?: string
  ): Promise<ProfileRecord | null> {
    const existing = await profileRepository.findById(profileId);
    if (!existing || existing.telegramUserId !== telegramUserId) {
      return null;
    }

    const updated = await profileRepository.update(profileId, {
      displayName: displayName ? displayName.trim() : existing.displayName,
    });
    return updated || null;
  }

  public async deleteProfile(profileId: string, telegramUserId: number): Promise<boolean> {
    const existing = await profileRepository.findById(profileId);
    if (!existing || existing.telegramUserId !== telegramUserId) {
      return false;
    }

    return profileRepository.delete(profileId);
  }
}

export const profileService = new ProfileService();
