import {
  Candidate,
  Lead,
  BusinessResearch,
  GrowthPlan,
  FounderUpdate,
  CandidateEvaluation,
  FunnelData,
  AIBusinessAnalysis
} from '../../../shared/types.js';

const STORAGE_KEYS = {
  CANDIDATES: 'tutedude_candidates',
  LEADS: 'tutedude_leads',
  RESEARCH: 'tutedude_research',
  GROWTH_PLANS: 'tutedude_growth_plans',
  FOUNDER_UPDATES: 'tutedude_founder_updates',
  EVALUATIONS: 'tutedude_evaluations',
  SUBMISSIONS: 'tutedude_submissions',
};

const initialCandidates: Candidate[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Abhi Pandey',
    email: 'abhi.pandey@example.com',
    phone: '+91 98765 43210',
    appliedDate: '2026-10-25',
    status: 'shortlisted',
    overallScore: 92.5,
    resumeUrl: 'https://example.com/resumes/abhi-pandey.pdf',
    experienceLevel: 'Operations Intern Applicant',
    notes: 'Identified demo attendance leak; proposed WhatsApp reminder cadence and 2 real B2B account outreach messages.',
    createdAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98123 45678',
    appliedDate: '2026-10-24',
    status: 'interview_scheduled',
    overallScore: 88.0,
    resumeUrl: 'https://example.com/resumes/priya-sharma.pdf',
    experienceLevel: 'Undergraduate, Operations Minor',
    notes: 'Strong analytical skills in conversion rates; realistic 5-day intern schedule.',
    createdAt: '2026-10-24T09:30:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '+91 98234 56789',
    appliedDate: '2026-10-26',
    status: 'under_review',
    overallScore: 81.5,
    resumeUrl: 'https://example.com/resumes/rohan-verma.pdf',
    experienceLevel: 'Fresher / BBA Operations',
    notes: 'Practical outreach approach; clear understanding of lead follow-up cadences.',
    createdAt: '2026-10-26T14:20:00Z',
  }
];

const initialLeads: Lead[] = [
  {
    id: 'lead-001',
    businessName: 'Razorpay',
    website: 'https://razorpay.com',
    contactPerson: 'Harshil Mathur (CEO)',
    businessProblem: 'Managing high-volume merchant onboarding and support queries',
    outreachStatus: 'Followed Up',
    lastActionDate: '2026-10-25',
    nextFollowUpDate: '2026-10-29',
    priority: 'High',
    nextAction: 'Send WhatsApp reminder with short 2-minute overview video',
    reasonForPriority: 'Tier-1 fintech unicorn with active hiring for operations interns',
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 'lead-002',
    businessName: 'Urban Company',
    website: 'https://urbancompany.com',
    contactPerson: 'Abhiraj Singh Bhal (CEO)',
    businessProblem: 'Partner training operations and quality verification scaling',
    outreachStatus: 'Meeting Booked',
    lastActionDate: '2026-10-26',
    nextFollowUpDate: '2026-10-30',
    priority: 'High',
    nextAction: 'Send calendar invite and reminder message 2 hours prior',
    reasonForPriority: 'Demo booked; needs proactive reminder to ensure show-up',
    createdAt: '2026-10-26T10:00:00Z',
    updatedAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'lead-003',
    businessName: 'Swiggy',
    website: 'https://swiggy.com',
    contactPerson: 'Rohit Kapoor (CEO - Food Marketplace)',
    businessProblem: 'Restaurant partner onboarding coordination across Tier 2 cities',
    outreachStatus: 'Contacted',
    lastActionDate: '2026-10-27',
    nextFollowUpDate: '2026-10-31',
    priority: 'Medium',
    nextAction: 'Follow up on introductory email sent on Tuesday',
    reasonForPriority: 'Massive scale and proven appetite for operations support interns',
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 'lead-004',
    businessName: 'Meesho',
    website: 'https://meesho.com',
    contactPerson: 'Vidit Aatrey (Founder & CEO)',
    businessProblem: 'Supplier catalog moderation and delivery dispute resolution',
    outreachStatus: 'Contacted',
    lastActionDate: '2026-10-26',
    nextFollowUpDate: '2026-10-30',
    priority: 'High',
    nextAction: 'Share quick case study on how TuteDude interns handle seller queries',
    reasonForPriority: 'High seller growth requiring rapid operational bandwidth',
    createdAt: '2026-10-26T10:00:00Z',
    updatedAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'lead-005',
    businessName: 'Zerodha',
    website: 'https://zerodha.com',
    contactPerson: 'Nithin Kamath (Founder & CEO)',
    businessProblem: 'KYC documentation verification and support ticket triage',
    outreachStatus: 'Followed Up',
    lastActionDate: '2026-10-24',
    nextFollowUpDate: '2026-10-28',
    priority: 'Medium',
    nextAction: 'Send follow-up message on LinkedIn',
    reasonForPriority: 'Bootstrapped market leader with high standards for ops precision',
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
  }
];

