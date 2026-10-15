import { z } from 'zod';

export const FingerprintSchema = z.object({
  userAgent: z.string().min(1, 'User-Agent is required'),
  acceptLanguage: z.string().min(1, 'Accept-Language is required'),
  screenWidth: z.number().int().positive('Screen width must be positive'),
  screenHeight: z.number().int().positive('Screen height must be positive'),
});

export const ProfileSchema = z.object({
  profileId: z.string().uuid(),
  displayName: z.string().min(1).max(80),
  telegramUserId: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  cookieStatus: z.enum(['active', 'expired', 'unverified']).optional(),
  fingerprintSummary: z.string().optional(),
});

export const CreateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(80, 'Display name cannot exceed 80 characters'),
  cookieString: z.string().min(1, 'Cookie string is required'),
  fingerprint: FingerprintSchema,
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    traceId: z.string().optional(),
    details: z.any().optional(),
  }),
});

export type Fingerprint = z.infer<typeof FingerprintSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type CreateProfile = z.infer<typeof CreateProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
