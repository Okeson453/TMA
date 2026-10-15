import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  code?: string;
  traceId?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  code,
  traceId,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-xs text-[#708499] leading-relaxed">{message}</p>
        {(code || traceId) && (
          <div className="pt-2 text-[10px] text-gray-500 font-mono">
            {code && <span>Code: {code}</span>}
            {code && traceId && <span> • </span>}
            {traceId && <span>Trace: {traceId.substring(0, 8)}...</span>}
          </div>
        )}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#232e3c] hover:bg-[#2b394a] text-[#5288c1] rounded-lg text-xs font-semibold transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
