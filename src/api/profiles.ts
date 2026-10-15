import { apiClient } from './client';
import { Profile, CreateProfile, UpdateProfile } from '../types/api';

export async function fetchProfiles(): Promise<Profile[]> {
  const res = await apiClient<{ profiles: Profile[] }>('/api/profiles');
  return res.profiles;
}

export async function getProfile(profileId: string): Promise<Profile> {
  const res = await apiClient<{ profile: Profile }>(`/api/profiles/${profileId}`);
  return res.profile;
}

export async function createProfile(data: CreateProfile): Promise<{ profileId: string }> {
  return apiClient<{ profileId: string }>('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProfile(profileId: string, data: UpdateProfile): Promise<{ profile: Profile }> {
  return apiClient<{ profile: Profile }>(`/api/profiles/${profileId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProfile(profileId: string): Promise<void> {
  await apiClient<void>(`/api/profiles/${profileId}`, {
    method: 'DELETE',
  });
}

export async function checkProfileHealth(profileId: string): Promise<{ status: string; profileId: string; displayName: string }> {
  return apiClient<{ status: string; profileId: string; displayName: string }>(`/api/profiles/${profileId}/health`);
}

export async function fetchDevMockInitData(userId?: number, username?: string, firstName?: string): Promise<{ validInitData: string; forgedInitData: string }> {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId.toString());
  if (username) params.set('username', username);
  if (firstName) params.set('firstName', firstName);
  return apiClient<{ validInitData: string; forgedInitData: string }>(`/api/dev/mock-init-data?${params.toString()}`);
}
