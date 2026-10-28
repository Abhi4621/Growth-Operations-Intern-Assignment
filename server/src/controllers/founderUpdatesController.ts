import { Request, Response } from 'express';
import { db } from '../services/db.js';

export const founderUpdatesController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.query;
    const updates = db.getFounderUpdates(candidateId as string | undefined);
    res.json(updates);
  },

  get: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const update = db.getFounderUpdateById(id);
    if (!update) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Founder update not found.' });
      return;
    }
    res.json(update);
  },

  save: async (req: Request, res: Response): Promise<void> => {
    const saved = db.saveFounderUpdate(req.body);
    res.json(saved);
  },
};
