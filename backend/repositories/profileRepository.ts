import { storage } from '../infrastructure/storage';
import { ProfileRecord } from '../types/domain';

export class ProfileRepository {
  public async findByUserId(telegramUserId: number): Promise<ProfileRecord[]> {
    return storage.getProfilesByUser(telegramUserId);
  }

  public async findById(profileId: string): Promise<ProfileRecord | undefined> {
    return storage.getProfileById(profileId);
  }

  public async create(profile: ProfileRecord): Promise<void> {
    storage.upsertUser(profile.telegramUserId);
    storage.insertProfile(profile);
  }

  public async update(profileId: string, updates: Partial<ProfileRecord>): Promise<ProfileRecord | undefined> {
    return storage.updateProfile(profileId, updates);
  }

  public async delete(profileId: string): Promise<boolean> {
    return storage.deleteProfile(profileId);
  }
}

export const profileRepository = new ProfileRepository();
