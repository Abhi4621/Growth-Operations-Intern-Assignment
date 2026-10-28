import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Search,
  CheckSquare,
  Calendar,
  FileText,
  Award,
  History,
  Shield,
  UserCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export type NavTab =
  | 'dashboard'
  | 'take-home-assignment'
  | 'business-analysis'
  | 'research'
  | 'operations'
  | 'growth-planning'
  | 'founder-update'
  | 'candidate-evaluation'
  | 'audit-logs';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCandidate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpen,
  onClose,
  onSwitchToCandidate,
}) => {
  const { user, isAdmin, logout, setDemoUser } = useAuth();

  const primaryNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'take-home-assignment',
      label: 'Intern Assignment',
      icon: <ClipboardList className="w-4 h-4 text-purple-400" />,
      badge: 'Main',
    },
    {
      id: 'operations',
      label: 'Operations Tracker',
      icon: <CheckSquare className="w-4 h-4 text-indigo-400" />,
      badge: 'Leads',
    },
    {
      id: 'dashboard',
      label: 'Hiring Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'candidate-evaluation',
      label: 'Candidate Scoring',
      icon: <Award className="w-4 h-4 text-amber-400" />,
      badge: '100 Pts',
    },
  ];

  const secondaryNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; adminOnly?: boolean }[] = [
    {
      id: 'business-analysis',
      label: 'Funnel & Conversion',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'research',
      label: 'Company Research',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'growth-planning',
      label: '5-Day Work Plan',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'founder-update',
      label: 'Manager Update',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'audit-logs',
      label: 'Activity Log',
      icon: <History className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-950 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-white">
          <div className="flex items-center gap-2">
            <img
              src="/tutedude-logo.png"
              alt="TuteDude"
              className="h-8 w-auto object-contain max-w-[140px]"
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            Hiring
          </span>
        </div>

        {/* Quick Role / View Switcher */}
        <div className="px-3 pt-4 pb-2">
          {onSwitchToCandidate && (
            <button
              onClick={() => {
                onSwitchToCandidate();
                onClose();
              }}
              className="w-full mb-2.5 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 border border-purple-500/30 text-xs font-semibold transition"
            >
              <span>← Candidate Assessment View</span>
            </button>
          )}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`} />
              <span className="text-slate-200 font-medium">
                {isAdmin ? 'Admin View' : 'Candidate View'}
              </span>
            </div>
            <button
              onClick={() => setDemoUser(isAdmin ? 'candidate' : 'admin')}
              className="text-[11px] px-2 py-0.5 font-semibold rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition"
              title="Click to toggle between Admin and Candidate perspective"
            >
              Switch to {isAdmin ? 'Candidate' : 'Admin'}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Workflow
          </div>

          {primaryNavItems.map(item => {
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-950/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-300'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-800/80 mt-2">
            Detailed Simulators
          </div>

          {secondaryNavItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 group-hover:text-slate-300">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-500">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / User Profile */}
        <div className="p-3 border-t border-slate-800 bg-navy-950">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                {user ? user.fullName.charAt(0) : 'G'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user ? user.fullName : 'Guest Reviewer'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user ? user.email : 'guest@growthops.com'}
                </p>
              </div>
            </div>
            {user ? (
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
};
