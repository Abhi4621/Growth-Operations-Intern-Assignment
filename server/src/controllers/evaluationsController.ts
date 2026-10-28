import { Request, Response } from 'express';
import { db } from '../services/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const evaluationsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const evals = db.getEvaluations();
    res.json(evals);
  },

  getByCandidate: async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.params;
    const evaluation = db.getEvaluationByCandidateId(candidateId);
    if (!evaluation) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Evaluation not found for this candidate.' });
      return;
    }
    res.json(evaluation);
  },

  override: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { evaluationId, scores, overrideReason, finalStatus } = req.body;

    if (!evaluationId || !overrideReason) {
      res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'evaluationId and overrideReason are required to record an administrator score adjustment.',
      });
      return;
    }

    const overriddenBy = req.user?.fullName || req.user?.email || 'Administrator';
    const updated = db.overrideEvaluation(evaluationId, {
      scores,
      overrideReason,
      overriddenBy,
      finalStatus,
    });

    if (!updated) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Evaluation record not found.' });
      return;
    }

    db.logAction(
      'SCORE_OVERRIDE',
      'evaluation',
      evaluationId,
      {
        candidateId: updated.candidateId,
        newTotalScore: updated.totalScore,
        overrideReason,
        overriddenBy,
        finalStatus,
      },
      req.user as any
    );

    res.json(updated);
  },
};
