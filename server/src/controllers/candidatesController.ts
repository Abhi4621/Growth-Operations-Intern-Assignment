import { Request, Response } from 'express';
import { db } from '../services/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const candidatesController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const { status, search } = req.query;
    let candidates = db.getCandidates();

    if (status && status !== 'all') {
      candidates = candidates.filter(c => c.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      candidates = candidates.filter(
        c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    res.json(candidates);
  },

  get: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const candidate = db.getCandidateById(id);
    if (!candidate) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Candidate not found.' });
      return;
    }

    const evaluation = db.getEvaluationByCandidateId(id);
    const research = db.getBusinessResearch(id);
    const leads = db.getLeads(id);
    const plans = db.getGrowthPlans(id);
    const updates = db.getFounderUpdates(id);
    const submission = db.getSubmission(id);

    res.json({
      candidate,
      evaluation,
      research,
      leads,
      growthPlan: plans[0] || null,
      founderUpdate: updates[0] || null,
      submission,
    });
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const { name, email, phone, experienceLevel, notes, resumeUrl } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Name and email are required to register as candidate.' });
      return;
    }

    const candidate = db.createCandidate({
      name,
      email,
      phone,
      experienceLevel: experienceLevel || 'Intern Applicant',
      notes,
      resumeUrl,
      status: 'under_review',
    });

    db.logAction('REGISTER_CANDIDATE', 'candidate', candidate.id, { name: candidate.name, email: candidate.email });
    res.status(201).json(candidate);
  },

  saveSubmission: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const candidate = db.getCandidateById(id);
    if (!candidate) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Candidate not found.' });
      return;
    }

    const saved = db.saveSubmission(id, req.body);
    db.logAction('SAVE_SUBMISSION', 'candidate_submission', id, { candidateName: candidate.name });
    res.json({ success: true, submission: saved });
  },

  updateStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['under_review', 'shortlisted', 'interview_scheduled', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'BAD_REQUEST', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const currentCandidate = db.getCandidateById(id);
    if (!currentCandidate) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Candidate not found.' });
      return;
    }

    const prevStatus = currentCandidate.status;
    const updated = db.updateCandidate(id, {
      status,
      ...(notes !== undefined ? { notes } : {}),
    });

    db.logAction(
      'UPDATE_CANDIDATE_STATUS',
      'candidate',
      id,
      { candidateName: currentCandidate.name, previousStatus: prevStatus, newStatus: status, notes },
      req.user as any
    );

    res.json(updated);
  },

  getStats: async (req: Request, res: Response): Promise<void> => {
    const candidates = db.getCandidates();
    const evaluations = db.getEvaluations();

    const totalCandidates = candidates.length;
    const assessmentsSubmitted = candidates.filter(c => c.overallScore > 0).length;
    const scoredCandidates = candidates.filter(c => c.overallScore > 0);
    const averageScore = scoredCandidates.length > 0
      ? parseFloat((scoredCandidates.reduce((acc, c) => acc + c.overallScore, 0) / scoredCandidates.length).toFixed(1))
      : 0;

    const shortlisted = candidates.filter(c => c.status === 'shortlisted').length;
    const awaitingReview = candidates.filter(c => c.status === 'under_review').length;
    const interviewScheduled = candidates.filter(c => c.status === 'interview_scheduled').length;

    // Calculate skill averages from evaluations
    let problemSolvingSum = 0;
    let analyticalSum = 0;
    let executionSum = 0;
    let communicationSum = 0;
    let ownershipSum = 0;
    const evalCount = evaluations.length || 1;

    evaluations.forEach(e => {
      problemSolvingSum += e.scores.problemSolving;
      analyticalSum += e.scores.analyticalThinking;
      executionSum += e.scores.executionAbility;
      communicationSum += e.scores.communication;
      ownershipSum += e.scores.ownershipDetail;
    });

    const skillAverages = [
      {
        skill: 'Problem-solving & Prioritisation',
        shortSkill: 'Problem Solving',
        score: parseFloat((problemSolvingSum / evalCount).toFixed(1)),
        maxScore: 25,
        weight: 25,
        percentage: parseFloat(((problemSolvingSum / evalCount / 25) * 100).toFixed(1)),
      },
      {
        skill: 'Analytical Thinking',
        shortSkill: 'Analytical',
        score: parseFloat((analyticalSum / evalCount).toFixed(1)),
        maxScore: 20,
        weight: 20,
        percentage: parseFloat(((analyticalSum / evalCount / 20) * 100).toFixed(1)),
      },
      {
        skill: 'Execution Ability & Research',
        shortSkill: 'Execution',
        score: parseFloat((executionSum / evalCount).toFixed(1)),
        maxScore: 25,
        weight: 25,
        percentage: parseFloat(((executionSum / evalCount / 25) * 100).toFixed(1)),
      },
      {
        skill: 'Communication & Clarity',
        shortSkill: 'Communication',
        score: parseFloat((communicationSum / evalCount).toFixed(1)),
        maxScore: 15,
        weight: 15,
        percentage: parseFloat(((communicationSum / evalCount / 15) * 100).toFixed(1)),
      },
      {
        skill: 'Ownership & Attention to Detail',
        shortSkill: 'Ownership',
        score: parseFloat((ownershipSum / evalCount).toFixed(1)),
        maxScore: 15,
        weight: 15,
        percentage: parseFloat(((ownershipSum / evalCount / 15) * 100).toFixed(1)),
      },
    ];

    const recentSubmissions = candidates.slice(0, 5);

    res.json({
      totalCandidates,
      assessmentsSubmitted,
      averageScore,
      shortlisted,
      awaitingReview,
      interviewScheduled,
      skillAverages,
      recentSubmissions,
    });
  },
};
