import React, { useState } from 'react';
import { ArrowRight, Trash2, Edit3, Smartphone, Key, Lock, CheckCircle2 } from 'lucide-react';
import { Profile } from '../../../types/api';
import { formatRelativeTime } from '../../../shared/lib/format';
import { telegram } from '../../../shared/lib/telegram';

interface ProfileCardProps {
  profile: Profile;
  onSelect: (profileId: string) => void;
  onDelete: (profileId: string) => void;
  onRename: (profileId: string, currentName: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLaunch = () => {
    telegram.haptic.impact('medium');
    onSelect(profile.profileId);
  };

  const initials = profile.displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'P';

  return (
    <div className="telegram-card p-4 transition-all duration-200 hover:border-[#5288c1]/40 shadow-sm relative group">
      <div className="flex items-start justify-between gap-3">
        {/* Avatar & Info */}
        <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={handleLaunch}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1877f2] to-[#2e89ff] flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md shadow-[#1877f2]/20">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">{profile.displayName}</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Session Ready"></span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#708499] mt-0.5">
              <Smartphone className="w-3 h-3 shrink-0" />
              <span className="truncate">{profile.fingerprintSummary || 'Mobile Touch'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onRename(profile.profileId, profile.displayName)}
            className="p-1.5 text-[#708499] hover:text-white rounded-lg transition hover:bg-white/5"
            title="Rename Profile"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(profile.profileId)}
            className="p-1.5 text-[#708499] hover:text-rose-400 rounded-lg transition hover:bg-rose-500/10"
            title="Delete Profile"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Specs & Launch Button */}
      <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#17212b] text-sky-300 px-2 py-0.5 rounded-md border border-white/5">
            <Lock className="w-2.5 h-2.5" />
            <span>Vault Encrypted</span>
          </span>
          <span className="text-[10px] text-[#708499]">
            {formatRelativeTime(profile.updatedAt)}
          </span>
        </div>

        <button
          onClick={handleLaunch}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5288c1] hover:bg-[#4375a8] active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <span>Open Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
