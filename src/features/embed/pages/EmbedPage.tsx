import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmbedLayout } from '../../../shared/layouts/EmbedLayout';
import { ProxyIframe } from '../components/ProxyIframe';
import { checkProfileHealth } from '../../../api/profiles';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { ErrorState } from '../../../shared/components/ErrorState';
import { telegram } from '../../../shared/lib/telegram';

export const EmbedPage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(true);
  const [profileData, setProfileData] = useState<{ displayName: string } | null>(null);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Telegram BackButton registration
  useEffect(() => {
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.show();
      const onBackClick = () => navigate('/');
      window.Telegram.WebApp.BackButton.onClick(onBackClick);

      return () => {
        window.Telegram?.WebApp?.BackButton?.hide();
        window.Telegram?.WebApp?.BackButton?.offClick(onBackClick);
      };
    }
  }, [navigate]);

  const verifyHealth = useCallback(async () => {
    if (!profileId) return;
    setIsVerifying(true);
    setError(null);
    try {
      const data = await checkProfileHealth(profileId);
      setProfileData({ displayName: data.displayName });
    } catch (err: any) {
      setError({
        message: err.message || 'Profile could not be accessed',
        code: err.code || 'HEALTH_CHECK_FAILED',
        traceId: err.traceId,
      });
    } finally {
      setIsVerifying(false);
    }
  }, [profileId]);

  useEffect(() => {
    verifyHealth();
  }, [verifyHealth]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!profileId) {
    return (
      <div className="min-h-screen bg-[#17212b] flex items-center justify-center p-4">
        <ErrorState
          title="Profile Not Found"
          message="No profile ID was specified in the route."
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="h-screen w-screen bg-[#17212b] flex flex-col items-center justify-center">
        <LoadingSpinner label="Authenticating Telegram Session & Hydrating Vault..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-[#17212b] flex flex-col items-center justify-center p-4">
        <ErrorState
          title={error.code === 'FORBIDDEN' ? 'Access Denied (403)' : 'Profile Unavailable'}
          message={
            error.code === 'FORBIDDEN'
              ? 'This profile is isolated to a different Telegram user or your initData signature failed verification.'
              : error.message
          }
          code={error.code}
          traceId={error.traceId}
          onRetry={verifyHealth}
        />
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-[#202b36] hover:bg-[#2b394a] text-gray-300 rounded-xl text-xs font-semibold"
        >
          Return to Profile Switcher
        </button>
      </div>
    );
  }

  return (
    <EmbedLayout
      profileName={profileData?.displayName || 'Target Account'}
      profileId={profileId}
      onRefreshIframe={handleRefresh}
    >
      <ProxyIframe profileId={profileId} refreshTrigger={refreshTrigger} />
    </EmbedLayout>
  );
};
