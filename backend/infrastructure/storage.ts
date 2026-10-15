import fs from 'fs';
import path from 'path';
import { TelegramUser, ProfileRecord, CookieVaultRecord, FingerprintRecord } from '../types/domain';
import { logger } from './logger';

export interface DatabaseState {
  users: Map<number, TelegramUser>;
  profiles: Map<string, ProfileRecord>;
  cookieVault: Map<string, CookieVaultRecord>;
  fingerprints: Map<string, FingerprintRecord>;
}

class StorageEngine {
  private users = new Map<number, TelegramUser>();
  private profiles = new Map<string, ProfileRecord>();
  private cookieVault = new Map<string, CookieVaultRecord>();
  private fingerprints = new Map<string, FingerprintRecord>();
  private persistenceFile = path.resolve(process.cwd(), '.data-store.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.persistenceFile)) {
        const raw = fs.readFileSync(this.persistenceFile, 'utf8');
        const data = JSON.parse(raw);
        if (data.users) {
          for (const u of data.users) this.users.set(u.telegramUserId, u);
        }
        if (data.profiles) {
          for (const p of data.profiles) this.profiles.set(p.profileId, p);
        }
        if (data.cookieVault) {
          for (const c of data.cookieVault) this.cookieVault.set(c.profileId, c);
        }
        if (data.fingerprints) {
          for (const f of data.fingerprints) this.fingerprints.set(f.profileId, f);
        }
        logger.info(`Loaded ${this.profiles.size} profiles from disk store`);
      }
    } catch (err) {
      logger.warn('Could not load persistence file, starting with fresh in-memory store', { err });
    }
  }

  public saveToDisk() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        profiles: Array.from(this.profiles.values()),
        cookieVault: Array.from(this.cookieVault.values()),
        fingerprints: Array.from(this.fingerprints.values()),
      };
      fs.writeFileSync(this.persistenceFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      logger.error('Failed to save store to disk', { err });
    }
  }

  // Telegram Users
  public upsertUser(telegramUserId: number): TelegramUser {
    let user = this.users.get(telegramUserId);
    if (!user) {
      user = {
        telegramUserId,
        firstSeenAt: new Date().toISOString(),
      };
      this.users.set(telegramUserId, user);
      this.saveToDisk();
    }
    return user;
  }

  public getUser(telegramUserId: number): TelegramUser | undefined {
    return this.users.get(telegramUserId);
  }

  // Profiles
  public getProfilesByUser(telegramUserId: number): ProfileRecord[] {
    const results: ProfileRecord[] = [];
    for (const p of this.profiles.values()) {
      if (p.telegramUserId === telegramUserId) {
        results.push(p);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getProfileById(profileId: string): ProfileRecord | undefined {
    return this.profiles.get(profileId);
  }

  public insertProfile(profile: ProfileRecord) {
    this.profiles.set(profile.profileId, profile);
    this.saveToDisk();
  }

  public updateProfile(profileId: string, updates: Partial<ProfileRecord>): ProfileRecord | undefined {
    const existing = this.profiles.get(profileId);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(profileId, updated);
    this.saveToDisk();
    return updated;
  }

  public deleteProfile(profileId: string): boolean {
    const existed = this.profiles.delete(profileId);
    if (existed) {
      // Cascade delete foreign keys
      this.cookieVault.delete(profileId);
      this.fingerprints.delete(profileId);
      this.saveToDisk();
    }
    return existed;
  }

  // Cookie Vault
  public getCookieVault(profileId: string): CookieVaultRecord | undefined {
    return this.cookieVault.get(profileId);
  }

  public upsertCookieVault(record: CookieVaultRecord) {
    this.cookieVault.set(record.profileId, record);
    this.saveToDisk();
  }

  // Fingerprints
  public getFingerprint(profileId: string): FingerprintRecord | undefined {
    return this.fingerprints.get(profileId);
  }

  public upsertFingerprint(record: FingerprintRecord) {
    this.fingerprints.set(record.profileId, record);
    this.saveToDisk();
  }
}

export const storage = new StorageEngine();
