import React, { useEffect, useState } from 'react';
import { Menu, Sparkles, Key, CheckCircle, AlertTriangle, ShieldCheck, User as UserIcon, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  onOpenLogin: () => void;
  onSwitchToCandidate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  title,
  subtitle,
  onOpenLogin,
  onSwitchToCandidate,
}) => {
  const { user, isAdmin } = useAuth();
  const [aiStatus, setAiStatus] = useState<{
    openaiConfigured: boolean;
    geminiConfigured?: boolean;
    activeProvider?: string;
    model: string | null;
    fallbackConfigured: boolean;
    statusMessage: string;
  } | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(res => setAiStatus(res.aiConfig))
      .catch(() => setAiStatus(null));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
      {/* Left Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 lg:hidden rounded-lg hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="lg:hidden flex items-center">
          <img src="/tutedude-logo.png" alt="TuteDude" className="h-6 w-auto object-contain mr-1" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls & AI Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onSwitchToCandidate && (
          <button
            onClick={onSwitchToCandidate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition"
            title="Go to the clean candidate take-home assessment form"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Candidate Portal</span>
          </button>
        )}

        {/* AI Key Status Badge */}
        {aiStatus ? (
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              aiStatus.openaiConfigured || aiStatus.geminiConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={aiStatus.statusMessage}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[220px]">
              {aiStatus.activeProvider
                ? `${aiStatus.activeProvider} (${aiStatus.model || 'active'})`
                : aiStatus.openaiConfigured
                ? `OpenAI (${aiStatus.model})`
                : aiStatus.fallbackConfigured
                ? 'Gemini 2.5 Flash'
                : 'Deterministic Model'}
            </span>
          </div>
        ) : null}

        {/* User / Login Button */}
        {user ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-700">
            {isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline">{user.fullName}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 uppercase tracking-wider font-bold">
              {user.role}
            </span>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-medium transition shadow-xs"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
