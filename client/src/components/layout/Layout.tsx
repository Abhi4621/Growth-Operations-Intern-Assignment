import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar.js';
import { Header } from './Header.js';

interface LayoutProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onOpenLogin: () => void;
  onSwitchToCandidate?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onTabChange,
  children,
  title,
  subtitle,
  onOpenLogin,
  onSwitchToCandidate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSwitchToCandidate={onSwitchToCandidate}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
          onOpenLogin={onOpenLogin}
          onSwitchToCandidate={onSwitchToCandidate}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
