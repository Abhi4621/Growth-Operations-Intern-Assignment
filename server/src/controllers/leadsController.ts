import { Request, Response } from 'express';
import { db } from '../services/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const leadsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { search, priority, status, overdueOnly, sortBy, sortOrder } = req.query;
    let leads = db.getLeads();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter by Priority
    if (priority && priority !== 'all') {
      leads = leads.filter(l => l.priority.toLowerCase() === (priority as string).toLowerCase());
    }

    // Filter by Status
    if (status && status !== 'all') {
      leads = leads.filter(l => l.outreachStatus.toLowerCase() === (status as string).toLowerCase());
    }

    // Filter by Overdue
    if (overdueOnly === 'true') {
      leads = leads.filter(l => l.nextFollowUpDate < todayStr && l.outreachStatus !== 'Closed/Won');
    }

    // Search filter
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      leads = leads.filter(l =>
        l.businessName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.businessProblem.toLowerCase().includes(q) ||
        l.nextAction.toLowerCase().includes(q) ||
        l.reasonForPriority.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'priority') {
      const priorityWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      leads.sort((a, b) => {
        const diff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        return sortOrder === 'asc' ? -diff : diff;
      });
    } else if (sortBy === 'nextFollowUpDate') {
      leads.sort((a, b) => {
        const diff = new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime();
        return sortOrder === 'desc' ? -diff : diff;
      });
    } else if (sortBy === 'businessName') {
      leads.sort((a, b) => {
        const diff = a.businessName.localeCompare(b.businessName);
        return sortOrder === 'desc' ? -diff : diff;
      });
    }

    res.json(leads);
  },

  get: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const lead = db.getLeadById(id);
    if (!lead) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Lead not found.' });
      return;
    }
    res.json(lead);
  },

  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {
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
      candidateId,
    } = req.body;

    if (!businessName || !contactPerson) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Business name and contact person are required.' });
      return;
    }

    const newLead = db.createLead({
      candidateId,
      businessName,
      website: website || 'https://example.com',
      contactPerson,
      businessProblem: businessProblem || 'Unspecified problem',
      outreachStatus: outreachStatus || 'Not Started',
      lastActionDate: lastActionDate || new Date().toISOString().split('T')[0],
      nextFollowUpDate: nextFollowUpDate || new Date().toISOString().split('T')[0],
      priority: priority || 'Medium',
      nextAction: nextAction || 'Initiate outreach',
      reasonForPriority: reasonForPriority || 'Standard qualification',
    });

    db.logAction('CREATE_LEAD', 'lead', newLead.id, { businessName: newLead.businessName, priority: newLead.priority }, req.user as any);

    res.status(201).json(newLead);
  },

  update: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.getLeadById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Lead not found.' });
      return;
    }

    const updated = db.updateLead(id, updates);
    db.logAction('UPDATE_LEAD', 'lead', id, { previous: existing, updated }, req.user as any);

    res.json(updated);
  },

  delete: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getLeadById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Lead not found.' });
      return;
    }

    db.deleteLead(id);
    db.logAction('DELETE_LEAD', 'lead', id, { businessName: existing.businessName }, req.user as any);

    res.json({ success: true, message: 'Lead deleted successfully.' });
  },
};
