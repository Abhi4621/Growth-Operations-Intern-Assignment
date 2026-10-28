import { Request, Response } from 'express';
import { aiService, calculateFunnelMetrics } from '../services/aiService.js';
import { db } from '../services/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FunnelData } from '../types/index.js';

export const aiController = {
  analyseBusiness: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        potentialCustomers,
        contactedCustomers,
        respondedCustomers,
        meetingsBooked,
        demosAttended,
        interestedFollowUp,
      } = req.body;

      // Validate numeric inputs
      const funnel: FunnelData = {
        potentialCustomers: Number(potentialCustomers) || 0,
        contactedCustomers: Number(contactedCustomers) || 0,
        respondedCustomers: Number(respondedCustomers) || 0,
        meetingsBooked: Number(meetingsBooked) || 0,
        demosAttended: Number(demosAttended) || 0,
        interestedFollowUp: Number(interestedFollowUp) || 0,
      };

      if (funnel.potentialCustomers <= 0) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Potential customers must be greater than zero to calculate conversion funnel.',
        });
        return;
      }

      const metrics = calculateFunnelMetrics(funnel);
      const analysis = await aiService.analyseBusinessData(funnel);

      res.json({
        funnel,
        metrics,
        analysis,
      });
    } catch (err: any) {
      res.status(500).json({
        error: 'AI_ANALYSIS_FAILED',
        message: err.message || 'Failed to process business analysis.',
      });
    }
  },

  generateOutreach: async (req: Request, res: Response): Promise<void> => {
    try {
      const { businessName, website, industry, description, problem, decisionMaker, sourceUrls } = req.body;

      if (!businessName) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Business name is required for outreach personalization.' });
        return;
      }

      const result = await aiService.generateOutreachDraft({
        businessName,
        website,
        industry,
        description,
        problem,
        decisionMaker,
        sourceUrls,
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        error: 'OUTREACH_GEN_FAILED',
        message: err.message || 'Failed to generate personalised outreach draft.',
      });
    }
  },

  generateGrowthPlan: async (req: Request, res: Response): Promise<void> => {
    try {
      const { selectedActivities, funnelData } = req.body;

      if (!Array.isArray(selectedActivities) || selectedActivities.length === 0) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Please select exactly two growth activities to build the 5-day action plan.',
        });
        return;
      }

      const plan = await aiService.generateGrowthPlan(selectedActivities, funnelData);

      // Save plan if candidate or user is available
      if (req.body.candidateId) {
        plan.candidateId = req.body.candidateId;
        db.saveGrowthPlan(plan);
      }

      res.json(plan);
    } catch (err: any) {
      res.status(500).json({
        error: 'GROWTH_PLAN_FAILED',
        message: err.message || 'Failed to generate growth action plan.',
      });
    }
  },

  generateFounderUpdate: async (req: Request, res: Response): Promise<void> => {
    try {
      const { funnelData, companyName, completedTasks } = req.body;

      const funnel: FunnelData = {
        potentialCustomers: Number(funnelData?.potentialCustomers) || 100,
        contactedCustomers: Number(funnelData?.contactedCustomers) || 80,
        respondedCustomers: Number(funnelData?.respondedCustomers) || 20,
        meetingsBooked: Number(funnelData?.meetingsBooked) || 8,
        demosAttended: Number(funnelData?.demosAttended) || 3,
        interestedFollowUp: Number(funnelData?.interestedFollowUp) || 2,
      };

      const update = await aiService.generateFounderUpdate({
        funnelData: funnel,
        companyName: companyName || 'GrowthOps',
        completedTasks: Array.isArray(completedTasks) ? completedTasks : [],
      });

      if (req.body.candidateId) {
        update.candidateId = req.body.candidateId;
        db.saveFounderUpdate(update);
      }

      res.json(update);
    } catch (err: any) {
      res.status(500).json({
        error: 'FOUNDER_UPDATE_FAILED',
        message: err.message || 'Failed to generate founder update.',
      });
    }
  },

  evaluateCandidate: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        candidateId,
        candidateName,
        funnelData,
        businessResearch,
        leads,
        growthPlan,
        founderUpdate,
        candidateNotes,
      } = req.body;

      let finalResearch = businessResearch;
      let finalLeads = leads;
      let finalGrowthPlan = growthPlan;
      let finalFounderUpdate = founderUpdate;
      let finalFunnel = funnelData;

      if (candidateId) {
        if (!finalResearch || finalResearch.length === 0) {
          const r = db.getBusinessResearch(candidateId);
          finalResearch = r.length > 0 ? r : db.getBusinessResearch();
        }
        if (!finalLeads || finalLeads.length === 0) {
          const l = db.getLeads(candidateId);
          finalLeads = l.length > 0 ? l : db.getLeads();
        }
        if (!finalGrowthPlan) {
          const plans = db.getGrowthPlans(candidateId);
          finalGrowthPlan = plans.length > 0 ? plans[0] : (db.getGrowthPlans()[0] || null);
        }
        if (!finalFounderUpdate) {
          const updates = db.getFounderUpdates(candidateId);
          finalFounderUpdate = updates.length > 0 ? updates[0] : (db.getFounderUpdates()[0] || null);
        }
        if (!finalFunnel) {
          const sub = db.getSubmission(candidateId);
          finalFunnel = sub?.funnelData || {
            potentialCustomers: 100,
            contactedCustomers: 80,
            respondedCustomers: 20,
            meetingsBooked: 8,
            demosAttended: 3,
            interestedFollowUp: 2,
          };
        }
      }

      const evalResult = await aiService.evaluateCandidateSubmission({
        candidateName: candidateName || 'Candidate Submission',
        funnelData: finalFunnel,
        businessResearch: finalResearch,
        leads: finalLeads,
        growthPlan: finalGrowthPlan,
        founderUpdate: finalFounderUpdate,
        candidateNotes,
      });

      if (candidateId) {
        evalResult.candidateId = candidateId;
        const saved = db.saveEvaluation(evalResult);
        db.logAction(
          'AI_EVALUATE_CANDIDATE',
          'evaluation',
          saved.id,
          { candidateId, totalScore: saved.totalScore, recommendation: saved.suggestedRecommendation },
          req.user as any
        );
        res.json(saved);
        return;
      }

      res.json(evalResult);
    } catch (err: any) {
      res.status(500).json({
        error: 'EVALUATION_FAILED',
        message: err.message || 'Failed to evaluate candidate submission.',
      });
    }
  },
};
