import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { SkillChart } from './SkillChart.js';
import { api } from '../../services/api.js';
import { Candidate } from '../../../../shared/types.js';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Award,
  ClipboardList
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar.js';
import { useToast } from '../../contexts/ToastContext.js';

interface AdminDashboardProps {
  onNavigate: (tab: NavTab, candidateId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<{
    totalCandidates: number;
    assessmentsSubmitted: number;
    averageScore: number;
    shortlisted: number;
    awaitingReview: number;
    interviewScheduled: number;
    skillAverages: any[];
    recentSubmissions: Candidate[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getCandidateStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load candidate stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return <Badge variant="success">Shortlisted</Badge>;
      case 'interview_scheduled':
        return <Badge variant="purple">Interview Set</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'under_review':
      default:
        return <Badge variant="warning">Under Review</Badge>;
    }
  };

  const filteredCandidates = (stats?.recentSubmissions || []).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white text-purple-950 text-xs font-semibold mb-3 border border-purple-200">
            <img src="/tutedude-logo.png" alt="TuteDude" className="h-4 w-auto object-contain" />
            <span className="border-l border-slate-200 pl-1.5 text-slate-700">Growth & Operations Hiring Cycle 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            TuteDude Operations Hiring Dashboard
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Track intern candidate submissions, assess problem-solving skills, and review hiring progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Button
            variant="purple"
            size="md"
            onClick={() => onNavigate('take-home-assignment')}
            leftIcon={<ClipboardList className="w-4 h-4 text-purple-200" />}
          >
            Take-Home Portal
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate('candidate-evaluation')}
            leftIcon={<Award className="w-4 h-4 text-purple-600" />}
          >
            Grade Candidate
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Candidates */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Candidates</span>
            <div className="p-2 rounded-lg bg-navy-50 text-navy-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats ? stats.totalCandidates : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span>Applications logged</span>
            </div>
          </div>
        </div>

        {/* Assessments Submitted */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900 tracking-tight">
              {stats ? stats.assessmentsSubmitted : '—'}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">
              100% completion rate
            </div>
          </div>
        </div>

        {/* Average Assessment Score */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Score</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 tracking-tight">
              {stats ? `${stats.averageScore}` : '—'}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-purple-700 mt-1 font-medium">
              Benchmark: ≥ 80.0
            </div>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shortlisted</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              {stats ? stats.shortlisted : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Ready for final round
            </div>
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Awaiting Review</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
              {stats ? stats.awaitingReview : '—'}
            </div>
            <div className="text-[11px] text-amber-800 mt-1 font-medium">
              Pending rubric review
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Performance Charts across the 5 Core Skills */}
      {stats && stats.skillAverages && stats.skillAverages.length > 0 && (
        <SkillChart skillAverages={stats.skillAverages} />
      )}

      {/* Recent Submissions Table */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-navy-800" />
            <span>Recent Candidate Submissions</span>
          </div>
        }
        subtitle="Candidate assessments submitted for the Growth & Operations Intern position"
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-navy-800 w-40 sm:w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-navy-800"
            >
              <option value="all">All Statuses</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="under_review">Under Review</option>
              <option value="interview_scheduled">Interview Set</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Candidate Name</th>
                <th className="py-3 px-3">Background</th>
                <th className="py-3 px-3">Applied Date</th>
                <th className="py-3 px-3">Overall Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900 text-sm">{candidate.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{candidate.email}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-slate-700 font-medium">
                      {candidate.experienceLevel || 'Intern Applicant'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono">
                    {candidate.appliedDate}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          candidate.overallScore >= 85
                            ? 'text-emerald-700'
                            : candidate.overallScore >= 70
                            ? 'text-indigo-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {candidate.overallScore.toFixed(1)}
                      </span>
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            candidate.overallScore >= 85
                              ? 'bg-emerald-500'
                              : candidate.overallScore >= 70
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, candidate.overallScore)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <select
                      value={candidate.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await api.updateCandidateStatus(candidate.id, newStatus);
                          showToast(`Updated ${candidate.name} to ${newStatus.replace('_', ' ')}`, 'success');
                          loadStats();
                        } catch (err: any) {
                          showToast(err.message || 'Failed to update candidate status', 'error');
                        }
                      }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-navy-800 ${
                        candidate.status === 'shortlisted'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : candidate.status === 'interview_scheduled'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : candidate.status === 'rejected'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="under_review">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview_scheduled">Interview Set</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('candidate-evaluation', candidate.id)}
                      leftIcon={<Award className="w-3.5 h-3.5 text-purple-600" />}
                    >
                      Rubric & Grade
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No candidates found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
