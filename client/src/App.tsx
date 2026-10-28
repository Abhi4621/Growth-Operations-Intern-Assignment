import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { ToastProvider } from './contexts/ToastContext.js';
import { Layout } from './components/layout/Layout.js';
import { NavTab } from './components/layout/Sidebar.js';
import { AdminDashboard } from './components/dashboard/AdminDashboard.js';
import { BusinessPerformance } from './components/business-analysis/BusinessPerformance.js';
import { BusinessResearchModule } from './components/research/BusinessResearchModule.js';
import { OperationsTracker } from './components/operations/OperationsTracker.js';
import { GrowthPlanningModule } from './components/growth-planning/GrowthPlanningModule.js';
import { FounderUpdateModule } from './components/founder-update/FounderUpdateModule.js';
import { CandidateEvaluationModule } from './components/candidate-evaluation/CandidateEvaluationModule.js';
import { AuditLogsModule } from './components/dashboard/AuditLogsModule.js';
import { TakeHomeAssignmentModule } from './components/assignment/TakeHomeAssignmentModule.js';
import { CandidateAssessmentView } from './components/assignment/CandidateAssessmentView.js';
import { LoginModal } from './components/auth/LoginModal.js';

const AppContent: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [targetCandidateId, setTargetCandidateId] = useState<string | undefined>();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPublicCandidatePortal, setShowPublicCandidatePortal] = useState(false);

  const handleNavigate = (tab: NavTab, candidateId?: string) => {
    if (candidateId) {
      setTargetCandidateId(candidateId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user explicitly clicks to view the standalone public candidate portal
  if (showPublicCandidatePortal) {
    return (
      <>
        <CandidateAssessmentView
          onAdminClick={() => setShowPublicCandidatePortal(false)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  const getTabMetadata = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'TuteDude Operations Hiring Dashboard',
          subtitle: 'Applicant pipeline, candidate test scores, and review statuses.',
        };
      case 'take-home-assignment':
        return {
          title: 'TuteDude Operations Intern Assignment',
          subtitle: 'The 4 practical tasks: funnel leak diagnosis, 2 company contacts, 5-day schedule, and weekly update.',
        };
      case 'business-analysis':
        return {
          title: 'Funnel & Conversion Math',
          subtitle: 'Track contacted leads, replies, booked calls, and show-up rates with AI recommendations.',
        };
      case 'research':
        return {
          title: 'Company & Lead Research',
          subtitle: 'Find real companies, verified decision-makers, and write short outreach messages.',
        };
      case 'operations':
        return {
          title: 'Operations Lead Tracker',
          subtitle: 'Track lead status, follow-up dates, priorities, and export to Excel or CSV.',
        };
      case 'growth-planning':
        return {
          title: '5-Day Work Schedule',
          subtitle: 'Plan 2 hours of daily tasks for Monday to Friday (capped at 120 mins/day).',
        };
      case 'founder-update':
        return {
          title: 'Weekly Manager Update',
          subtitle: 'A 1-page summary of weekly progress, blockers, and next priorities.',
        };
      case 'candidate-evaluation':
        return {
          title: 'Candidate Scoring & Review',
          subtitle: 'Score candidate submissions out of 100 on problem-solving, execution, and communication.',
        };
      case 'audit-logs':
        return {
          title: 'Activity Log',
          subtitle: 'Recent score updates, candidate changes, and reviewer actions.',
        };
    }
  };

  const metadata = getTabMetadata();

  return (
    <Layout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      title={metadata.title}
      subtitle={metadata.subtitle}
      onOpenLogin={() => setIsLoginModalOpen(true)}
      onSwitchToCandidate={() => setShowPublicCandidatePortal(true)}
    >
      {currentTab === 'dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
      {currentTab === 'take-home-assignment' && (
        <TakeHomeAssignmentModule onNavigate={handleNavigate} />
      )}
      {currentTab === 'business-analysis' && <BusinessPerformance />}
      {currentTab === 'research' && <BusinessResearchModule />}
      {currentTab === 'operations' && <OperationsTracker />}
      {currentTab === 'growth-planning' && <GrowthPlanningModule />}
      {currentTab === 'founder-update' && <FounderUpdateModule />}
      {currentTab === 'candidate-evaluation' && (
        <CandidateEvaluationModule initialCandidateId={targetCandidateId} />
      )}
      {currentTab === 'audit-logs' && <AuditLogsModule />}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
