import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createBackendApp } from './backend/app';
import { config } from './backend/config/env';
import { logger } from './backend/infrastructure/logger';
import { profileRepository } from './backend/repositories/profileRepository';
import { cookieVaultRepository } from './backend/repositories/cookieVaultRepository';
import { fingerprintRepository } from './backend/repositories/fingerprintRepository';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedInitialProfilesIfEmpty() {
  const defaultUserId = 84920481;
  const existing = await profileRepository.findByUserId(defaultUserId);

  if (existing.length === 0) {
    logger.info('Seeding demo multi-account profiles...');

    // Profile 1: Russell Crowee (iPhone iOS 17)
    const profileId1 = 'a1111111-1111-4111-8111-111111111111';
    await profileRepository.create({
      profileId: profileId1,
      telegramUserId: defaultUserId,
      displayName: 'Russell Crowee',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await cookieVaultRepository.saveCookies(
      profileId1,
      'c_user=100084920481; xs=32%3Amock_sess_alpha%3A2%3A171000; datr=fr_alpha_cookie_vault_tok; fr=0w9k2LmNx; sb=9dE1Zge'
    );
    await fingerprintRepository.saveFingerprint(profileId1, {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      acceptLanguage: 'en-US,en;q=0.9',
      screenWidth: 393,
      screenHeight: 852,
    });

    // Profile 2: Alexander Vance (Samsung Galaxy S24 Android)
    const profileId2 = 'b2222222-2222-4222-8222-222222222222';
    await profileRepository.create({
      profileId: profileId2,
      telegramUserId: defaultUserId,
      displayName: 'Alexander Vance',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    });
    await cookieVaultRepository.saveCookies(
      profileId2,
      'c_user=100092184912; xs=44%3Amock_sess_beta%3A2%3A172000; datr=fr_beta_cookie_vault_tok; fr=1k8a0PoMz; sb=7rF2Yhd'
    );
    await fingerprintRepository.saveFingerprint(profileId2, {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Mobile Safari/537.36',
      acceptLanguage: 'en-GB,en;q=0.8',
      screenWidth: 412,
      screenHeight: 915,
    });

    logger.info('Seeded 2 demo multi-account profiles with isolated cookie vaults');
  }
}

async function startServer() {
  const app = createBackendApp();
  const isProduction = process.env.NODE_ENV === 'production';
  const port = config.port;

  await seedInitialProfilesIfEmpty();

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const express = (await import('express')).default;
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    logger.info(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
