import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { BusinessResearch, VerificationStatus } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Sparkles, Globe, User, AlertCircle, Link2, Plus, Trash2 } from 'lucide-react';

interface ResearchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BusinessResearch | null;
  onSave: (record: BusinessResearch) => void;
}

export const ResearchFormModal: React.FC<ResearchFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [decisionMaker, setDecisionMaker] = useState('');
  const [personalisedOutreach, setPersonalisedOutreach] = useState('');
  const [sourceUrls, setSourceUrls] = useState<string[]>(['']);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('Verified with Sources');
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setBusinessName(initialData.businessName || '');
      setWebsite(initialData.website || '');
      setIndustry(initialData.industry || '');
      setDescription(initialData.description || '');
      setProblem(initialData.problem || '');
      setDecisionMaker(initialData.decisionMaker || '');
      setPersonalisedOutreach(initialData.personalisedOutreach || '');
      setSourceUrls(initialData.sourceUrls && initialData.sourceUrls.length > 0 ? initialData.sourceUrls : ['']);
      setVerificationStatus(initialData.verificationStatus || 'Verified with Sources');
    } else {
      setBusinessName('');
      setWebsite('');
      setIndustry('B2B SaaS / Automated Platform');
      setDescription('');
      setProblem('');
      setDecisionMaker('');
      setPersonalisedOutreach('');
      setSourceUrls(['']);
      setVerificationStatus('Draft / Unverified');
    }
  }, [initialData, isOpen]);

  const handleAddSourceUrl = () => {
    setSourceUrls(prev => [...prev, '']);
  };

  const handleSourceUrlChange = (index: number, val: string) => {
    setSourceUrls(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveSourceUrl = (index: number) => {
    setSourceUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateOutreach = async () => {
    if (!businessName || !problem) {
      showToast('Please enter the Business Name and Identified Problem first.', 'warning');
      return;
    }

    setIsGeneratingOutreach(true);
    try {
      const res = await api.generateOutreach({
        businessName,
        website,
        industry,
        description,
        problem,
        decisionMaker,
        sourceUrls: sourceUrls.filter(u => u.trim() !== ''),
      });
      setPersonalisedOutreach(res.draft);
      showToast('Generated outreach draft. Remember to verify details before sending.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate outreach draft.', 'error');
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !website) {
      showToast('Business Name and Website are required.', 'error');
      return;
    }

    const cleanedUrls = sourceUrls.filter(u => u.trim() !== '');

    setIsSubmitting(true);
    try {
      let saved: BusinessResearch;
      if (initialData && initialData.id) {
        saved = await api.updateResearch(initialData.id, {
          businessName,
          website,
          industry,
          description,
          problem,
          decisionMaker,
          personalisedOutreach,
          sourceUrls: cleanedUrls,
          verificationStatus,
        });
        showToast('Business research updated successfully.', 'success');
      } else {
        saved = await api.createResearch({
          businessName,
          website,
          industry,
          description,
          problem,
          decisionMaker,
          personalisedOutreach,
          sourceUrls: cleanedUrls,
          verificationStatus,
        });
        showToast('New business research added.', 'success');
      }
      onSave(saved);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save business research record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Business: ${initialData.businessName}` : 'Add New Real-World Business Research'}
      subtitle="Document target B2B SaaS accounts, decision-makers, and evidence-backed pain points."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Verification Rule Warning */}
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Authenticity Requirement:</span> Do not fabricate decision-makers or problems. Source links must reference real public profiles, company documentation, or official announcements.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
              placeholder="e.g. Customer.io"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Website *</label>
            <input
              type="url"
              required
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
              placeholder="e.g. B2B SaaS / Automated Messaging"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Relevant Decision-Maker & Role</label>
            <input
              type="text"
              value={decisionMaker}
              onChange={e => setDecisionMaker(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
              placeholder="e.g. Chris Parker, VP of Global Sales"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Business Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
            placeholder="What does the company do, who are their customers, and what is their core offering?"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Potential Customer Problem / Pipeline Bottleneck</label>
          <textarea
            rows={2}
            value={problem}
            onChange={e => setProblem(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
            placeholder="Specific operational issue (e.g. demo no-shows during competitive POCs, calendar ghosting, SDR-AE handoff drop-off)"
          />
        </div>

        {/* Source URLs */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-semibold text-slate-700">Source URLs (LinkedIn, Company Blog, News)</label>
            <button
              type="button"
              onClick={handleAddSourceUrl}
              className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Source URL
            </button>
          </div>
          <div className="space-y-2">
            {sourceUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => handleSourceUrlChange(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900 font-mono text-[11px]"
                  placeholder="https://linkedin.com/in/... or https://company.com/blog"
                />
                {sourceUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSourceUrl(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Personalised Outreach Message */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-semibold text-slate-700">Personalised Outreach Message</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateOutreach}
              isLoading={isGeneratingOutreach}
              leftIcon={<Sparkles className="w-3 h-3 text-purple-600" />}
            >
              AI Draft Assist
            </Button>
          </div>
          <textarea
            rows={3}
            value={personalisedOutreach}
            onChange={e => setPersonalisedOutreach(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900 font-mono text-xs leading-relaxed"
            placeholder="Draft a concise (<90 words) outreach message addressing their specific operational friction..."
          />
          <p className="text-[10px] text-slate-400 mt-0.5">
            Note: Generated outreach messages are marked as drafts and must be reviewed against verified facts.
          </p>
        </div>

        {/* Verification Status */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Research Verification Status</label>
          <select
            value={verificationStatus}
            onChange={e => setVerificationStatus(e.target.value as VerificationStatus)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900 bg-white"
          >
            <option value="Verified with Sources">Verified with Sources</option>
            <option value="Draft / Unverified">Draft / Unverified</option>
            <option value="Needs Review">Needs Review</option>
          </select>
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
            {initialData ? 'Save Changes' : 'Create Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
