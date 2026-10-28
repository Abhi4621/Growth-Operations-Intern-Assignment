import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { api } from '../../services/api.js';
import { KeyRound, ShieldCheck, User, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, setDemoUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('admin@growthops.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  // New Candidate registration form state
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateBackground, setCandidateBackground] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await login(email, password);
        showToast('Successfully logged in!', 'success');
        onSuccess?.();
        onClose();
      } else {
        // Register new candidate
        if (!candidateName.trim() || !candidateEmail.trim()) {
          showToast('Please enter both name and email.', 'error');
          setIsLoading(false);
          return;
        }

        const candidate = await api.createCandidate({
          name: candidateName,
          email: candidateEmail,
          phone: candidatePhone || '+1 (555) 000-0000',
          experienceLevel: candidateBackground || 'Intern Applicant',
          status: 'under_review',
        });

        // Set session
        setDemoUser('candidate');
        showToast(`Welcome ${candidate.name}! Candidate profile created. Ready to begin your assessment.`, 'success');
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed. Please check your inputs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: 'admin' | 'candidate') => {
    setDemoUser(role);
    showToast(`Switched perspective to ${role === 'admin' ? 'Head of Growth (Admin)' : 'Abhi Pandey (Candidate)'}`, 'success');
    if (role === 'admin') {
      onSuccess?.();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === 'login' ? 'TuteDude Operations Sign In' : 'TuteDude Candidate Registration'}
      subtitle={activeTab === 'login' ? 'Sign in to review candidate submissions and rubric scores.' : 'Apply for the Growth & Operations Intern position at TuteDude.'}
      maxWidth="md"
    >
      <div className="flex justify-center mb-3">
        <img src="/tutedude-logo.png" alt="TuteDude" className="h-8 w-auto object-contain" />
      </div>
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition ${
            activeTab === 'login'
              ? 'border-navy-900 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Sign In (Admin / User)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition ${
            activeTab === 'register'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Apply as New Candidate
        </button>
      </div>

      {activeTab === 'login' ? (
        <>
          {/* 1-Click Fast Demo Credentials Buttons */}
          <div className="mb-5 p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
            <p className="text-xs font-semibold text-purple-900 mb-2">
              ⚡ One-Click Instant Demo Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin (Reviewer)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('candidate')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition"
              >
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Candidate (Alex Chen)</span>
              </button>
            </div>
          </div>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
              Or Enter Credentials
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-navy-800"
                placeholder="admin@growthops.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-navy-800"
                placeholder="admin123"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </div>
          </form>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={e => setCandidateName(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="e.g. Maya Patel"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={candidateEmail}
              onChange={e => setCandidateEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="e.g. maya.patel@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={candidatePhone}
              onChange={e => setCandidatePhone(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="+1 (555) 789-0123"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Background / Degree / Major
            </label>
            <input
              type="text"
              value={candidateBackground}
              onChange={e => setCandidateBackground(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="e.g. B.S. Business & Data Analytics, Class of 2026"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="purple"
              size="md"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Start Candidate Assessment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
