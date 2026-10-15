import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { TelegramSimulatorBar } from '../components/TelegramSimulatorBar';

interface SwitcherLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export const SwitcherLayout: React.FC<SwitcherLayoutProps> = ({ children, onRefresh }) => {
  return (
    <div className="min-h-screen bg-[#17212b] text-white flex flex-col font-sans">
      <TelegramSimulatorBar onAuthModeChanged={onRefresh} />

      <header className="sticky top-0 z-30 bg-[#17212b]/95 backdrop-blur-md border-b border-white/10 px-4 py-3.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2e89ff] to-[#5288c1] flex items-center justify-center shadow-md shadow-[#2e89ff]/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Multi-Account Proxy</span>
              </h1>
              <p className="text-[11px] text-[#708499]">BFF & Stateful Reverse Proxy</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Residential Egress
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col">
        {children}
      </main>
    </div>
  );
};
