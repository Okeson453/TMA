import React from 'react';
import { Profile } from '../../../types/api';
import { ProfileCard } from './ProfileCard';
import { EmptyState } from '../../../shared/components/EmptyState';

interface ProfileListProps {
  profiles: Profile[];
  isLoading: boolean;
  onSelect: (profileId: string) => void;
  onDelete: (profileId: string) => void;
  onRename: (profileId: string, currentName: string) => void;
  onAddAccount: () => void;
}

export const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  isLoading,
  onSelect,
  onDelete,
  onRename,
  onAddAccount,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="telegram-card p-4 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10"></div>
              <div className="space-y-1.5 flex-1">
                <div className="w-32 h-4 bg-white/10 rounded"></div>
                <div className="w-20 h-3 bg-white/5 rounded"></div>
              </div>
            </div>
            <div className="pt-3 border-t border-white/5 flex justify-between">
              <div className="w-24 h-4 bg-white/5 rounded"></div>
              <div className="w-20 h-6 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return <EmptyState onAddAccount={onAddAccount} />;
  }

  return (
    <div className="space-y-3">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.profileId}
          profile={profile}
          onSelect={onSelect}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
};
