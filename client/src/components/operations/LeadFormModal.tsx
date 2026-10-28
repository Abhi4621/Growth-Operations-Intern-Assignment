import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Lead, OutreachStatus, PriorityLevel } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: Lead | null;
  onSave: (lead: Lead) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  initialLead,
  onSave,
}) => {
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessProblem, setBusinessProblem] = useState('');
  const [outreachStatus, setOutreachStatus] = useState<OutreachStatus>('Not Started');
  const [lastActionDate, setLastActionDate] = useState(todayStr);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(tomorrowStr);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [nextAction, setNextAction] = useState('');
  const [reasonForPriority, setReasonForPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialLead) {
      setBusinessName(initialLead.businessName || '');
      setWebsite(initialLead.website || '');
      setContactPerson(initialLead.contactPerson || '');
      setBusinessProblem(initialLead.businessProblem || '');
      setOutreachStatus(initialLead.outreachStatus || 'Not Started');
      setLastActionDate(initialLead.lastActionDate || todayStr);
      setNextFollowUpDate(initialLead.nextFollowUpDate || tomorrowStr);
      setPriority(initialLead.priority || 'Medium');
      setNextAction(initialLead.nextAction || '');
      setReasonForPriority(initialLead.reasonForPriority || '');
    } else {
      setBusinessName('');
      setWebsite('https://');
      setContactPerson('');
      setBusinessProblem('');
      setOutreachStatus('Not Started');
      setLastActionDate(todayStr);
      setNextFollowUpDate(tomorrowStr);
      setPriority('High');
      setNextAction('');
      setReasonForPriority('');
    }
  }, [initialLead, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactPerson) {
      showToast('Business Name and Contact Person are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let saved: Lead;
      if (initialLead && initialLead.id) {
        saved = await api.updateLead(initialLead.id, {
          businessName,
          website,
          contactPerson,
          businessProblem,
          outreachStatus,
          lastActionDate,
          nextFollowUpDate,
          priority,
          nextAction,
          reasonForPriority,
        });
        showToast('Lead updated in operations database.', 'success');
      } else {
        saved = await api.createLead({
          businessName,
          website,
          contactPerson,
          businessProblem,
          outreachStatus,
          lastActionDate,
          nextFollowUpDate,
          priority,
          nextAction,
          reasonForPriority,
        });
        showToast('New lead added to operations database.', 'success');
      }
      onSave(saved);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save lead.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialLead ? `Edit Lead: ${initialLead.businessName}` : 'Add New Operational Lead'}
      subtitle="Track pipeline status, scheduled follow-ups, and priority justifications."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
              placeholder="e.g. ClickUp"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Website URL *</label>
            <input
              type="url"
              required
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
              placeholder="https://clickup.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Person & Role *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
              placeholder="e.g. Matt Bauman, VP of Sales"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900 bg-white"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Outreach Status</label>
            <select
              value={outreachStatus}
              onChange={e => setOutreachStatus(e.target.value as OutreachStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900 bg-white"
            >
              <option value="Not Started">Not Started</option>
              <option value="Contacted">Contacted</option>
              <option value="Followed Up">Followed Up</option>
              <option value="Meeting Booked">Meeting Booked</option>
              <option value="Demo Attended">Demo Attended</option>
              <option value="Closed/Won">Closed / Won</option>
              <option value="Nurture/Paused">Nurture / Paused</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Last Action Date</label>
            <input
              type="date"
              value={lastActionDate}
              onChange={e => setLastActionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Follow-Up Date</label>
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={e => setNextFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Identified Business Problem</label>
          <input
            type="text"
            value={businessProblem}
            onChange={e => setBusinessProblem(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
            placeholder="e.g. Inbound demo decay when scheduled >48h out"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Next Concrete Action</label>
          <input
            type="text"
            value={nextAction}
            onChange={e => setNextAction(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
            placeholder="e.g. Send pre-meeting confirmation video & calendar safeguard"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Reason for Priority</label>
          <textarea
            rows={2}
            value={reasonForPriority}
            onChange={e => setReasonForPriority(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800 text-slate-900"
            placeholder="Why is this account prioritized? (e.g. high ACV, active booked meeting today, key strategic logo)"
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
            {initialLead ? 'Update Lead' : 'Save Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
