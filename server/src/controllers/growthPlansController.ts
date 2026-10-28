import { Request, Response } from 'express';
import { db } from '../services/db.js';

export const growthPlansController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.query;
    const plans = db.getGrowthPlans(candidateId as string | undefined);
    res.json(plans);
  },

  get: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const plan = db.getGrowthPlanById(id);
    if (!plan) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Growth plan not found.' });
      return;
    }
    res.json(plan);
  },

  save: async (req: Request, res: Response): Promise<void> => {
    const plan = db.saveGrowthPlan(req.body);
    res.json(plan);
  },

  updateTaskStatus: async (req: Request, res: Response): Promise<void> => {
    const { id, taskId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Not Started', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'BAD_REQUEST', message: `Invalid status: ${status}` });
      return;
    }

    const updated = db.updateGrowthPlanTask(id, taskId, status as any);
    if (!updated) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Growth plan or task not found.' });
      return;
    }

    res.json(updated);
  },
};
