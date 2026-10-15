import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Shield, Info, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { telegram } from '../lib/telegram';

interface EmbedLayoutProps {
  children: React.ReactNode;
  profileName: string;
  profileId: string;
  fingerprintSummary?: string;
  onRefreshIframe?: () => void;
}

export const EmbedLayout: React.FC<EmbedLayoutProps> = ({
  children,
  profileName,
  profileId,
  fingerprintSummary = 'Mobile iOS Safari',
  onRefreshIframe,
}) => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleBack = () => {
    telegram.haptic.impact('light');
    navigate('/');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#17212b] overflow-hidden select-none">
      {/* Top Chrome Header */}
      <header className="h-12 bg-[#17212b] border-b border-white/10 px-3 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1 text-[#708499] hover:text-white rounded-lg active:scale-95 transition"
            aria-label="Back to Switcher"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1877f2] to-[#2e89ff] flex items-center justify-center font-bold text-xs text-white shadow-sm">
              {profileName.substring(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white max-w-[130px] truncate">{profileName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[10px] text-[#708499] flex items-center gap-1">
                <span>m.facebook.com</span>
                <span>•</span>
                <span className="font-mono">{profileId.substring(0, 6)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded-lg text-xs transition ${
              showInfo ? 'bg-[#5288c1]/20 text-[#5288c1]' : 'text-[#708499] hover:text-white'
            }`}
            title="Inspect Proxy Transformations"
          >
            <Info className="w-4 h-4" />
          </button>

          {onRefreshIframe && (
            <button
              onClick={() => {
                telegram.haptic.impact('light');
                onRefreshIframe();
              }}
              className="p-1.5 text-[#708499] hover:text-white rounded-lg active:scale-95 transition"
              title="Reload Frame"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Inspect Info Drawer Modal */}
      {showInfo && (
        <div className="bg-[#202b36] border-b border-white/10 px-4 py-3 text-xs text-gray-300 space-y-2 animate-in slide-in-from-top duration-150 shrink-0 z-30">
          <div className="flex items-center justify-between font-semibold text-white">
            <span className="flex items-center gap-1.5 text-[#5288c1]">
              <Shield className="w-4 h-4" /> Reverse Proxy Invariant Enforcement
            </span>
            <button onClick={() => setShowInfo(false)} className="text-[11px] text-[#708499] hover:underline">
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#17212b] p-2 rounded-lg border border-white/5 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ingress Sanitization
              </div>
              <p className="text-gray-400 text-[10px]">
                X-Frame-Options: Stripped<br />
                CSP & HSTS: Stripped<br />
                Set-Cookie: Trapped in Vault
              </p>
            </div>
            <div className="bg-[#17212b] p-2 rounded-lg border border-white/5 space-y-1">
              <div className="font-semibold text-sky-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Egress Identity
              </div>
              <p className="text-gray-400 text-[10px]">
                Origin: https://m.facebook.com<br />
                Device: {fingerprintSummary}<br />
                Network: Residential Exit Node
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Iframe Viewport Container */}
      <div className="flex-1 w-full relative overflow-hidden bg-black">
        {children}
      </div>
    </div>
  );
};
