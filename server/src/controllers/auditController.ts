import { Request, Response } from 'express';
import { db } from '../services/db.js';

export const auditController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const logs = db.getAuditLogs();
    res.json(logs);
  },
};
