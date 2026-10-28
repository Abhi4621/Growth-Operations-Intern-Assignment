import { Request, Response } from 'express';
import { db } from '../services/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const researchController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.query;
    const records = db.getBusinessResearch(candidateId as string | undefined);
    res.json(records);
  },

  get: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const record = db.getBusinessResearchById(id);
    if (!record) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Research record not found.' });
      return;
    }
    res.json(record);
  },

  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {
      businessName,
      website,
      industry,
      description,
      problem,
      decisionMaker,
      personalisedOutreach,
      sourceUrls,
      verificationStatus,
      verifiedFacts,
      assumptions,
      candidateId,
    } = req.body;

    if (!businessName || !website) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Business name and website are required.' });
      return;
    }

    const newRecord = db.createBusinessResearch({
      candidateId,
      businessName,
      website,
      industry: industry || 'B2B SaaS',
      description: description || '',
      problem: problem || '',
      decisionMaker: decisionMaker || '',
      personalisedOutreach: personalisedOutreach || '',
      sourceUrls: Array.isArray(sourceUrls) ? sourceUrls : sourceUrls ? [sourceUrls] : [],
      verificationStatus: verificationStatus || 'Draft / Unverified',
      verifiedFacts: Array.isArray(verifiedFacts) ? verifiedFacts : [],
      assumptions: Array.isArray(assumptions) ? assumptions : [],
    });

    db.logAction('CREATE_RESEARCH', 'business_research', newRecord.id, { businessName: newRecord.businessName }, req.user as any);

    res.status(201).json(newRecord);
  },

  update: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getBusinessResearchById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Research record not found.' });
      return;
    }

    const updated = db.updateBusinessResearch(id, req.body);
    db.logAction('UPDATE_RESEARCH', 'business_research', id, { businessName: existing.businessName }, req.user as any);

    res.json(updated);
  },

  delete: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getBusinessResearchById(id);
    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Research record not found.' });
      return;
    }

    db.deleteBusinessResearch(id);
    db.logAction('DELETE_RESEARCH', 'business_research', id, { businessName: existing.businessName }, req.user as any);

    res.json({ success: true, message: 'Research record deleted successfully.' });
  },
};
