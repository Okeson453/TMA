import { Fingerprint } from '../../shared/dto';

export interface TelegramUser {
  telegramUserId: number;
  firstSeenAt: string;
}

export interface ProfileRecord {
  profileId: string;
  telegramUserId: number;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CookieVaultRecord {
  profileId: string;
  encryptedCookieBlob: string; // base64 payload: iv:authTag:ciphertext
  updatedAt: string;
}

export interface FingerprintRecord {
  profileId: string;
  userAgent: string;
  acceptLanguage: string;
  screenWidth: number;
  screenHeight: number;
  updatedAt: string;
}

export interface HydratedSession {
  profileId: string;
  telegramUserId: number;
  displayName: string;
  cookieString: string;
  fingerprint: Fingerprint;
}

export interface EgressProxyConfig {
  proxyUrl?: string;
  isResidential: boolean;
}
