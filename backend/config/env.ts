import crypto from 'crypto';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  telegramBotToken: string;
  cookieVaultKey: Buffer;
  targetOrigin: string;
  residentialProxyUrl?: string;
  allowDevAuthBypass: boolean;
}

function resolveCookieKey(): Buffer {
  const envKey = process.env.COOKIE_VAULT_KEY;
  if (envKey) {
    try {
      const buf = Buffer.from(envKey, 'base64');
      if (buf.length === 32) return buf;
      // If utf8 string, hash to 32 bytes
      return crypto.createHash('sha256').update(envKey).digest();
    } catch {
      return crypto.createHash('sha256').update(envKey).digest();
    }
  }
  // Deterministic local default key for development
  return crypto.createHash('sha256').update('telegram-mini-app-cookie-vault-default-key-32b').digest();
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_DEVELOPMENT_TOKEN',
  cookieVaultKey: resolveCookieKey(),
  targetOrigin: (process.env.TARGET_ORIGIN || 'https://m.facebook.com').replace(/\/+$/, ''),
  residentialProxyUrl: process.env.RESIDENTIAL_PROXY_URL || undefined,
  allowDevAuthBypass: process.env.ALLOW_DEV_AUTH_BYPASS === 'true' || process.env.NODE_ENV !== 'production',
};
