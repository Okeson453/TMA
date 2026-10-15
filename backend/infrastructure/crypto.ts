import crypto from 'crypto';

/**
 * Validates Telegram Mini App initData using HMAC-SHA256 per Telegram specification.
 * Data-check-string is created by sorting all key=value pairs except 'hash' alphabetically, joined by '\n'.
 * Secret key = HMAC_SHA256("WebAppData", botToken).
 * Expected hash = HMAC_SHA256(secretKey, dataCheckString).
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): { valid: boolean; user?: { id: number; first_name?: string; last_name?: string; username?: string }; authDate?: number } {
  if (!initData || typeof initData !== 'string') {
    return { valid: false };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return { valid: false };
    }

    params.delete('hash');

    const pairs: string[] = [];
    params.forEach((value, key) => {
      pairs.push(`${key}=${value}`);
    });
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    // Secret key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculated hash = HMAC_SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Constant-time compare to prevent timing attacks
    const hashBuf = Buffer.from(hash, 'hex');
    const calcBuf = Buffer.from(calculatedHash, 'hex');

    if (hashBuf.length !== calcBuf.length) {
      return { valid: false };
    }

    const isValid = crypto.timingSafeEqual(hashBuf, calcBuf);
    if (!isValid) {
      return { valid: false };
    }

    const userParam = params.get('user');
    let user;
    if (userParam) {
      try {
        user = JSON.parse(userParam);
      } catch {
        // non-fatal if user isn't JSON
      }
    }

    const authDateParam = params.get('auth_date');
    const authDate = authDateParam ? parseInt(authDateParam, 10) : undefined;

    return { valid: true, user, authDate };
  } catch (err) {
    return { valid: false };
  }
}

/**
 * Creates valid Telegram initData for development, testing, and sandbox preview.
 */
export function createMockTelegramInitData(
  user: { id: number; first_name: string; username?: string },
  botToken: string
): string {
  const authDate = Math.floor(Date.now() / 1000).toString();
  const userJson = JSON.stringify(user);
  const query = new URLSearchParams();
  query.set('auth_date', authDate);
  query.set('query_id', 'AAHdF60qAwAAAN0XrSo');
  query.set('user', userJson);

  const pairs: string[] = [];
  query.forEach((value, key) => {
    pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  query.set('hash', hash);
  return query.toString();
}

/**
 * AES-256-GCM encryption for Cookie Vault at rest.
 * Output format: base64(iv:authTag:ciphertext)
 */
export function encryptCookie(plainText: string, key: Buffer): string {
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([
    iv, // 12 bytes
    authTag, // 16 bytes
    encrypted,
  ]);

  return combined.toString('base64');
}

/**
 * AES-256-GCM decryption for Cookie Vault.
 */
export function decryptCookie(encryptedPayload: string, key: Buffer): string {
  const combined = Buffer.from(encryptedPayload, 'base64');
  if (combined.length < 28) {
    throw new Error('Invalid encrypted cookie payload: length too short');
  }

  const iv = combined.subarray(0, 12);
  const authTag = combined.subarray(12, 28);
  const ciphertext = combined.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return decrypted.toString('utf8');
}
