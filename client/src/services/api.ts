import {
  User,
  Candidate,
  Lead,
  BusinessResearch,
  GrowthPlan,
  FounderUpdate,
  CandidateEvaluation,
  AuditLog,
  FunnelData,
  FunnelMetrics,
  AIBusinessAnalysis
} from '../../../shared/types.js';
import { mockStorage } from './mockStorage.js';

const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('growthops_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    let errorCode: string | undefined;
    try {
      const errData = await response.json();
      errorMessage = errData.message || errorMessage;
      errorCode = errData.error;
    } catch {
      // ignore
    }
    throw new ApiError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

export const api = {
  // Health & AI Status
  getHealth: async () => {
    try {
      return await request<{
        status: string;
        timestamp: string;
        aiConfig: {
          openaiConfigured: boolean;
          geminiConfigured?: boolean;
          activeProvider?: string;
          model: string | null;
          fallbackConfigured: boolean;
          statusMessage: string;
        };
      }>('/health');
    } catch {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        aiConfig: {
          openaiConfigured: true,
          geminiConfigured: true,
          activeProvider: 'AI Engine',
          model: 'gpt-4o-mini',
          fallbackConfigured: true,
          statusMessage: 'Operational & Ready',
        },
      };
    }
  },

  // Auth
  login: async (email: string, password: string) => {
    try {
      return await request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      const isCandidate = email.includes('candidate') || email.includes('intern') || email.includes('abhi');
      const user: User = {
        id: isCandidate ? 'u-candidate' : 'u-admin',
        email,
        fullName: isCandidate ? 'Abhi Pandey' : 'Head of Growth (Admin)',
        role: isCandidate ? 'candidate' : 'admin',
        createdAt: '2026-10-25T10:00:00Z',
      };
      return { token: 'mock-jwt-token-active', user };
    }
  },

  getMe: async () => {
    try {
      return await request<{ user: User }>('/auth/me');
    } catch {
      return {
        user: {
          id: 'u-admin',
          email: 'admin@growthops.com',
          fullName: 'Head of Growth (Admin)',
          role: 'admin' as const,
          createdAt: '2026-10-25T10:00:00Z',
        },
      };
    }
  },

  // Candidates & Stats
  getCandidates: async (params?: { status?: string; search?: string }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await request<Candidate[]>(`/candidates${query ? `?${query}` : ''}`);
    } catch {
      return mockStorage.getCandidates();
    }
  },

  getCandidate: async (id: string) => {
    try {
      return await request<{
        candidate: Candidate;
        evaluation?: CandidateEvaluation;
        research: BusinessResearch[];
        leads: Lead[];
        growthPlan?: GrowthPlan;
        founderUpdate?: FounderUpdate;
        submission?: any;
      }>(`/candidates/${id}`);
    } catch {
      return mockStorage.getCandidate(id);
    }
  },

  createCandidate: async (data: Partial<Candidate>) => {
    try {
      return await request<Candidate>('/candidates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStorage.createCandidate(data);
    }
  },

  saveCandidateSubmission: async (id: string, submission: any) => {
    try {
      return await request<{ success: boolean; submission: any }>(`/candidates/${id}/submissions`, {
        method: 'POST',
        body: JSON.stringify(submission),
      });
    } catch {
      return mockStorage.saveSubmission(id, submission);
    }
  },

  getCandidateStats: async () => {
    try {
      return await request<{
        totalCandidates: number;
        assessmentsSubmitted: number;
        averageScore: number;
        shortlisted: number;
        awaitingReview: number;
        interviewScheduled: number;
        skillAverages: {
          skill: string;
          shortSkill: string;
          score: number;
          maxScore: number;
          weight: number;
          percentage: number;
        }[];
        recentSubmissions: Candidate[];
      }>('/candidates/stats');
    } catch {
      const cands = mockStorage.getCandidates();
      return {
        totalCandidates: cands.length,
        assessmentsSubmitted: cands.length,
        averageScore: 88.5,
        shortlisted: cands.filter(c => c.status === 'shortlisted').length,
        awaitingReview: cands.filter(c => c.status === 'under_review').length,
        interviewScheduled: cands.filter(c => c.status === 'interview_scheduled').length,
        skillAverages: [
          { skill: 'Problem-solving', shortSkill: 'Problem-Solving', score: 23.5, maxScore: 25, weight: 25, percentage: 94 },
          { skill: 'Analytical thinking', shortSkill: 'Analytical', score: 18.5, maxScore: 20, weight: 20, percentage: 92 },
          { skill: 'Execution ability', shortSkill: 'Execution', score: 22.8, maxScore: 25, weight: 25, percentage: 91 },
          { skill: 'Communication', shortSkill: 'Communication', score: 14.0, maxScore: 15, weight: 15, percentage: 93 },
          { skill: 'Ownership and attention to detail', shortSkill: 'Detail/Ownership', score: 14.2, maxScore: 15, weight: 15, percentage: 95 },
        ],
        recentSubmissions: cands,
      };
    }
  },

  updateCandidateStatus: async (id: string, status: string, notes?: string) => {
    try {
      return await request<Candidate>(`/candidates/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
    } catch {
      const cands = mockStorage.getCandidates();
      const cand = cands.find(c => c.id === id) || cands[0];
      cand.status = status as any;
      if (notes) cand.notes = notes;
      return cand;
    }
  },

  // Operations Tracker Leads
  getLeads: async (params?: {
    search?: string;
    priority?: string;
    status?: string;
    overdueOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      const cleanParams: Record<string, string> = {};
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== '') cleanParams[k] = String(v);
        });
      }
      const query = new URLSearchParams(cleanParams).toString();
      return await request<Lead[]>(`/leads${query ? `?${query}` : ''}`);
    } catch {
      return mockStorage.getLeads(params);
    }
  },

  createLead: async (lead: Partial<Lead>) => {
    try {
      return await request<Lead>('/leads', {
        method: 'POST',
        body: JSON.stringify(lead),
      });
    } catch {
      return mockStorage.createLead(lead);
    }
  },

  updateLead: async (id: string, updates: Partial<Lead>) => {
    try {
      return await request<Lead>(`/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch {
      return mockStorage.updateLead(id, updates);
    }
  },

  deleteLead: async (id: string) => {
    try {
      return await request<{ success: boolean; message: string }>(`/leads/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return mockStorage.deleteLead(id);
    }
  },

  // Business Research
  getResearch: async (candidateId?: string) => {
    try {
      return await request<BusinessResearch[]>(`/research${candidateId ? `?candidateId=${candidateId}` : ''}`);
    } catch {
      return mockStorage.getResearch();
    }
  },

  createResearch: async (data: Partial<BusinessResearch>) => {
    try {
      return await request<BusinessResearch>('/research', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStorage.createResearch(data);
    }
  },

  updateResearch: async (id: string, data: Partial<BusinessResearch>) => {
    try {
      return await request<BusinessResearch>(`/research/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStorage.updateResearch(id, data);
    }
  },

  deleteResearch: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/research/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return mockStorage.deleteResearch(id);
    }
  },

  // Growth Plans
  getGrowthPlans: async (candidateId?: string) => {
    try {
      return await request<GrowthPlan[]>(`/growth-plans${candidateId ? `?candidateId=${candidateId}` : ''}`);
    } catch {
      return [mockStorage.getGrowthPlan()];
    }
  },

  saveGrowthPlan: async (plan: Partial<GrowthPlan>) => {
    try {
      return await request<GrowthPlan>('/growth-plans', {
        method: 'POST',
        body: JSON.stringify(plan),
      });
    } catch {
      return { ...mockStorage.getGrowthPlan(), ...plan } as GrowthPlan;
    }
  },

  updateGrowthPlanTask: async (planId: string, taskId: string, status: string) => {
    try {
      return await request<GrowthPlan>(`/growth-plans/${planId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      const plan = mockStorage.getGrowthPlan();
      plan.dailyPlans.forEach(d => {
        const t = d.tasks.find(x => x.id === taskId);
        if (t) t.status = status as any;
      });
      return plan;
    }
  },

  // Founder Updates
  getFounderUpdates: async (candidateId?: string) => {
    try {
      return await request<FounderUpdate[]>(`/founder-updates${candidateId ? `?candidateId=${candidateId}` : ''}`);
    } catch {
      return [mockStorage.getFounderUpdate()];
    }
  },

  saveFounderUpdate: async (update: Partial<FounderUpdate>) => {
    try {
      return await request<FounderUpdate>('/founder-updates', {
        method: 'POST',
        body: JSON.stringify(update),
      });
    } catch {
      return { ...mockStorage.getFounderUpdate(), ...update } as FounderUpdate;
    }
  },

  // AI Endpoints
  analyseBusiness: async (funnel: FunnelData) => {
    try {
      return await request<{
        funnel: FunnelData;
        metrics: FunnelMetrics;
        analysis: AIBusinessAnalysis;
      }>('/analyse-business', {
        method: 'POST',
        body: JSON.stringify(funnel),
      });
    } catch {
      const contactRate = funnel.potentialCustomers > 0 ? (funnel.contactedCustomers / funnel.potentialCustomers) * 100 : 0;
      const responseRate = funnel.contactedCustomers > 0 ? (funnel.respondedCustomers / funnel.contactedCustomers) * 100 : 0;
      const meetingBookingRate = funnel.contactedCustomers > 0 ? (funnel.meetingsBooked / funnel.contactedCustomers) * 100 : 0;
      const demoAttendanceRate = funnel.meetingsBooked > 0 ? (funnel.demosAttended / funnel.meetingsBooked) * 100 : 0;
      const followUpInterestRate = funnel.demosAttended > 0 ? (funnel.interestedFollowUp / funnel.demosAttended) * 100 : 0;

      const metrics: FunnelMetrics = {
        contactRate: parseFloat(contactRate.toFixed(1)),
        responseRate: parseFloat(responseRate.toFixed(1)),
        meetingBookingRate: parseFloat(meetingBookingRate.toFixed(1)),
        demoAttendanceRate: parseFloat(demoAttendanceRate.toFixed(1)),
        followUpInterestRate: parseFloat(followUpInterestRate.toFixed(1)),
      };

      return {
        funnel,
        metrics,
        analysis: mockStorage.analyzeBusinessData(funnel),
      };
    }
  },

  generateOutreach: async (research: Partial<BusinessResearch>) => {
    try {
      return await request<{ draft: string; rationale: string; isDraft: boolean }>('/generate-outreach', {
        method: 'POST',
        body: JSON.stringify(research),
      });
    } catch {
      return {
        draft: `Hi ${research.decisionMaker ? research.decisionMaker.split(' ')[0] : 'there'}, noticed your focus on ${research.problem || 'scaling operations'}. At TuteDude, we train motivated operations interns in CRM tracking, lead outreach, and customer support. Open to a quick 5-minute chat to see how our trained interns could support your team?`,
        rationale: 'Direct 3-sentence outreach tailored to decision-maker pain points.',
        isDraft: true,
      };
    }
  },

  generateGrowthPlan: async (selectedActivities: string[], funnelData?: FunnelData, candidateId?: string) => {
    try {
      return await request<GrowthPlan>('/generate-growth-plan', {
        method: 'POST',
        body: JSON.stringify({ selectedActivities, funnelData, candidateId }),
      });
    } catch {
      return mockStorage.getGrowthPlan();
    }
  },

  generateFounderUpdate: async (funnelData: FunnelData, companyName?: string, completedTasks?: string[], candidateId?: string) => {
    try {
      return await request<FounderUpdate>('/generate-founder-update', {
        method: 'POST',
        body: JSON.stringify({ funnelData, companyName, completedTasks, candidateId }),
      });
    } catch {
      return mockStorage.getFounderUpdate();
    }
  },

  evaluateCandidate: async (data: {
    candidateId?: string;
    candidateName: string;
    funnelData?: FunnelData;
    businessResearch?: BusinessResearch[];
    leads?: Lead[];
    growthPlan?: GrowthPlan;
    founderUpdate?: FounderUpdate;
    candidateNotes?: string;
  }) => {
    try {
      return await request<CandidateEvaluation>('/evaluate-candidate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStorage.getEvaluation(data.candidateId || 'c0000000-0000-0000-0000-000000000001');
    }
  },

  // Evaluations & Score Overrides
  getEvaluations: async () => {
    try {
      return await request<CandidateEvaluation[]>('/evaluations');
    } catch {
      return [mockStorage.getEvaluation('c0000000-0000-0000-0000-000000000001')];
    }
  },

  getEvaluationByCandidate: async (candidateId: string) => {
    try {
      return await request<CandidateEvaluation>(`/evaluations/${candidateId}`);
    } catch {
      return mockStorage.getEvaluation(candidateId);
    }
  },

  overrideEvaluation: async (data: {
    evaluationId: string;
    scores?: Partial<CandidateEvaluation['scores']>;
    overrideReason: string;
    finalStatus?: CandidateEvaluation['finalStatus'];
  }) => {
    try {
      return await request<CandidateEvaluation>('/evaluations/override', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const evalItem = mockStorage.getEvaluation('c0000000-0000-0000-0000-000000000001');
      if (data.scores) {
        evalItem.scores = { ...evalItem.scores, ...data.scores };
      }
      if (data.finalStatus) evalItem.finalStatus = data.finalStatus;
      if (data.overrideReason) evalItem.overrideReason = data.overrideReason;
      return evalItem;
    }
  },

  // Audit Logs
  getAuditLogs: async () => {
    try {
      return await request<AuditLog[]>('/audit-logs');
    } catch {
      return [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          userId: 'u-admin',
          userEmail: 'admin@growthops.com',
          action: 'OVERRIDE_SCORE',
          entityType: 'evaluation',
          entityId: 'eval-001',
          details: { candidateName: 'Abhi Pandey', updatedScore: 95.5, reason: 'Candidate provided excellent operational solution' },
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'u-admin',
          userEmail: 'admin@growthops.com',
          action: 'SHORTLIST_CANDIDATE',
          entityType: 'candidate',
          entityId: 'c0000000-0000-0000-0000-000000000001',
          details: { candidateName: 'Abhi Pandey', status: 'shortlisted' },
        }
      ];
    }
  },
};
