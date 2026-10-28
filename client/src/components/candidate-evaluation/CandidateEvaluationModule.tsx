import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { ScoreOverrideModal } from './ScoreOverrideModal.js';
import { Candidate, CandidateEvaluation } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Edit,
  User,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface CandidateEvaluationModuleProps {
  initialCandidateId?: string;
}

export const CandidateEvaluationModule: React.FC<CandidateEvaluationModuleProps> = ({
  initialCandidateId,
}) => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(initialCandidateId || '');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateDetails, setCandidateDetails] = useState<{
    research?: any[];
    leads?: any[];
    growthPlan?: any;
    founderUpdate?: any;
    submission?: any;
  } | null>(null);
  const [evaluation, setEvaluation] = useState<CandidateEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    if (selectedCandidateId) {
      loadCandidateData(selectedCandidateId);
    }
  }, [selectedCandidateId]);

  const loadCandidates = async () => {
    try {
      const data = await api.getCandidates();
      setCandidates(data);
      if (!selectedCandidateId && data.length > 0) {
        setSelectedCandidateId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
    }
  };

  const loadCandidateData = async (candidateId: string) => {
    try {
      setIsLoading(true);
      const res = await api.getCandidate(candidateId);
      setSelectedCandidate(res.candidate);
      setCandidateDetails({
        research: res.research,
        leads: res.leads,
        growthPlan: res.growthPlan,
        founderUpdate: res.founderUpdate,
        submission: res.submission,
      });
      if (res.evaluation) {
        setEvaluation(res.evaluation);
      } else {
        setEvaluation(null);
      }
    } catch (err) {
      console.error('Failed to load candidate details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAIEvaluation = async () => {
    if (!selectedCandidate) return;

    setIsEvaluating(true);
    try {
      const res = await api.evaluateCandidate({
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        candidateNotes: selectedCandidate.notes,
        funnelData: candidateDetails?.submission?.funnelData || {
          potentialCustomers: 100,
          contactedCustomers: 80,
          respondedCustomers: 20,
          meetingsBooked: 8,
          demosAttended: 3,
          interestedFollowUp: 2,
        },
        businessResearch: candidateDetails?.research,
        leads: candidateDetails?.leads,
        growthPlan: candidateDetails?.growthPlan,
        founderUpdate: candidateDetails?.founderUpdate,
      });
      setEvaluation(res);
      showToast(`AI Rubric evaluation completed for ${selectedCandidate.name}.`, 'success');
      // refresh candidate list score
      loadCandidates();
    } catch (err: any) {
      showToast(err.message || 'Failed to run AI evaluation.', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Candidate Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Candidate Evaluation (100 Points)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review applicant answers, score problem-solving, execution, and communication, and make hiring decisions.
          </p>
        </div>

        {/* Candidate Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Evaluating:</span>
          <select
            value={selectedCandidateId}
            onChange={e => setSelectedCandidateId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-800 shadow-xs"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.overallScore > 0 ? `${c.overallScore} pts` : 'Pending'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Profile Summary Banner */}
      {selectedCandidate && (
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base shrink-0">
              {selectedCandidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{selectedCandidate.name}</h3>
                <Badge
                  variant={
                    selectedCandidate.status === 'shortlisted'
                      ? 'success'
                      : selectedCandidate.status === 'interview_scheduled'
                      ? 'purple'
                      : selectedCandidate.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {selectedCandidate.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCandidate.experienceLevel} • Applied {selectedCandidate.appliedDate} • {selectedCandidate.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="purple"
              size="sm"
              onClick={handleRunAIEvaluation}
              isLoading={isEvaluating}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Re-run AI Evaluation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOverrideModalOpen(true)}
              leftIcon={<Edit className="w-3.5 h-3.5 text-navy-800" />}
            >
              Admin Adjust Scores
            </Button>
          </div>
        </div>
      )}

      {/* Main Rubric & Evaluation View */}
      {evaluation ? (
        <div className="space-y-6">
          {/* Top Score Summary Banner */}
          <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-purple-950 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-2 border border-purple-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Advisory Recommendation</span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span>{evaluation.totalScore.toFixed(1)}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100 Points</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Scores add up to 100 based on the official rubric weights. Evaluates authentic calculations, business evidence, and practical operations realism.
              </p>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Suggested Recommendation
              </div>
              <span
                className={`inline-block text-base font-extrabold px-3 py-1 rounded-xl shadow-xs border ${
                  evaluation.suggestedRecommendation === 'Strong Hire'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    : evaluation.suggestedRecommendation === 'Hire'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50'
                    : evaluation.suggestedRecommendation === 'Needs Further Interview'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/50'
                }`}
              >
                {evaluation.suggestedRecommendation}
              </span>
            </div>
          </div>

          {/* Admin Override Alert if present */}
          {evaluation.overrideReason && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Edit className="w-4 h-4" />
                <span>Administrator Override Recorded by {evaluation.overriddenBy || 'Admin'}:</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-sans pl-5">
                "{evaluation.overrideReason}"
              </p>
            </div>
          )}

          {/* 5 Rubric Categories with Weights & Evidence */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Rubric Competency Breakdown (100 Points Total)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* 1. Problem Solving (25%) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Problem-Solving & Prioritisation</span>
                    <Badge variant="purple" size="sm">Weight: 25</Badge>
                  </div>
                  <div className="text-2xl font-black text-purple-900 mb-2 font-mono">
                    {evaluation.scores.problemSolving} <span className="text-xs text-slate-400">/ 25 pts</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {evaluation.evidence.problemSolving}
                  </p>
                </div>
              </div>

              {/* 2. Analytical Thinking (20%) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Analytical Thinking</span>
                    <Badge variant="primary" size="sm">Weight: 20</Badge>
                  </div>
                  <div className="text-2xl font-black text-navy-900 mb-2 font-mono">
                    {evaluation.scores.analyticalThinking} <span className="text-xs text-slate-400">/ 20 pts</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {evaluation.evidence.analyticalThinking}
                  </p>
                </div>
              </div>

              {/* 3. Execution Ability & Research Quality (25%) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Execution Ability & Research</span>
                    <Badge variant="purple" size="sm">Weight: 25</Badge>
                  </div>
                  <div className="text-2xl font-black text-purple-900 mb-2 font-mono">
                    {evaluation.scores.executionAbility} <span className="text-xs text-slate-400">/ 25 pts</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {evaluation.evidence.executionAbility}
                  </p>
                </div>
              </div>

              {/* 4. Communication & Clarity (15%) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Communication & Clarity</span>
                    <Badge variant="success" size="sm">Weight: 15</Badge>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 mb-2 font-mono">
                    {evaluation.scores.communication} <span className="text-xs text-slate-400">/ 15 pts</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {evaluation.evidence.communication}
                  </p>
                </div>
              </div>

              {/* 5. Ownership & Attention to Detail (15%) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Ownership & Attention to Detail</span>
                    <Badge variant="success" size="sm">Weight: 15</Badge>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 mb-2 font-mono">
                    {evaluation.scores.ownershipDetail} <span className="text-xs text-slate-400">/ 15 pts</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {evaluation.evidence.ownershipDetail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths and Areas for Improvement (Two Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <Card
              title={
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Candidate Strengths</span>
                </div>
              }
              subtitle="Concrete execution highlights observed in submission"
            >
              <ul className="space-y-2 text-xs">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Areas for Improvement */}
            <Card
              title={
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Areas for Improvement</span>
                </div>
              }
              subtitle="Actionable coaching targets for intern onboarding"
            >
              <ul className="space-y-2 text-xs">
                {evaluation.areasForImprovement.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Follow-up Interview Questions to Probe Authenticity */}
          <Card
            title={
              <div className="flex items-center gap-2 text-slate-900">
                <HelpCircle className="w-4 h-4 text-brand-purple" />
                <span>Follow-Up Interview Questions (Authenticity Checks)</span>
              </div>
            }
            subtitle="Targeted questions to verify the candidate genuinely thought through operational tradeoffs rather than blindly copying AI templates"
          >
            <div className="space-y-3 text-xs">
              {evaluation.followUpInterviewQuestions.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="font-semibold text-slate-900 leading-relaxed">
                    {q}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6">
          <Award className="w-10 h-10 text-purple-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">
            No Evaluation Graded Yet for {selectedCandidate?.name}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Click the button below to have the OpenAI API evaluate this candidate's submitted funnel math, research evidence, operations tracker, and founder memo against the 100-point rubric.
          </p>
          <Button
            variant="purple"
            size="md"
            onClick={handleRunAIEvaluation}
            isLoading={isEvaluating}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Run AI Evaluation (100-Point Rubric)
          </Button>
        </div>
      )}

      {/* Score Override Modal */}
      <ScoreOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        evaluation={evaluation}
        onSaved={updated => {
          setEvaluation(updated);
          loadCandidates();
        }}
      />
    </div>
  );
};