const initialResearch: BusinessResearch[] = [
  {
    id: 'res-001',
    businessName: 'Razorpay',
    website: 'https://razorpay.com',
    industry: 'Fintech / Payments Infrastructure',
    description: 'Leading payment gateway and banking platform for startups and enterprises across India.',
    problem: 'Scaling merchant verification and day-to-day operations during peak festive payment volumes.',
    decisionMaker: 'Harshil Mathur (Co-Founder & CEO)',
    personalisedOutreach: 'Hi Harshil, loved your recent update on scaling customer operations. At TuteDude, we train motivated students in hands-on operations, CRM tracking, and customer support. Would you be open to a quick 5-minute chat to see how our trained interns could support your operations team this month?',
    sourceUrls: ['https://razorpay.com', 'https://linkedin.com/in/harshilmathur'],
    verificationStatus: 'Verified with Sources',
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 'res-002',
    businessName: 'Urban Company',
    website: 'https://urbancompany.com',
    industry: 'Home Services Marketplace',
    description: 'Asia-largest online platform connecting consumers with verified service professionals.',
    problem: 'Managing partner onboarding logistics and reducing call drop-offs for service bookings.',
    decisionMaker: 'Abhiraj Singh Bhal (Co-Founder & CEO)',
    personalisedOutreach: 'Hi Abhiraj, really admire how Urban Company manages partner quality at scale. We help fast-growing teams handle day-to-day lead follow-ups and partner coordination without adding overhead. Could I send over a quick 2-minute overview of how our interns assist operations teams?',
    sourceUrls: ['https://urbancompany.com', 'https://linkedin.com/in/abhiraj-bhal'],
    verificationStatus: 'Verified with Sources',
    createdAt: '2026-10-26T10:00:00Z',
    updatedAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'res-003',
    businessName: 'Swiggy',
    website: 'https://swiggy.com',
    industry: 'Food Delivery & Hyperlocal Logistics',
    description: 'Convenience platform offering on-demand food delivery, Instamart groceries, and dining reservations.',
    problem: 'Tracking merchant partner menus, price updates, and resolving catalog discrepancies quickly.',
    decisionMaker: 'Rohit Kapoor (CEO - Food Marketplace)',
    personalisedOutreach: 'Hi Rohit, great work expanding Instamart hubs. Our operations interns specialize in data auditing, partner coordination, and customer response triage. Would you be open to exploring how we can support your marketplace operations this quarter?',
    sourceUrls: ['https://swiggy.com', 'https://linkedin.com'],
    verificationStatus: 'Verified with Sources',
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  }
];

class MockStorageService {
  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const val = localStorage.getItem(key);
      if (!val) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(val);
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  getCandidates(): Candidate[] {
    return this.getItem<Candidate[]>(STORAGE_KEYS.CANDIDATES, initialCandidates);
  }

  getCandidate(id: string) {
    const list = this.getCandidates();
    const candidate = list.find(c => c.id === id) || list[0];
    return {
      candidate,
      evaluation: this.getEvaluation(id),
      research: this.getResearch(),
      leads: this.getLeads(),
      growthPlan: this.getGrowthPlan(),
      founderUpdate: this.getFounderUpdate(),
      submission: this.getSubmission(id),
    };
  }

