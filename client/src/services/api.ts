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
  getHealth: () => request<{
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
  }>('/health'),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<{ user: User }>('/auth/me'),

  // Candidates & Stats
  getCandidates: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<Candidate[]>(`/candidates${query ? `?${query}` : ''}`);
  },
  getCandidate: (id: string) =>
    request<{
      candidate: Candidate;
      evaluation?: CandidateEvaluation;
      research: BusinessResearch[];
      leads: Lead[];
      growthPlan?: GrowthPlan;
      founderUpdate?: FounderUpdate;
      submission?: any;
    }>(`/candidates/${id}`),
  createCandidate: (data: Partial<Candidate>) =>
    request<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  saveCandidateSubmission: (id: string, submission: any) =>
    request<{ success: boolean; submission: any }>(`/candidates/${id}/submissions`, {
      method: 'POST',
      body: JSON.stringify(submission),
    }),
  getCandidateStats: () =>
    request<{
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
    }>('/candidates/stats'),
  updateCandidateStatus: (id: string, status: string, notes?: string) =>
    request<Candidate>(`/candidates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // Operations Tracker Leads
  getLeads: (params?: {
    search?: string;
    priority?: string;
    status?: string;
    overdueOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') cleanParams[k] = String(v);
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request<Lead[]>(`/leads${query ? `?${query}` : ''}`);
  },
  createLead: (lead: Partial<Lead>) =>
    request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    }),
  updateLead: (id: string, updates: Partial<Lead>) =>
    request<Lead>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteLead: (id: string) =>
    request<{ success: boolean; message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    }),

  // Business Research
  getResearch: (candidateId?: string) =>
    request<BusinessResearch[]>(`/research${candidateId ? `?candidateId=${candidateId}` : ''}`),
  createResearch: (data: Partial<BusinessResearch>) =>
    request<BusinessResearch>('/research', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateResearch: (id: string, data: Partial<BusinessResearch>) =>
    request<BusinessResearch>(`/research/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteResearch: (id: string) =>
    request<{ success: boolean }>(`/research/${id}`, {
      method: 'DELETE',
    }),

  // Growth Plans
  getGrowthPlans: (candidateId?: string) =>
    request<GrowthPlan[]>(`/growth-plans${candidateId ? `?candidateId=${candidateId}` : ''}`),
  saveGrowthPlan: (plan: Partial<GrowthPlan>) =>
    request<GrowthPlan>('/growth-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),
  updateGrowthPlanTask: (planId: string, taskId: string, status: string) =>
    request<GrowthPlan>(`/growth-plans/${planId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Founder Updates
  getFounderUpdates: (candidateId?: string) =>
    request<FounderUpdate[]>(`/founder-updates${candidateId ? `?candidateId=${candidateId}` : ''}`),
  saveFounderUpdate: (update: Partial<FounderUpdate>) =>
    request<FounderUpdate>('/founder-updates', {
      method: 'POST',
      body: JSON.stringify(update),
    }),

  // AI Endpoints
  analyseBusiness: (funnel: FunnelData) =>
    request<{
      funnel: FunnelData;
      metrics: FunnelMetrics;
      analysis: AIBusinessAnalysis;
    }>('/analyse-business', {
      method: 'POST',
      body: JSON.stringify(funnel),
    }),
  generateOutreach: (research: Partial<BusinessResearch>) =>
    request<{ draft: string; rationale: string; isDraft: boolean }>('/generate-outreach', {
      method: 'POST',
      body: JSON.stringify(research),
    }),
  generateGrowthPlan: (selectedActivities: string[], funnelData?: FunnelData, candidateId?: string) =>
    request<GrowthPlan>('/generate-growth-plan', {
      method: 'POST',
      body: JSON.stringify({ selectedActivities, funnelData, candidateId }),
    }),
  generateFounderUpdate: (funnelData: FunnelData, companyName?: string, completedTasks?: string[], candidateId?: string) =>
    request<FounderUpdate>('/generate-founder-update', {
      method: 'POST',
      body: JSON.stringify({ funnelData, companyName, completedTasks, candidateId }),
    }),
  evaluateCandidate: (data: {
    candidateId?: string;
    candidateName: string;
    funnelData?: FunnelData;
    businessResearch?: BusinessResearch[];
    leads?: Lead[];
    growthPlan?: GrowthPlan;
    founderUpdate?: FounderUpdate;
    candidateNotes?: string;
  }) =>
    request<CandidateEvaluation>('/evaluate-candidate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Evaluations & Score Overrides
  getEvaluations: () => request<CandidateEvaluation[]>('/evaluations'),
  getEvaluationByCandidate: (candidateId: string) =>
    request<CandidateEvaluation>(`/evaluations/${candidateId}`),
  overrideEvaluation: (data: {
    evaluationId: string;
    scores?: Partial<CandidateEvaluation['scores']>;
    overrideReason: string;
    finalStatus?: CandidateEvaluation['finalStatus'];
  }) =>
    request<CandidateEvaluation>('/evaluations/override', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Audit Logs
  getAuditLogs: () => request<AuditLog[]>('/audit-logs'),
};
