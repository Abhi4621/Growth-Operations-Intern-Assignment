export type UserRole = 'admin' | 'candidate' | 'reviewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type CandidateStatus = 'under_review' | 'shortlisted' | 'interview_scheduled' | 'rejected';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  appliedDate: string;
  status: CandidateStatus;
  overallScore: number;
  resumeUrl?: string;
  experienceLevel?: string;
  notes?: string;
  createdAt: string;
}

export interface FunnelData {
  potentialCustomers: number;
  contactedCustomers: number;
  respondedCustomers: number;
  meetingsBooked: number;
  demosAttended: number;
  interestedFollowUp: number;
}

export interface FunnelMetrics {
  contactRate: number;        // contacted / potential * 100
  responseRate: number;       // responded / contacted * 100
  meetingBookingRate: number; // meetings / contacted * 100
  demoAttendanceRate: number; // demos / meetings * 100
  followUpInterestRate: number; // interested / demos * 100
}

export interface BottleneckAnalysis {
  stage: string;
  dropOffRate: number;
  impact: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface ImprovementRecommendation {
  id: number;
  title: string;
  stage: string;
  action: string;
  expectedImpact: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface PrioritySuggestion {
  stage: string;
  reason: string;
  timeframe: string;
}

export interface AIBusinessAnalysis {
  keyBottlenecks: BottleneckAnalysis[];
  dropOffCauses: string[];
  recommendations: ImprovementRecommendation[];
  suggestedPriorities: PrioritySuggestion[];
  additionalInformationNeeded: string[];
  rawSummary: string;
  isAIGenerated: boolean;
  generatedAt: string;
}

export type VerificationStatus = 'Verified with Sources' | 'Draft / Unverified' | 'Needs Review';

export interface BusinessResearch {
  id: string;
  candidateId?: string;
  businessName: string;
  website: string;
  industry: string;
  description: string;
  problem: string;
  decisionMaker: string;
  personalisedOutreach: string;
  sourceUrls: string[];
  verificationStatus: VerificationStatus;
  verifiedFacts?: string[];
  assumptions?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OutreachStatus =
  | 'Not Started'
  | 'Contacted'
  | 'Followed Up'
  | 'Meeting Booked'
  | 'Demo Attended'
  | 'Closed/Won'
  | 'Nurture/Paused';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface Lead {
  id: string;
  candidateId?: string;
  businessName: string;
  website: string;
  contactPerson: string;
  businessProblem: string;
  outreachStatus: OutreachStatus;
  lastActionDate: string;
  nextFollowUpDate: string;
  priority: PriorityLevel;
  nextAction: string;
  reasonForPriority: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthTask {
  id: string;
  activity: string;
  minutes: number;
  target: string;
  expectedOutcome: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface DailyGrowthPlan {
  day: number;
  dayName: string;
  tasks: GrowthTask[];
  totalMinutes: number;
  contingencyPlan: string;
}

export interface GrowthPlan {
  id: string;
  candidateId?: string;
  selectedActivities: string[];
  totalWeeklyMinutes: number;
  dailyPlans: DailyGrowthPlan[];
  createdAt: string;
}

export interface PerformanceMetric {
  metric: string;
  current: string;
  target: string;
}

export interface FounderUpdate {
  id: string;
  candidateId?: string;
  title: string;
  date: string;
  mainProblem: string;
  keyFindings: string[];
  actionsTaken: string[];
  nextWeekPriorities: string[];
  performanceMetrics: PerformanceMetric[];
  risksAndUncertainties: string[];
  recommendedNextSteps: string[];
  createdAt: string;
}

export interface SkillScores {
  problemSolving: number;      // Max 25
  analyticalThinking: number;  // Max 20
  executionAbility: number;    // Max 25
  communication: number;       // Max 15
  ownershipDetail: number;     // Max 15
}

export interface SkillEvidence {
  problemSolving: string;
  analyticalThinking: string;
  executionAbility: string;
  communication: string;
  ownershipDetail: string;
}

export type HiringRecommendation = 'Strong Hire' | 'Hire' | 'Needs Further Interview' | 'Do Not Hire';

export interface CandidateEvaluation {
  id: string;
  candidateId: string;
  candidateName?: string;
  scores: SkillScores;
  totalScore: number;          // Max 100
  evidence: SkillEvidence;
  strengths: string[];
  areasForImprovement: string[];
  followUpInterviewQuestions: string[];
  suggestedRecommendation: HiringRecommendation;
  isAIAdvisory: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  finalStatus?: 'Shortlist' | 'Move to Interview' | 'Hold' | 'Reject';
  evaluatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
}