  createCandidate(data: Partial<Candidate>): Candidate {
    const list = this.getCandidates();
    const newCand: Candidate = {
      id: 'c-' + Date.now(),
      name: data.name || 'Applicant',
      email: data.email || 'applicant@example.com',
      phone: data.phone || '+91 98765 43210',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'under_review',
      overallScore: 85.0,
      experienceLevel: data.experienceLevel || 'Operations Intern Candidate',
      createdAt: new Date().toISOString(),
      ...data,
    };
    list.unshift(newCand);
    this.setItem(STORAGE_KEYS.CANDIDATES, list);
    return newCand;
  }

  saveSubmission(candidateId: string, submissionData: any) {
    const all = this.getItem<Record<string, any>>(STORAGE_KEYS.SUBMISSIONS, {});
    all[candidateId] = submissionData;
    this.setItem(STORAGE_KEYS.SUBMISSIONS, all);
    return { success: true, submission: submissionData };
  }

  getSubmission(candidateId: string) {
    const all = this.getItem<Record<string, any>>(STORAGE_KEYS.SUBMISSIONS, {});
    return all[candidateId] || null;
  }

  getLeads(filter?: any): Lead[] {
    let list = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(l => l.businessName.toLowerCase().includes(q) || l.contactPerson.toLowerCase().includes(q));
    }
    if (filter?.priority && filter.priority !== 'all') {
      list = list.filter(l => l.priority.toLowerCase() === filter.priority.toLowerCase());
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(l => l.outreachStatus === filter.status);
    }
    return list;
  }

  createLead(data: Partial<Lead>): Lead {
    const list = this.getLeads();
    const newLead: Lead = {
      id: 'lead-' + Date.now(),
      businessName: data.businessName || 'New Company',
      website: data.website || 'https://example.com',
      contactPerson: data.contactPerson || 'Lead Person',
      businessProblem: data.businessProblem || 'Operational Scaling',
      outreachStatus: data.outreachStatus || 'Not Started',
      lastActionDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: data.nextFollowUpDate || new Date().toISOString().split('T')[0],
      priority: data.priority || 'Medium',
      nextAction: data.nextAction || 'Send intro message',
      reasonForPriority: data.reasonForPriority || 'Standard lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    list.unshift(newLead);
    this.setItem(STORAGE_KEYS.LEADS, list);
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead {
    const list = this.getLeads();
    const idx = list.findIndex(l => l.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.LEADS, list);
      return list[idx];
    }
    return { ...initialLeads[0], ...updates };
  }

  deleteLead(id: string) {
    const list = this.getLeads().filter(l => l.id !== id);
    this.setItem(STORAGE_KEYS.LEADS, list);
    return { success: true, message: 'Deleted' };
  }

  getResearch(): BusinessResearch[] {
    return this.getItem<BusinessResearch[]>(STORAGE_KEYS.RESEARCH, initialResearch);
  }

  createResearch(data: Partial<BusinessResearch>): BusinessResearch {
    const list = this.getResearch();
    const newRes: BusinessResearch = {
      id: 'res-' + Date.now(),
      businessName: data.businessName || 'Company',
      website: data.website || 'https://example.com',
      industry: data.industry || 'Technology',
      description: data.description || 'Business description',
      problem: data.problem || 'Operational bottleneck',
      decisionMaker: data.decisionMaker || 'Founder / Ops Lead',
      personalisedOutreach: data.personalisedOutreach || 'Hi, would love to connect.',
      sourceUrls: data.sourceUrls || ['https://example.com'],
      verificationStatus: data.verificationStatus || 'Verified with Sources',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    list.unshift(newRes);
    this.setItem(STORAGE_KEYS.RESEARCH, list);
    return newRes;
  }

  updateResearch(id: string, updates: Partial<BusinessResearch>): BusinessResearch {
    const list = this.getResearch();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.RESEARCH, list);
      return list[idx];
    }
    return { ...initialResearch[0], ...updates };
  }

  deleteResearch(id: string) {
    const list = this.getResearch().filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.RESEARCH, list);
    return { success: true };
  }

  getGrowthPlan(): GrowthPlan {
    return {
      id: 'plan-001',
      candidateId: 'c0000000-0000-0000-0000-000000000001',
      selectedActivities: [
        'Follow up with existing leads who did not reply',
        'Send reminders to people who booked calls'
      ],
      totalWeeklyMinutes: 600,
      createdAt: '2026-10-25T10:00:00Z',
      dailyPlans: [
        {
          day: 1,
          dayName: 'Monday',
          totalMinutes: 120,
          contingencyPlan: 'Buffer 15 mins for verification',
          tasks: [
            { id: 't1', activity: 'Search 15 new company leads on Google/LinkedIn', minutes: 120, target: '15 verified leads in sheet', expectedOutcome: 'Sheet populated', status: 'Completed' }
          ]
        },
        {
          day: 2,
          dayName: 'Tuesday',
          totalMinutes: 120,
          contingencyPlan: 'Draft templates in advance',
          tasks: [
            { id: 't2', activity: 'Send 15 introductory outreach emails', minutes: 120, target: '15 personalized emails sent', expectedOutcome: 'All dispatched', status: 'Completed' }
          ]
        },
        {
          day: 3,
          dayName: 'Wednesday',
          totalMinutes: 120,
          contingencyPlan: 'Re-prioritize unresponsive leads',
          tasks: [
            { id: 't3', activity: 'Follow up on leads from last week who have not replied', minutes: 120, target: '15 follow-up notes sent', expectedOutcome: 'Responses tracked', status: 'In Progress' }
          ]
        },
        {
          day: 4,
          dayName: 'Thursday',
          totalMinutes: 120,
          contingencyPlan: 'Send alternative slots if busy',
          tasks: [
            { id: 't4', activity: 'Send meeting links & WhatsApp reminders for tomorrow calls', minutes: 120, target: 'All booked leads confirmed', expectedOutcome: 'Attendance verified', status: 'Not Started' }
          ]
        },
        {
          day: 5,
          dayName: 'Friday',
          totalMinutes: 120,
          contingencyPlan: 'Submit update before 5 PM',
          tasks: [
            { id: 't5', activity: 'Clean CRM spreadsheet & draft Friday manager memo', minutes: 120, target: 'Weekly update sent to team lead', expectedOutcome: 'CRM up to date', status: 'Not Started' }
          ]
        }
      ]
    };
  }

  getFounderUpdate(): FounderUpdate {
    return {
      id: 'memo-001',
      candidateId: 'c0000000-0000-0000-0000-000000000001',
      title: 'TuteDude Operations — Weekly Executive Update',
      date: new Date().toISOString().split('T')[0],
      mainProblem: '5 out of 8 booked demo calls were missed because prospects forgot about the scheduled meeting time.',
      keyFindings: [
        'Outreach reply rate is healthy at 25% (20 replies from 80 contacts).',
        'Meeting booking conversion is steady at 10% (8 calls booked).',
        'The primary pipeline leakage occurs between booking and actual attendance (only 37.5% show-up rate).'
      ],
      actionsTaken: [
        'Instituted a WhatsApp and email confirmation template sent 2 hours before every scheduled meeting.',
        'Followed up with 15 older non-responsive leads and generated 3 fresh conversations.',
        'Added and verified 6 high-priority startup accounts in the operations tracker.'
      ],
      nextWeekPriorities: [
        'Call or message all booked prospects on the morning of their demo to confirm attendance.',
        'Follow up with the 2 prospects who attended and showed strong interest.',
        'Research and reach out to 20 new high-growth companies.'
      ],
      performanceMetrics: [
        { metric: 'Contact to Reply Rate', current: '25.0%', target: '30.0%' },
        { metric: 'Demo Attendance Rate', current: '37.5%', target: '75.0%' },
        { metric: 'Show-Up to Interest Rate', current: '66.7%', target: '65.0%' }
      ],
      risksAndUncertainties: [
        'Prospects with busy schedules may still miss calls without SMS/WhatsApp alerts.',
        'Manual follow-ups require disciplined 120-minute daily execution.'
      ],
      recommendedNextSteps: [
        'Integrate automated calendar reminder links directly into initial outreach.',
        'Track daily response rates in the operations spreadsheet.'
      ],
      createdAt: '2026-10-25T10:00:00Z',
    };
  }

  getEvaluation(candidateId: string): CandidateEvaluation {
    return {
      id: 'eval-001',
      candidateId,
      candidateName: 'Abhi Pandey',
      scores: {
        problemSolving: 24.0,
        analyticalThinking: 19.0,
        executionAbility: 23.5,
        communication: 14.5,
        ownershipDetail: 14.5,
      },
      totalScore: 95.5,
      evidence: {
        problemSolving: 'Pinpointed meeting show-up rate (37.5%) as the primary bottleneck.',
        analyticalThinking: 'Accurate percentage calculations across all 5 funnel metrics.',
        executionAbility: 'Strictly capped daily tasks at 120 minutes with concrete targets.',
        communication: 'Clear, concise 3-sentence outreach messages without fluff.',
        ownershipDetail: 'Included contingencies and pro-active calendar confirmation links.',
      },
      strengths: [
        'Pinpointed meeting show-up rate (37.5%) as the primary bottleneck.',
        'Proposed realistic 2-hour pre-call WhatsApp reminders.',
        'Researched verified B2B decision-makers with concise 3-sentence outreach messages.'
      ],
      areasForImprovement: [
        'Could define slightly stricter lead qualification criteria before booking calls.'
      ],
      followUpInterviewQuestions: [
        'How would you handle a prospect who reschedules their call multiple times?',
        'What CRM columns would you prioritize if tracking 100+ weekly leads?'
      ],
      suggestedRecommendation: 'Strong Hire',
      isAIAdvisory: true,
      finalStatus: 'Shortlist',
      evaluatedAt: new Date().toISOString(),
    };
  }

  analyzeBusinessData(funnel: FunnelData): AIBusinessAnalysis {
    return {
      keyBottlenecks: [
        {
          stage: 'Meeting Booking → Demo Attendance',
          dropOffRate: 62.5,
          impact: `Out of ${funnel.meetingsBooked} booked meetings, only ${funnel.demosAttended} attended (5 missed).`,
          severity: 'High',
        },
        {
          stage: 'Contacted → Responded',
          dropOffRate: 75.0,
          impact: `${funnel.contactedCustomers} people contacted resulted in ${funnel.respondedCustomers} replies.`,
          severity: 'Medium',
        }
      ],
      dropOffCauses: [
        'Prospects forget about the meeting because no reminder is sent prior to the call.',
        'Calendar invites missing direct meeting links (e.g. Google Meet link not attached).',
        'Generic outreach messages that lack personalized relevance to the decision-maker.'
      ],
      recommendations: [
        {
          id: 1,
          title: 'Pre-Call Reminder Cadence',
          stage: 'Demo Attendance',
          action: 'Send a WhatsApp / Email reminder 2 hours before the call with the meeting link',
          expectedImpact: 'Increases attendance rate from 37.5% to ~70-80% based on industry benchmarks.',
          effort: 'Low',
        },
        {
          id: 2,
          title: '24-Hour Confirmation Check',
          stage: 'Demo Attendance',
          action: 'Confirm meeting timing 24 hours in advance to allow easy rescheduling if prospect is busy',
          expectedImpact: 'Recovers 2-3 potential drop-offs every week.',
          effort: 'Low',
        },
        {
          id: 3,
          title: 'Tailored Outreach Hook',
          stage: 'Contacted to Reply',
          action: 'Personalize initial outreach message to decision-maker specific pain points',
          expectedImpact: 'Boosts response rate from 25% to >35%.',
          effort: 'Medium',
        }
      ],
      suggestedPriorities: [
        { stage: 'Attendance Safeguard', reason: 'Highest impact on immediate pipeline conversion', timeframe: 'Day 1' },
        { stage: 'Missed Call Recovery', reason: 'Re-engage prospects who already showed high intent', timeframe: 'Week 1' },
        { stage: 'Outreach Personalization', reason: 'Expand top of funnel quality', timeframe: 'Ongoing' }
      ],
      additionalInformationNeeded: [
        'What communication channel (WhatsApp or Email) do prospects check most frequently?',
        'What specific times of day have the highest demo attendance rates?'
      ],
      rawSummary: 'Primary bottleneck identified at Demo Attendance. Recommended pre-call reminders.',
      isAIGenerated: true,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const mockStorage = new MockStorageService();
