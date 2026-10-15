import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Shield, RefreshCw } from 'lucide-react';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileList } from '../components/ProfileList';
import { SwitcherLayout } from '../../../shared/layouts/SwitcherLayout';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorState } from '../../../shared/components/ErrorState';
import { telegram } from '../../../shared/lib/telegram';

export const SwitcherPage: React.FC = () => {
  const navigate = useNavigate();
  const { profiles, isLoading, error, refetch, remove, rename } = useProfiles();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const handleSelectProfile = (profileId: string) => {
    telegram.haptic.impact('medium');
    navigate(`/app/${profileId}`);
  };

  const handleOpenAdd = () => {
    telegram.haptic.impact('light');
    navigate('/add');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await remove(deleteTargetId);
      telegram.haptic.notification('success');
      setDeleteTargetId(null);
    } catch {
      telegram.haptic.notification('error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenRename = (profileId: string, currentName: string) => {
    setRenameTarget({ id: profileId, name: currentName });
    setNewDisplayName(currentName);
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !newDisplayName.trim()) return;
    setIsRenaming(true);
    try {
      await rename(renameTarget.id, newDisplayName.trim());
      telegram.haptic.notification('success');
      setRenameTarget(null);
    } catch {
      telegram.haptic.notification('error');
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <SwitcherLayout onRefresh={refetch}>
      <div className="space-y-4 flex-1 flex flex-col">
        {/* Page Heading & Add CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Target Profiles</h2>
            <p className="text-xs text-[#708499]">
              {profiles.length} isolated {profiles.length === 1 ? 'account' : 'accounts'} in vault
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#5288c1] hover:bg-[#4375a8] active:scale-95 text-white rounded-xl text-xs font-semibold shadow-md shadow-[#5288c1]/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>

        {/* Error State */}
        {error ? (
          <div className="my-auto">
            <ErrorState
              title={error.code === 'FORBIDDEN' ? '403 Forbidden: Telegram Auth Rejection' : 'Failed to Load Profiles'}
              message={
                error.code === 'FORBIDDEN'
                  ? 'The backend rejected the request because the Telegram initData signature is invalid or forged. This verifies the production security invariant!'
                  : error.message
              }
              code={error.code}
              traceId={error.traceId}
              onRetry={refetch}
            />
          </div>
        ) : (
          <div className="flex-1">
            <ProfileList
              profiles={profiles}
              isLoading={isLoading}
              onSelect={handleSelectProfile}
              onDelete={(id) => setDeleteTargetId(id)}
              onRename={handleOpenRename}
              onAddAccount={handleOpenAdd}
            />
          </div>
        )}

        {/* System Invariant Info Footer */}
        <div className="mt-auto pt-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#708499] bg-[#202b36] px-3 py-1.5 rounded-full border border-white/5">
            <Shield className="w-3.5 h-3.5 text-[#5288c1]" />
            <span>Target: m.facebook.com • Stateless Client</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Profile & Vault"
        message="Are you sure you want to remove this profile? Its encrypted cookie vault and fingerprint will be permanently deleted from the database."
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Rename Dialog Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleConfirmRename}
            className="w-full max-w-xs bg-[#202b36] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Rename Profile</h3>
            <input
              type="text"
              autoFocus
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full bg-[#17212b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5288c1]"
              required
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRenaming}
                className="px-4 py-1.5 bg-[#5288c1] text-white rounded-xl text-xs font-semibold"
              >
                {isRenaming ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </SwitcherLayout>
  );
};
