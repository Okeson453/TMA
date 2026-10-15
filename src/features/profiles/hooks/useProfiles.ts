import { useState, useEffect, useCallback } from 'react';
import { Profile, CreateProfile, UpdateProfile } from '../../../types/api';
import { fetchProfiles, createProfile, updateProfile, deleteProfile } from '../../../api/profiles';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(null);

  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProfiles();
      setProfiles(data);
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to load profiles',
        code: err.code,
        traceId: err.traceId,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const add = async (data: CreateProfile): Promise<string> => {
    const res = await createProfile(data);
    await loadProfiles();
    return res.profileId;
  };

  const rename = async (profileId: string, displayName: string) => {
    await updateProfile(profileId, { displayName });
    await loadProfiles();
  };

  const remove = async (profileId: string) => {
    await deleteProfile(profileId);
    await loadProfiles();
  };

  return {
    profiles,
    isLoading,
    error,
    refetch: loadProfiles,
    add,
    rename,
    remove,
  };
}
