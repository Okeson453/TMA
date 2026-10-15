import { Request, Response } from 'express';
import { profileService } from '../../services/profileService';
import { cookieVaultRepository } from '../../repositories/cookieVaultRepository';
import { CreateProfileSchema, UpdateProfileSchema } from '../../../shared/dto';
import { logger } from '../../infrastructure/logger';

export class ProfileController {
  public async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.telegramUserId!;
      const profiles = await profileService.listProfiles(userId);
      res.status(200).json({ profiles });
    } catch (err: any) {
      logger.error('Failed to list profiles', { error: err.message, traceId: req.traceId });
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve profiles',
          traceId: req.traceId,
        },
      });
    }
  }

  public async get(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.telegramUserId!;
      const { profileId } = req.params;
      const profile = await profileService.getProfile(profileId, userId);

      if (!profile) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Profile '${profileId}' not found`,
            traceId: req.traceId,
          },
        });
        return;
      }

      res.status(200).json({ profile });
    } catch (err: any) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get profile',
          traceId: req.traceId,
        },
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.telegramUserId!;
      const parseResult = CreateProfileSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid profile payload',
            details: parseResult.error.format(),
            traceId: req.traceId,
          },
        });
        return;
      }

      const profileId = await profileService.createProfile(userId, parseResult.data);
      res.status(201).json({ profileId });
    } catch (err: any) {
      logger.error('Failed to create profile', { error: err.message, traceId: req.traceId });
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create profile',
          traceId: req.traceId,
        },
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.telegramUserId!;
      const { profileId } = req.params;
      const parseResult = UpdateProfileSchema.safeParse(req.body);

      if (!parseResult.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update payload',
            details: parseResult.error.format(),
            traceId: req.traceId,
          },
        });
        return;
      }

      const updated = await profileService.updateProfile(profileId, userId, parseResult.data.displayName);
      if (!updated) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Profile '${profileId}' not found or access denied`,
            traceId: req.traceId,
          },
        });
        return;
      }

      res.status(200).json({ profile: updated });
    } catch (err: any) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update profile',
          traceId: req.traceId,
        },
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.telegramUserId!;
      const { profileId } = req.params;
      const deleted = await profileService.deleteProfile(profileId, userId);

      if (!deleted) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Profile '${profileId}' not found or access denied`,
            traceId: req.traceId,
          },
        });
        return;
      }

      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete profile',
          traceId: req.traceId,
        },
      });
    }
  }

  /**
   * Health pre-check before setting iframe src to avoid broken frames
   */
  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.telegramUserId!;
      const { profileId } = req.params;
      const profile = await profileService.getProfile(profileId, userId);

      if (!profile) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Profile '${profileId}' not found or access denied`,
            traceId: req.traceId,
          },
        });
        return;
      }

      const hasCookies = await cookieVaultRepository.hasCookies(profileId);
      res.status(200).json({
        status: 'ok',
        profileId,
        displayName: profile.displayName,
        cookieStatus: hasCookies ? 'active' : 'unverified',
        traceId: req.traceId,
      });
    } catch (err: any) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Profile health pre-check failed',
          traceId: req.traceId,
        },
      });
    }
  }
}

export const profileController = new ProfileController();
