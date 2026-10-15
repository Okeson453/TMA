import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, UserCheck, RefreshCw, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { telegram } from '../lib/telegram';
import { fetchDevMockInitData } from '../../api/profiles';

interface TelegramSimulatorBarProps {
  onAuthModeChanged?: () => void;
}

export const TelegramSimulatorBar: React.FC<TelegramSimulatorBarProps> = ({ onAuthModeChanged }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<'valid' | 'forged' | 'native'>('valid');
  const [currentUserId, setCurrentUserId] = useState(84920481);
  const [initDataString, setInitDataString] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    loadMockData(currentUserId, 'valid');
  }, []);

  const loadMockData = async (userId: number, mode: 'valid' | 'forged') => {
    try {
      const data = await fetchDevMockInitData(userId, `user_${userId}`, `User ${userId}`);
      const chosen = mode === 'valid' ? data.validInitData : data.forgedInitData;
      telegram.setSimulatedInitData(chosen);
      setInitDataString(chosen);
      setCurrentMode(mode);
      if (onAuthModeChanged) onAuthModeChanged();
    } catch {
      // ignore
    }
  };

  const handleToggleMode = (mode: 'valid' | 'forged') => {
    loadMockData(currentUserId, mode);
  };

  const handleSwitchUser = (newUserId: number) => {
    setCurrentUserId(newUserId);
    loadMockData(newUserId, currentMode === 'forged' ? 'forged' : 'valid');
  };

  const copyInitData = () => {
    navigator.clipboard.writeText(initDataString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e2a38] border-b border-white/10 text-xs">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentMode === 'valid' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${currentMode === 'valid' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span className="font-semibold text-gray-200">
            TG Auth: {currentMode === 'valid' ? 'HMAC Valid' : 'Signature Forged (403 Test)'}
          </span>
          <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-mono">
            UID: {currentUserId}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#708499] hover:text-white flex items-center gap-1 font-medium text-[11px]"
        >
          <span>Auth Harness</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="max-w-md mx-auto px-4 pb-3 pt-1 space-y-3 border-t border-white/5">
          <div className="text-[11px] text-[#708499]">
            Simulate native Telegram WebApp SDK verification or test anti-abuse 403 Forbidden rejection:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleToggleMode('valid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentMode === 'valid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#232e3c] text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Valid HMAC initData</span>
            </button>

            <button
              onClick={() => handleToggleMode('forged')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentMode === 'forged'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-[#232e3c] text-gray-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Simulate Forged (Expect 403)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> User:
            </span>
            <button
              onClick={() => handleSwitchUser(84920481)}
              className={`px-2 py-0.5 rounded text-[11px] ${currentUserId === 84920481 ? 'bg-[#5288c1] text-white' : 'bg-[#232e3c] text-gray-400'}`}
            >
              User 84920481
            </button>
            <button
              onClick={() => handleSwitchUser(99999999)}
              className={`px-2 py-0.5 rounded text-[11px] ${currentUserId === 99999999 ? 'bg-[#5288c1] text-white' : 'bg-[#232e3c] text-gray-400'}`}
            >
              User 99999999 (Isolation Test)
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono bg-black/30 p-2 rounded-lg">
            <span className="truncate max-w-[280px]">{initDataString.substring(0, 48)}...</span>
            <button onClick={copyInitData} className="text-[#5288c1] hover:underline shrink-0 ml-2">
              {isCopied ? 'Copied!' : 'Copy initData'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
