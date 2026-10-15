import React, { useState } from 'react';
import { Smartphone, Key, User, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import { CreateProfile } from '../../../types/api';
import { parseCookieSummary } from '../../../shared/lib/format';
import { telegram } from '../../../shared/lib/telegram';

interface AddProfileFormProps {
  onSubmit: (data: CreateProfile) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    name: 'iPhone 15 Pro (iOS 17)',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    acceptLanguage: 'en-US,en;q=0.9',
    screenWidth: 393,
    screenHeight: 852,
  },
  {
    name: 'Samsung Galaxy S24 (Android 14)',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Mobile Safari/537.36',
    acceptLanguage: 'en-GB,en;q=0.8',
    screenWidth: 412,
    screenHeight: 915,
  },
  {
    name: 'Google Pixel 8 (Android 14)',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.80 Mobile Safari/537.36',
    acceptLanguage: 'en-US,en;q=0.9',
    screenWidth: 412,
    screenHeight: 924,
  },
];

export const AddProfileForm: React.FC<AddProfileFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [cookieString, setCookieString] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isCustomFp, setIsCustomFp] = useState(false);
  const [customUa, setCustomUa] = useState(PRESETS[0].userAgent);
  const [customLang, setCustomLang] = useState(PRESETS[0].acceptLanguage);
  const [customWidth, setCustomWidth] = useState(PRESETS[0].screenWidth);
  const [customHeight, setCustomHeight] = useState(PRESETS[0].screenHeight);
  const [error, setError] = useState<string | null>(null);

  const cookieSummary = parseCookieSummary(cookieString);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setIsCustomFp(false);
    setCustomUa(PRESETS[idx].userAgent);
    setCustomLang(PRESETS[idx].acceptLanguage);
    setCustomWidth(PRESETS[idx].screenWidth);
    setCustomHeight(PRESETS[idx].screenHeight);
  };

  const loadSampleProfile = () => {
    telegram.haptic.impact('light');
    const randomId = Math.floor(1000000000 + Math.random() * 9000000000);
    setDisplayName(`Account #${randomId.toString().slice(-4)}`);
    setCookieString(
      `c_user=${randomId}; xs=29%3Asample_sess_${randomId}%3A2%3A171999; datr=fr_sample_datr_${randomId}; fr=0v4p1L; sb=99A2`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (!cookieString.trim()) {
      setError('Target platform cookie string is required');
      return;
    }

    const payload: CreateProfile = {
      displayName: displayName.trim(),
      cookieString: cookieString.trim(),
      fingerprint: {
        userAgent: isCustomFp ? customUa : PRESETS[selectedPresetIndex].userAgent,
        acceptLanguage: isCustomFp ? customLang : PRESETS[selectedPresetIndex].acceptLanguage,
        screenWidth: isCustomFp ? Number(customWidth) : PRESETS[selectedPresetIndex].screenWidth,
        screenHeight: isCustomFp ? Number(customHeight) : PRESETS[selectedPresetIndex].screenHeight,
      },
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Top action: load sample */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Add Account Profile</span>
        </h2>
        <button
          type="button"
          onClick={loadSampleProfile}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#2e89ff]/15 text-[#2e89ff] hover:bg-[#2e89ff]/25 rounded-lg transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Test Sample</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/20 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Field: Display Name */}
      <div className="telegram-card p-3.5 space-y-1.5">
        <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#5288c1]" />
          <span>Profile Display Name</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Russell Crowee (Personal)"
          className="w-full bg-[#17212b] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#5288c1]"
          required
        />
        <p className="text-[10px] text-[#708499]">
          Identifies this profile in your Telegram multi-account switcher list.
        </p>
      </div>

      {/* Field: Cookie String */}
      <div className="telegram-card p-3.5 space-y-2">
        <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#5288c1]" />
            <span>Origin Session Cookie String</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">AES-256 Vault Encrypted</span>
        </label>
        <textarea
          rows={3}
          value={cookieString}
          onChange={(e) => setCookieString(e.target.value)}
          placeholder="c_user=1000...; xs=...; datr=...; fr=...;"
          className="w-full bg-[#17212b] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#5288c1]"
          required
        />

        {/* Live Cookie Inspector */}
        <div className="p-2.5 rounded-lg bg-[#17212b] border border-white/5 space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-gray-400">
            <span>Parsed Cookie Tokens:</span>
            <span className="font-semibold text-white">{cookieSummary.count} detected</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] ${cookieSummary.cUser ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-gray-500'}`}>
              c_user: {cookieSummary.cUser || 'none'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${cookieSummary.hasXs ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-gray-500'}`}>
              xs: {cookieSummary.hasXs ? 'Present' : 'none'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${cookieSummary.hasDatr ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-gray-500'}`}>
              datr: {cookieSummary.hasDatr ? 'Present' : 'none'}
            </span>
          </div>
        </div>
      </div>

      {/* Field: Device Fingerprint Presets */}
      <div className="telegram-card p-3.5 space-y-2.5">
        <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-[#5288c1]" />
          <span>Device Identity & Fingerprint</span>
        </label>

        <div className="grid grid-cols-1 gap-1.5">
          {PRESETS.map((p, idx) => (
            <button
              type="button"
              key={p.name}
              onClick={() => handleSelectPreset(idx)}
              className={`p-2.5 rounded-xl text-left border text-xs transition flex items-center justify-between ${
                !isCustomFp && selectedPresetIndex === idx
                  ? 'bg-[#5288c1]/15 border-[#5288c1] text-white font-semibold'
                  : 'bg-[#17212b] border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <span>{p.name}</span>
              <span className="text-[10px] text-[#708499]">{p.screenWidth}x{p.screenHeight}</span>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-[#708499]">
          Enforces coherent User-Agent, Accept-Language, and screen metrics so Meta sees a stable mobile client.
        </p>
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:bg-white/5 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-[#5288c1] hover:bg-[#4375a8] active:scale-98 text-white rounded-xl text-xs font-semibold shadow-lg shadow-[#5288c1]/20 transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Saving to Vault...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Save & Encrypt Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
