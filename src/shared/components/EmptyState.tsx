import React from 'react';
import { Users, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddAccount: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddAccount }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#232e3c] border border-white/10 flex items-center justify-center text-[#5288c1]">
        <Users className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white">No Profiles Connected</h3>
        <p className="text-xs text-[#708499] leading-relaxed">
          Add an account profile with its isolated cookie vault and device fingerprint to start browsing target origins securely.
        </p>
      </div>

      <button
        onClick={onAddAccount}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5288c1] hover:bg-[#4375a8] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#5288c1]/20 transition active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Add First Account</span>
      </button>
    </div>
  );
};
