import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { CandidateEvaluation, SkillScores } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import { AlertCircle, Sliders } from 'lucide-react';

interface ScoreOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: CandidateEvaluation | null;
  onSaved: (updated: CandidateEvaluation) => void;
}

export const ScoreOverrideModal: React.FC<ScoreOverrideModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  onSaved,
}) => {
  const { showToast } = useToast();

  const [scores, setScores] = useState<SkillScores>({
    problemSolving: 20,
    analyticalThinking: 16,
    executionAbility: 20,
    communication: 12,
    ownershipDetail: 12,
  });

  const [overrideReason, setOverrideReason] = useState('');
  const [finalStatus, setFinalStatus] = useState<CandidateEvaluation['finalStatus']>('Shortlist');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (evaluation) {
      setScores(evaluation.scores);
      setOverrideReason(evaluation.overrideReason || '');
      setFinalStatus(evaluation.finalStatus || 'Shortlist');
    }
  }, [evaluation, isOpen]);

  const handleScoreChange = (category: keyof SkillScores, val: number, max: number) => {
    const clamped = Math.min(max, Math.max(0, val));
    setScores(prev => ({
      ...prev,
      [category]: clamped,
    }));
  };

  const calculatedTotal = parseFloat(
    (
      scores.problemSolving +
      scores.analyticalThinking +
      scores.executionAbility +
      scores.communication +
      scores.ownershipDetail
    ).toFixed(2)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluation) return;

    if (!overrideReason.trim()) {
      showToast('Please provide an explicit rationale for adjusting candidate scores.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.overrideEvaluation({
        evaluationId: evaluation.id,
        scores,
        overrideReason,
        finalStatus,
      });
      showToast('Administrator score adjustment recorded with audit log.', 'success');
      onSaved(updated);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to record override.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administrator Rubric Score Adjustment"
      subtitle={`Adjust scores and record hiring decision rationale for ${evaluation?.candidateName || 'Candidate'}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong>Advisory Rubric Governance:</strong> AI scores are recommendations. Any adjustments made by an administrator are logged with timestamp and author name.
          </div>
        </div>

        {/* Total Score Meter */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Score</span>
            <div className="text-2xl font-black text-white">{calculatedTotal} / 100.0</div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              calculatedTotal >= 85
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : calculatedTotal >= 70
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
            }`}
          >
            {calculatedTotal >= 85 ? 'Strong Hire' : calculatedTotal >= 70 ? 'Hire' : 'Needs Further Review'}
          </span>
        </div>

        {/* 5 Categories */}
        <div className="space-y-3">
          {/* Problem-Solving (25) */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Problem-Solving and Prioritisation (Weight: 25)</span>
              <span className="font-mono text-purple-700">{scores.problemSolving} / 25 pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={scores.problemSolving}
              onChange={e => handleScoreChange('problemSolving', parseFloat(e.target.value), 25)}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Analytical Thinking (20) */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Analytical Thinking (Weight: 20)</span>
              <span className="font-mono text-purple-700">{scores.analyticalThinking} / 20 pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={scores.analyticalThinking}
              onChange={e => handleScoreChange('analyticalThinking', parseFloat(e.target.value), 20)}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Execution Ability (25) */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Execution Ability & Research Quality (Weight: 25)</span>
              <span className="font-mono text-purple-700">{scores.executionAbility} / 25 pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={scores.executionAbility}
              onChange={e => handleScoreChange('executionAbility', parseFloat(e.target.value), 25)}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Communication (15) */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Communication & Clarity (Weight: 15)</span>
              <span className="font-mono text-purple-700">{scores.communication} / 15 pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={scores.communication}
              onChange={e => handleScoreChange('communication', parseFloat(e.target.value), 15)}
              className="w-full accent-purple-600"
            />
          </div>

          {/* Ownership & Attention to Detail (15) */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Ownership & Attention to Detail (Weight: 15)</span>
              <span className="font-mono text-purple-700">{scores.ownershipDetail} / 15 pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={scores.ownershipDetail}
              onChange={e => handleScoreChange('ownershipDetail', parseFloat(e.target.value), 15)}
              className="w-full accent-purple-600"
            />
          </div>
        </div>

        {/* Final Hiring Decision */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Hiring Decision Status</label>
          <select
            value={finalStatus}
            onChange={e => setFinalStatus(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900 bg-white"
          >
            <option value="Shortlist">Shortlist for Final Interview</option>
            <option value="Move to Interview">Schedule Screening Interview</option>
            <option value="Hold">Hold / Review Later</option>
            <option value="Reject">Reject (Manual Confirmation)</option>
          </select>
        </div>

        {/* Override Justification */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Reason for Adjustment / Evaluation Notes *
          </label>
          <textarea
            required
            rows={3}
            value={overrideReason}
            onChange={e => setOverrideReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900 font-sans leading-relaxed"
            placeholder="Explain why the score or status was adjusted (e.g. Candidate demonstrated deep understanding in follow-up interview; verified additional LinkedIn research sources)."
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
