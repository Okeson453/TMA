import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-[#202b36] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDestructive ? 'bg-red-500/10 text-red-400' : 'bg-[#5288c1]/10 text-[#5288c1]'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>

        <p className="text-xs text-[#708499] leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#708499] hover:bg-white/5 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-95 flex items-center gap-1.5 ${
              isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#5288c1] hover:bg-[#4375a8]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
