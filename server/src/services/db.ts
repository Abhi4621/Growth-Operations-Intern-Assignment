import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Candidate,
  Lead,
  BusinessResearch,
  GrowthPlan,
  FounderUpdate,
  CandidateEvaluation,
  AuditLog,
  FunnelData
} from '../types/index.js';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> bcrypt hash
  candidates: Candidate[];
  submissions: Record<string, any>;
  businessResearch: BusinessResearch[];
  leads: Lead[];
  growthPlans: GrowthPlan[];
  founderUpdates: FounderUpdate[];
  evaluations: CandidateEvaluation[];
  auditLogs: AuditLog[];
}

const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless
  ? '/tmp'
  : (fs.existsSync(path.resolve(process.cwd(), 'data'))
      ? path.resolve(process.cwd(), 'data')
      : (fs.existsSync(path.resolve(process.cwd(), 'server/data'))
          ? path.resolve(process.cwd(), 'server/data')
          : path.resolve(process.cwd(), 'data')));
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDataDirectory() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      // In read-only environment, ignore
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error loading db.json, initializing fresh seed database', err);
      }
    }
    const repoDbFile = path.resolve(process.cwd(), 'server/data/db.json');
    if (fs.existsSync(repoDbFile)) {
      try {
        const raw = fs.readFileSync(repoDbFile, 'utf-8');
        const parsed = JSON.parse(raw);
        this.saveDatabase(parsed);
        return parsed;
      } catch (err) {}
    }
    const initialData = this.getSeedData();
    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDataDirectory();
      const content = JSON.stringify(dataToSave || this.data, null, 2);
      fs.writeFileSync(DB_FILE, content, 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  private getSeedData(): DatabaseSchema {
    const adminId = 'a0000000-0000-0000-0000-000000000001';
    const reviewerId = 'a0000000-0000-0000-0000-000000000002';
    const candidateUserId = 'a0000000-0000-0000-0000-000000000003';
    
    // Hash 'admin123'
    const passwordHash = bcrypt.hashSync('admin123', 10);

    const users: User[] = [
      {
        id: adminId,
        email: 'admin@growthops.com',
        fullName: 'Head of Growth (Admin)',
        role: 'admin',
        createdAt: '2026-10-20T09:00:00Z',
      },
      {
        id: reviewerId,
        email: 'sarah.ops@growthops.com',
        fullName: 'Sarah Jenkins (Ops Lead)',
        role: 'reviewer',
        createdAt: '2026-10-21T10:30:00Z',
      },
      {
        id: candidateUserId,
        email: 'abhi.intern@growthops.com',
        fullName: 'Abhi Pandey (Candidate)',
        role: 'candidate',
        createdAt: '2026-10-22T14:15:00Z',
      },
    ];

    const passwords: Record<string, string> = {
      [adminId]: passwordHash,
      [reviewerId]: passwordHash,
      [candidateUserId]: passwordHash,
    };

    const candidates: Candidate[] = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        name: 'Abhi Pandey',
        email: 'abhi.pandey@example.com',
        phone: '+1 (555) 234-5678',
        appliedDate: '2026-10-25',
        status: 'shortlisted',
        overallScore: 92.5,
        resumeUrl: 'https://example.com/resumes/abhi-pandey.pdf',
        experienceLevel: 'Final Year BSBA / CS Minor',
        notes: 'Identified demo attendance bottleneck as primary revenue leak; built concrete 60-sec video qualification safeguard.',
        createdAt: '2026-10-25T11:00:00Z',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+1 (555) 345-6789',
        appliedDate: '2026-10-26',
        status: 'interview_scheduled',
        overallScore: 88.0,
        resumeUrl: 'https://example.com/resumes/priya-sharma.pdf',
        experienceLevel: 'Growth Ops Fellow',
        notes: 'High analytical rigor; detailed calendar confirmation protocols and verified B2B account problems.',
        createdAt: '2026-10-26T14:20:00Z',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        name: 'Jordan Vance',
        email: 'jordan.vance@example.com',
        phone: '+1 (555) 456-7890',
        appliedDate: '2026-10-23',
        status: 'shortlisted',
        overallScore: 84.0,
        resumeUrl: 'https://example.com/resumes/jordan-vance.pdf',
        experienceLevel: 'Junior SDR',
        notes: 'Strong practical execution in operations tracker; well-thought-out 5-day contingency plan.',
        createdAt: '2026-10-23T16:00:00Z',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        name: 'Marcus Brody',
        email: 'marcus.brody@example.com',
        phone: '+1 (555) 567-8901',
        appliedDate: '2026-10-27',
        status: 'under_review',
        overallScore: 74.0,
        resumeUrl: 'https://example.com/resumes/marcus-brody.pdf',
        experienceLevel: 'Economics Undergrad',
        notes: 'Good funnel calculations, but outreach lacked decision-maker personalization.',
        createdAt: '2026-10-27T08:30:00Z',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+1 (555) 678-9012',
        appliedDate: '2026-10-24',
        status: 'under_review',
        overallScore: 79.5,
        resumeUrl: 'https://example.com/resumes/elena-rostova.pdf',
        experienceLevel: 'Marketing Associate',
        notes: 'Engaging founder update tone; exceeded daily 2-hour work constraint slightly.',
        createdAt: '2026-10-24T12:45:00Z',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000006',
        name: 'Taylor Reed',
        email: 'taylor.reed@example.com',
        phone: '+1 (555) 789-0123',
        appliedDate: '2026-10-27',
        status: 'under_review',
        overallScore: 68.0,
        resumeUrl: 'https://example.com/resumes/taylor-reed.pdf',
        experienceLevel: 'Business Analytics Student',
        notes: 'Submitted baseline metrics; research sources require manual URL verification.',
        createdAt: '2026-10-27T17:10:00Z',
      },
      {
        id: 'c0000000-0000-0000-0000-000000000007',
        name: 'Maya Lin',
        email: 'maya.lin@example.com',
        phone: '+1 (555) 890-1234',
        appliedDate: '2026-10-25',
        status: 'shortlisted',
        overallScore: 90.0,
        resumeUrl: 'https://example.com/resumes/maya-lin.pdf',
        experienceLevel: 'Product Ops Intern',
        notes: 'Top tier problem-solving and structured metrics dashboard; clear founder memo.',
        createdAt: '2026-10-25T19:00:00Z',
      },
    ];

    const businessResearch: BusinessResearch[] = [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Customer.io',
        website: 'https://customer.io',
        industry: 'B2B SaaS / Automated Messaging & Customer Data',
        description: 'Customer engagement and automated messaging platform for tech companies and modern product teams.',
        problem: 'High sales engineering capacity waste from mid-market demo no-shows during competitive evaluation against Braze/Iterable.',
        decisionMaker: 'Chris Parker, VP of Global Sales',
        personalisedOutreach: 'Hi Chris, saw Customer.io expanding its Data Pipelines integration. As sales velocity scales, how is your team handling demo show-up rates for mid-market technical evaluations? We built a lightweight pre-demo qualification workflow that lifts attendance from 38% to 78% by sending dynamic 60-sec architecture briefs. Worth a 5-min look?',
        sourceUrls: ['https://customer.io/about/', 'https://linkedin.com/in/chrisparker-sales'],
        verificationStatus: 'Verified with Sources',
        verifiedFacts: [
          'Recent push into Data Pipelines expansion',
          'VP Global Sales leading 40+ rep organization',
          'High ACV ($15k-$60k)'
        ],
        assumptions: ['Mid-market demo attendance fluctuates around 35-40%'],
        createdAt: '2026-10-25T12:00:00Z',
        updatedAt: '2026-10-25T12:00:00Z',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Vanta',
        website: 'https://vanta.com',
        industry: 'B2B SaaS / Automated Security & Compliance',
        description: 'Automated security and continuous compliance monitoring platform for SOC 2, ISO 27001, and HIPAA.',
        problem: 'Severe drop-off between demo booking and attendance among time-strapped CISOs and Heads of Engineering.',
        decisionMaker: 'Stevie Case, Chief Revenue Officer',
        personalisedOutreach: 'Hi Stevie, scaling Vanta\'s enterprise trust platform means AEs are pitching overburdened CISOs whose calendars shift hourly. We automated pre-demo verification loops that reduced compliance demo ghosting by 45% for fast-scaling B2B tech without adding rep friction. Happy to send over a 2-page case study if relevant?',
        sourceUrls: ['https://vanta.com/company', 'https://linkedin.com/in/steviecase'],
        verificationStatus: 'Verified with Sources',
        verifiedFacts: [
          'Stevie Case leads global revenue & GTM',
          'SOC 2 / ISO 27001 market leader',
          'Buyers are CISOs with extreme calendar congestion'
        ],
        assumptions: ['Outbound AE ghost rate peaks when meetings booked >3 days out'],
        createdAt: '2026-10-25T12:15:00Z',
        updatedAt: '2026-10-25T12:15:00Z',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'ClickUp',
        website: 'https://clickup.com',
        industry: 'B2B SaaS / Collaborative Work OS',
        description: 'All-in-one productivity and project management platform with AI-powered task workflows.',
        problem: 'Inbound demo decay: high volume of freemium accounts book enterprise migration demos but ghost when meetings are set >48h out.',
        decisionMaker: 'Matt Bauman, Global VP of Sales',
        personalisedOutreach: 'Hi Matt, huge fan of ClickUp 3.0. With thousands of teams upgrading from free tiers to Enterprise, how does ClickUp prevent the dreaded 48-hour inbound demo decay? We engineered an automated calendar confirmation and prep sequence that cuts no-shows by half. Open to a 3-minute async Loom walkthrough?',
        sourceUrls: ['https://clickup.com', 'https://linkedin.com/in/mattbauman-sales'],
        verificationStatus: 'Verified with Sources',
        verifiedFacts: [
          'Launched ClickUp 3.0 platform',
          'Freemium to enterprise upgrade motion is core focus',
          'Global sales team across US & EMEA'
        ],
        assumptions: ['High freemium sign-ups lead to lower intent demo bookings'],
        createdAt: '2026-10-25T12:30:00Z',
        updatedAt: '2026-10-25T12:30:00Z',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000004',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Apollo.io',
        website: 'https://apollo.io',
        industry: 'B2B SaaS / Sales Intelligence & GTM Acceleration',
        description: 'Comprehensive lead intelligence, sequencing, and sales execution platform.',
        problem: 'Outbound SDR-to-AE handoff friction leading to booked prospect ghosting before discovery calls.',
        decisionMaker: 'Adam Carr, Chief Revenue Officer',
        personalisedOutreach: 'Hi Adam, congrats on Apollo\'s explosive GTM trajectory. Even with stellar sequence automation, SDR-booked discovery calls often leak 30-50% between invite and Zoom. We plug into Apollo to automate pre-meeting prospect intent checks and calendar hold confirmations. Would you be open to comparing notes?',
        sourceUrls: ['https://apollo.io', 'https://linkedin.com/in/adamcarr-gtm'],
        verificationStatus: 'Verified with Sources',
        verifiedFacts: [
          'Unicorn GTM platform with massive SDR user base',
          'Adam Carr joined as CRO',
          'Internal dogfooding of sales tools'
        ],
        assumptions: ['High outbound volume creates handoff drop-offs'],
        createdAt: '2026-10-25T12:45:00Z',
        updatedAt: '2026-10-25T12:45:00Z',
      },
      {
        id: 'b0000000-0000-0000-0000-000000000005',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'PostHog',
        website: 'https://posthog.com',
        industry: 'B2B SaaS / Developer Product Analytics & DevTools',
        description: 'All-in-one developer platform for product analytics, session recording, feature flags, and A/B testing.',
        problem: 'Enterprise/VPC migration drop-off: developer leads book technical discussions but skip if they lack immediate transparent setup specs.',
        decisionMaker: 'James Hawkins, Co-founder & Co-CEO',
        personalisedOutreach: 'Hi James, love PostHog\'s radical transparency and developer-first culture. Noticed engineering teams transitioning to custom VPC deployments sometimes hesitate at the technical evaluation stage. We built a zero-BS, markdown-native pre-meeting architecture briefing tool that lets engineers review specs before jumping on a call. Thought you might find the approach interesting.',
        sourceUrls: ['https://posthog.com/handbook', 'https://github.com/posthog'],
        verificationStatus: 'Verified with Sources',
        verifiedFacts: [
          'James Hawkins Co-founder & CEO',
          'Public handbook and open-source pricing',
          'Developers hate generic sales calls'
        ],
        assumptions: ['VPC and Enterprise migrations require deep technical pre-reads'],
        createdAt: '2026-10-25T13:00:00Z',
        updatedAt: '2026-10-25T13:00:00Z',
      },
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgoStr = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const twoDaysLaterStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    const leads: Lead[] = [
      {
        id: 'l0000000-0000-0000-0000-000000000001',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'ClickUp',
        website: 'https://clickup.com',
        contactPerson: 'Matt Bauman, Global VP of Sales',
        businessProblem: 'Inbound demo decay: high volume of freemium accounts book enterprise migration demos but ghost when meetings are set >48h out.',
        outreachStatus: 'Meeting Booked',
        lastActionDate: yesterdayStr,
        nextFollowUpDate: todayStr,
        priority: 'High',
        nextAction: 'Deploy Pre-Demo Show-Up Safeguard: Send calendar agenda with 1-click reschedule options & 90-sec preview video.',
        reasonForPriority: 'Active meeting booked for today! Highest immediate revenue risk; converting this meeting preserves a potential $30k+ enterprise pilot.',
        createdAt: '2026-10-25T13:10:00Z',
        updatedAt: '2026-10-27T10:00:00Z',
      },
      {
        id: 'l0000000-0000-0000-0000-000000000002',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Customer.io',
        website: 'https://customer.io',
        contactPerson: 'Chris Parker, VP of Global Sales',
        businessProblem: 'High sales engineering capacity waste from mid-market demo no-shows during competitive evaluation against Braze/Iterable.',
        outreachStatus: 'Contacted',
        lastActionDate: twoDaysAgoStr,
        nextFollowUpDate: tomorrowStr,
        priority: 'High',
        nextAction: 'Send Value-Add Follow-Up #1: Share 60-sec interactive demo show-up rate benchmark tailored to messaging SaaS.',
        reasonForPriority: 'Tier-1 ICP; large sales org; high ACV ($15k-$60k); high cost per wasted sales engineer demo slot.',
        createdAt: '2026-10-25T13:15:00Z',
        updatedAt: '2026-10-26T11:00:00Z',
      },
      {
        id: 'l0000000-0000-0000-0000-000000000003',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Vanta',
        website: 'https://vanta.com',
        contactPerson: 'Stevie Case, Chief Revenue Officer',
        businessProblem: 'Severe drop-off between demo booking and attendance among time-strapped CISOs and Heads of Engineering.',
        outreachStatus: 'Followed Up',
        lastActionDate: twoDaysAgoStr,
        nextFollowUpDate: yesterdayStr, // OVERDUE!
        priority: 'High',
        nextAction: 'Send Multi-Channel LinkedIn InMail referencing recent enterprise compliance velocity benchmarks.',
        reasonForPriority: 'Overdue follow-up! Rapid enterprise expansion; aggressive GTM targets; CRO prioritizes AE pipeline conversion efficiency.',
        createdAt: '2026-10-25T13:20:00Z',
        updatedAt: '2026-10-25T15:00:00Z',
      },
      {
        id: 'l0000000-0000-0000-0000-000000000004',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Apollo.io',
        website: 'https://apollo.io',
        contactPerson: 'Adam Carr, Chief Revenue Officer',
        businessProblem: 'Outbound SDR-to-AE handoff friction leading to booked prospect ghosting before discovery calls.',
        outreachStatus: 'Contacted',
        lastActionDate: twoDaysAgoStr,
        nextFollowUpDate: twoDaysLaterStr,
        priority: 'Medium',
        nextAction: 'Send Follow-Up #2 with data snippet on SDR-to-AE pipeline conversion benchmarks.',
        reasonForPriority: 'Strong ICP and massive rep volume, but internal tooling density means sales cycle may require deeper RevOps integration proof.',
        createdAt: '2026-10-25T13:25:00Z',
        updatedAt: '2026-10-25T13:25:00Z',
      },
      {
        id: 'l0000000-0000-0000-0000-000000000005',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'PostHog',
        website: 'https://posthog.com',
        contactPerson: 'James Hawkins, Co-founder & Co-CEO',
        businessProblem: 'Enterprise/VPC migration drop-off: developer leads book technical discussions but skip if they lack immediate transparent setup specs.',
        outreachStatus: 'Contacted',
        lastActionDate: twoDaysAgoStr,
        nextFollowUpDate: twoDaysLaterStr,
        priority: 'Medium',
        nextAction: 'Monitor public GitHub discussion & send gentle email follow-up with open-source workflow integration repo.',
        reasonForPriority: 'Non-traditional sales motion (PLG/developer focus); high strategic value and brand prestige, but longer sales qualification cycle requiring technical nuance.',
        createdAt: '2026-10-25T13:30:00Z',
        updatedAt: '2026-10-25T13:30:00Z',
      },
      {
        id: 'l0000000-0000-0000-0000-000000000006',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Ramp',
        website: 'https://ramp.com',
        contactPerson: 'Colin Kennedy, Chief Business Officer',
        businessProblem: 'Finance team demo no-shows due to end-of-month accounting closes.',
        outreachStatus: 'Not Started',
        lastActionDate: twoDaysAgoStr,
        nextFollowUpDate: yesterdayStr, // OVERDUE!
        priority: 'High',
        nextAction: 'Execute initial cold email referencing automated spend governance sync.',
        reasonForPriority: 'High ACV fintech; overdue outreach task; executive calendar requires immediate touchpoint.',
        createdAt: '2026-10-26T09:00:00Z',
        updatedAt: '2026-10-26T09:00:00Z',
      },
      {
        id: 'l0000000-0000-0000-0000-000000000007',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Loom',
        website: 'https://loom.com',
        contactPerson: 'Nicole Herskowitz, VP Marketing',
        businessProblem: 'Asynchronous evaluation drop-offs after initial self-serve signup.',
        outreachStatus: 'Demo Attended',
        lastActionDate: yesterdayStr,
        nextFollowUpDate: tomorrowStr,
        priority: 'Medium',
        nextAction: 'Deliver customized 3-tier enterprise rollout proposal.',
        reasonForPriority: 'Already completed demo; active buyer intent; moving toward closing phase.',
        createdAt: '2026-10-26T10:15:00Z',
        updatedAt: '2026-10-27T16:00:00Z',
      },
      {
        id: 'l0000000-0000-0000-0000-000000000008',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        businessName: 'Linear',
        website: 'https://linear.app',
        contactPerson: 'Karri Saarinen, CEO & Co-founder',
        businessProblem: 'High-growth engineering teams outgrowing issue tracking without structured onboarding calls.',
        outreachStatus: 'Followed Up',
        lastActionDate: yesterdayStr,
        nextFollowUpDate: twoDaysLaterStr,
        priority: 'Low',
        nextAction: 'Send technical case study on keyboard-first issue workflow optimizations.',
        reasonForPriority: 'Product-led growth motion makes high-touch sales secondary; keep on low-frequency nurture.',
        createdAt: '2026-10-26T11:30:00Z',
        updatedAt: '2026-10-27T14:00:00Z',
      }
    ];

    const evaluations: CandidateEvaluation[] = [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        candidateId: 'c0000000-0000-0000-0000-000000000001',
        candidateName: 'Abhi Pandey',
        scores: {
          problemSolving: 24.0,     // Weight: 25
          analyticalThinking: 19.0, // Weight: 20
          executionAbility: 23.5,   // Weight: 25
          communication: 13.5,      // Weight: 15
          ownershipDetail: 12.5,    // Weight: 15
        },
        totalScore: 92.5,
        evidence: {
          problemSolving: 'Correctly pinpointed the 62.5% demo drop-off as the primary lever rather than top-of-funnel volume. Designed a pre-demo qualification brief.',
          analyticalThinking: 'Computed exact funnel metrics (Contact 80%, Response 25%, Meeting 10%, Demo attendance 37.5%, Follow-up 66.7%) without discrepancies.',
          executionAbility: 'Researched 5 verified B2B SaaS accounts with hyper-personalized outreach and concrete source URLs. Outlined a 120 min/day schedule.',
          communication: 'Crisp, structured executive memo format with clear next-week priorities and risk analysis.',
          ownershipDetail: 'Highlighted calendar decay and built an async Loom fallback protocol for prospective no-shows.'
        },
        strengths: [
          'Exceptional mathematical accuracy on conversion rates and drop-off levers',
          'Pinpointed demo attendance bottleneck as highest ROI lever for near-term revenue',
          'Disciplined 120 min/day growth execution schedule with daily contingency actions'
        ],
        areasForImprovement: [
          'Could quantify financial cost per lost demo in the executive summary',
          'Could expand on multi-channel follow-up cadence beyond email'
        ],
        followUpInterviewQuestions: [
          'How would you measure whether a 60-second video brief actually increases demo attendance vs. adding friction?',
          'If ClickUp ghosts on today\'s scheduled meeting, what is your exact 24-hour response protocol?'
        ],
        suggestedRecommendation: 'Strong Hire',
        isAIAdvisory: true,
        finalStatus: 'Shortlist',
        evaluatedAt: '2026-10-25T14:00:00Z',
      },
      {
        id: 'e0000000-0000-0000-0000-000000000002',
        candidateId: 'c0000000-0000-0000-0000-000000000002',
        candidateName: 'Priya Sharma',
        scores: {
          problemSolving: 22.0,
          analyticalThinking: 18.5,
          executionAbility: 22.0,
          communication: 13.0,
          ownershipDetail: 12.5,
        },
        totalScore: 88.0,
        evidence: {
          problemSolving: 'Selected Follow up with existing leads & Schedule demos with interested prospects to maximize near-term pipeline velocity within 10 hours.',
          analyticalThinking: 'Recognized 75% response drop-off but correctly prioritized meeting-to-demo attendance due to sunk SDR effort.',
          executionAbility: 'Researched authentic decision makers with verified LinkedIn profiles.',
          communication: 'Well-structured tables and crisp email copy.',
          ownershipDetail: 'Added proactive reminder tags on overdue leads.'
        },
        strengths: [
          'Rigorous lead qualification framework',
          'Accurate funnel calculations and clear metric labeling',
          'Disciplined time allocation under 2 hours daily'
        ],
        areasForImprovement: [
          'Founder memo could include more aggressive 90-day targets',
          'Outreach copy for developer-focused PostHog was slightly generic'
        ],
        followUpInterviewQuestions: [
          'Why did you choose follow-ups over net-new account research for your first 2 days?',
          'How would you differentiate an unverified assumption from a verified buyer problem?'
        ],
        suggestedRecommendation: 'Hire',
        isAIAdvisory: true,
        finalStatus: 'Move to Interview',
        evaluatedAt: '2026-10-26T16:00:00Z',
      }
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'audit-001',
        timestamp: '2026-10-25T14:05:00Z',
        userId: adminId,
        userEmail: 'admin@growthops.com',
        action: 'SHORTLIST_CANDIDATE',
        entityType: 'candidate',
        entityId: 'c0000000-0000-0000-0000-000000000001',
        details: { candidateName: 'Abhi Pandey', previousStatus: 'under_review', newStatus: 'shortlisted', overallScore: 92.5 }
      },
      {
        id: 'audit-002',
        timestamp: '2026-10-26T16:15:00Z',
        userId: reviewerId,
        userEmail: 'sarah.ops@growthops.com',
        action: 'SCHEDULE_INTERVIEW',
        entityType: 'candidate',
        entityId: 'c0000000-0000-0000-0000-000000000002',
        details: { candidateName: 'Priya Sharma', previousStatus: 'under_review', newStatus: 'interview_scheduled', overallScore: 88.0 }
      }
    ];

    return {
      users,
      passwords,
      candidates,
      submissions: {},
      businessResearch,
      leads,
      growthPlans: [],
      founderUpdates: [],
      evaluations,
      auditLogs,
    };
  }

  // User Operations
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public verifyPassword(userId: string, plainText: string): boolean {
    const hash = this.data.passwords[userId];
    if (!hash) return false;
    return bcrypt.compareSync(plainText, hash);
  }

  // Candidate Operations
  public getCandidates(): Candidate[] {
    return this.data.candidates;
  }

  public getCandidateById(id: string): Candidate | undefined {
    return this.data.candidates.find(c => c.id === id);
  }

  public createCandidate(candidateData: Partial<Candidate>): Candidate {
    const newCandidate: Candidate = {
      id: uuidv4(),
      name: candidateData.name || 'Anonymous Candidate',
      email: candidateData.email || `candidate-${Date.now()}@example.com`,
      phone: candidateData.phone || '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: candidateData.status || 'under_review',
      overallScore: candidateData.overallScore || 0,
      resumeUrl: candidateData.resumeUrl || '',
      experienceLevel: candidateData.experienceLevel || 'Intern Applicant',
      notes: candidateData.notes || '',
      createdAt: new Date().toISOString(),
    };
    this.data.candidates.unshift(newCandidate);
    this.saveDatabase();
    return newCandidate;
  }

  public updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
    const index = this.data.candidates.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.candidates[index] = { ...this.data.candidates[index], ...updates };
    this.saveDatabase();
    return this.data.candidates[index];
  }

  // Leads Operations
  public getLeads(candidateId?: string): Lead[] {
    if (candidateId) {
      return this.data.leads.filter(l => l.candidateId === candidateId || !l.candidateId);
    }
    return this.data.leads;
  }

  public getLeadById(id: string): Lead | undefined {
    return this.data.leads.find(l => l.id === id);
  }

  public createLead(leadData: Partial<Lead>): Lead {
    const newLead: Lead = {
      id: uuidv4(),
      candidateId: leadData.candidateId,
      businessName: leadData.businessName || 'Untitled Business',
      website: leadData.website || 'https://example.com',
      contactPerson: leadData.contactPerson || 'Decision Maker',
      businessProblem: leadData.businessProblem || 'Unspecified problem',
      outreachStatus: leadData.outreachStatus || 'Not Started',
      lastActionDate: leadData.lastActionDate || new Date().toISOString().split('T')[0],
      nextFollowUpDate: leadData.nextFollowUpDate || new Date().toISOString().split('T')[0],
      priority: leadData.priority || 'Medium',
      nextAction: leadData.nextAction || 'Initiate outreach',
      reasonForPriority: leadData.reasonForPriority || 'Standard qualification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.leads.unshift(newLead);
    this.saveDatabase();
    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const index = this.data.leads.findIndex(l => l.id === id);
    if (index === -1) return null;
    this.data.leads[index] = {
      ...this.data.leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.leads[index];
  }

  public deleteLead(id: string): boolean {
    const initialLen = this.data.leads.length;
    this.data.leads = this.data.leads.filter(l => l.id !== id);
    if (this.data.leads.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Business Research Operations
  public getBusinessResearch(candidateId?: string): BusinessResearch[] {
    if (candidateId) {
      return this.data.businessResearch.filter(b => b.candidateId === candidateId || !b.candidateId);
    }
    return this.data.businessResearch;
  }

  public getBusinessResearchById(id: string): BusinessResearch | undefined {
    return this.data.businessResearch.find(b => b.id === id);
  }

  public createBusinessResearch(item: Partial<BusinessResearch>): BusinessResearch {
    const newRecord: BusinessResearch = {
      id: uuidv4(),
      candidateId: item.candidateId,
      businessName: item.businessName || 'Untitled Company',
      website: item.website || 'https://example.com',
      industry: item.industry || 'Technology / B2B SaaS',
      description: item.description || '',
      problem: item.problem || '',
      decisionMaker: item.decisionMaker || '',
      personalisedOutreach: item.personalisedOutreach || '',
      sourceUrls: item.sourceUrls || [],
      verificationStatus: item.verificationStatus || 'Draft / Unverified',
      verifiedFacts: item.verifiedFacts || [],
      assumptions: item.assumptions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.businessResearch.unshift(newRecord);
    this.saveDatabase();
    return newRecord;
  }

  public updateBusinessResearch(id: string, updates: Partial<BusinessResearch>): BusinessResearch | null {
    const index = this.data.businessResearch.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.data.businessResearch[index] = {
      ...this.data.businessResearch[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.businessResearch[index];
  }

  public deleteBusinessResearch(id: string): boolean {
    const len = this.data.businessResearch.length;
    this.data.businessResearch = this.data.businessResearch.filter(b => b.id !== id);
    if (this.data.businessResearch.length !== len) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Growth Plans
  public getGrowthPlans(candidateId?: string): GrowthPlan[] {
    if (candidateId) {
      return this.data.growthPlans.filter(p => p.candidateId === candidateId || !p.candidateId);
    }
    return this.data.growthPlans;
  }

  public getGrowthPlanById(id: string): GrowthPlan | undefined {
    return this.data.growthPlans.find(p => p.id === id);
  }

  public saveGrowthPlan(plan: Partial<GrowthPlan>): GrowthPlan {
    const existingIndex = this.data.growthPlans.findIndex(p => p.id === plan.id || (plan.candidateId && p.candidateId === plan.candidateId));
    const savedPlan: GrowthPlan = {
      id: plan.id || uuidv4(),
      candidateId: plan.candidateId,
      selectedActivities: plan.selectedActivities || [],
      totalWeeklyMinutes: plan.totalWeeklyMinutes || 600,
      dailyPlans: plan.dailyPlans || [],
      createdAt: plan.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.growthPlans[existingIndex] = savedPlan;
    } else {
      this.data.growthPlans.unshift(savedPlan);
    }
    this.saveDatabase();
    return savedPlan;
  }

  public updateGrowthPlanTask(planId: string, taskId: string, status: 'Not Started' | 'In Progress' | 'Completed'): GrowthPlan | null {
    const plan = this.data.growthPlans.find(p => p.id === planId);
    if (!plan) return null;

    for (const day of plan.dailyPlans) {
      const task = day.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = status;
        this.saveDatabase();
        return plan;
      }
    }
    return null;
  }

  // Founder Updates
  public getFounderUpdates(candidateId?: string): FounderUpdate[] {
    if (candidateId) {
      return this.data.founderUpdates.filter(u => u.candidateId === candidateId || !u.candidateId);
    }
    return this.data.founderUpdates;
  }

  public getFounderUpdateById(id: string): FounderUpdate | undefined {
    return this.data.founderUpdates.find(u => u.id === id);
  }

  public saveFounderUpdate(update: Partial<FounderUpdate>): FounderUpdate {
    const existingIndex = this.data.founderUpdates.findIndex(u => u.id === update.id || (update.candidateId && u.candidateId === update.candidateId));
    const savedUpdate: FounderUpdate = {
      id: update.id || uuidv4(),
      candidateId: update.candidateId,
      title: update.title || 'Weekly Growth & Operations Executive Update',
      date: update.date || new Date().toISOString().split('T')[0],
      mainProblem: update.mainProblem || '',
      keyFindings: update.keyFindings || [],
      actionsTaken: update.actionsTaken || [],
      nextWeekPriorities: update.nextWeekPriorities || [],
      performanceMetrics: update.performanceMetrics || [],
      risksAndUncertainties: update.risksAndUncertainties || [],
      recommendedNextSteps: update.recommendedNextSteps || [],
      createdAt: update.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.founderUpdates[existingIndex] = savedUpdate;
    } else {
      this.data.founderUpdates.unshift(savedUpdate);
    }
    this.saveDatabase();
    return savedUpdate;
  }

  // Submissions
  public getSubmission(candidateId: string): any {
    return this.data.submissions[candidateId] || null;
  }

  public saveSubmission(candidateId: string, submissionData: any): any {
    this.data.submissions[candidateId] = {
      ...submissionData,
      submittedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.submissions[candidateId];
  }

  // Candidate Evaluations
  public getEvaluations(): CandidateEvaluation[] {
    return this.data.evaluations;
  }

  public getEvaluationByCandidateId(candidateId: string): CandidateEvaluation | undefined {
    return this.data.evaluations.find(e => e.candidateId === candidateId);
  }

  public saveEvaluation(evaluation: Partial<CandidateEvaluation>): CandidateEvaluation {
    const existingIndex = this.data.evaluations.findIndex(e => e.candidateId === evaluation.candidateId);
    const candidate = this.getCandidateById(evaluation.candidateId || '');

    const savedEval: CandidateEvaluation = {
      id: evaluation.id || uuidv4(),
      candidateId: evaluation.candidateId || '',
      candidateName: candidate?.name || evaluation.candidateName || 'Candidate',
      scores: evaluation.scores || {
        problemSolving: 0,
        analyticalThinking: 0,
        executionAbility: 0,
        communication: 0,
        ownershipDetail: 0,
      },
      totalScore: evaluation.totalScore || 0,
      evidence: evaluation.evidence || {
        problemSolving: '',
        analyticalThinking: '',
        executionAbility: '',
        communication: '',
        ownershipDetail: '',
      },
      strengths: evaluation.strengths || [],
      areasForImprovement: evaluation.areasForImprovement || [],
      followUpInterviewQuestions: evaluation.followUpInterviewQuestions || [],
      suggestedRecommendation: evaluation.suggestedRecommendation || 'Needs Further Interview',
      isAIAdvisory: evaluation.isAIAdvisory !== undefined ? evaluation.isAIAdvisory : true,
      overrideReason: evaluation.overrideReason,
      overriddenBy: evaluation.overriddenBy,
      finalStatus: evaluation.finalStatus,
      evaluatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.evaluations[existingIndex] = savedEval;
    } else {
      this.data.evaluations.unshift(savedEval);
    }

    // Also update candidate overall score
    if (candidate) {
      this.updateCandidate(candidate.id, { overallScore: savedEval.totalScore });
    }

    this.saveDatabase();
    return savedEval;
  }

  public overrideEvaluation(
    evaluationId: string,
    overrideData: {
      scores?: Partial<CandidateEvaluation['scores']>;
      overrideReason: string;
      overriddenBy: string;
      finalStatus?: CandidateEvaluation['finalStatus'];
    }
  ): CandidateEvaluation | null {
    const evalIndex = this.data.evaluations.findIndex(e => e.id === evaluationId);
    if (evalIndex === -1) return null;

    const currentEval = this.data.evaluations[evalIndex];
    const newScores = {
      ...currentEval.scores,
      ...(overrideData.scores || {}),
    };

    // Recalculate total score
    const totalScore = Math.min(
      100,
      parseFloat(
        (
          newScores.problemSolving +
          newScores.analyticalThinking +
          newScores.executionAbility +
          newScores.communication +
          newScores.ownershipDetail
        ).toFixed(2)
      )
    );

    const updated: CandidateEvaluation = {
      ...currentEval,
      scores: newScores,
      totalScore,
      overrideReason: overrideData.overrideReason,
      overriddenBy: overrideData.overriddenBy,
      finalStatus: overrideData.finalStatus || currentEval.finalStatus,
      evaluatedAt: new Date().toISOString(),
    };

    this.data.evaluations[evalIndex] = updated;

    // Update candidate score and status if specified
    const candidate = this.getCandidateById(updated.candidateId);
    if (candidate) {
      const candidateUpdates: Partial<Candidate> = { overallScore: totalScore };
      if (overrideData.finalStatus === 'Shortlist') candidateUpdates.status = 'shortlisted';
      else if (overrideData.finalStatus === 'Move to Interview') candidateUpdates.status = 'interview_scheduled';
      else if (overrideData.finalStatus === 'Reject') candidateUpdates.status = 'rejected';
      else if (overrideData.finalStatus === 'Hold') candidateUpdates.status = 'under_review';
      this.updateCandidate(candidate.id, candidateUpdates);
    }

    this.saveDatabase();
    return updated;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public logAction(action: string, entityType: string, entityId: string, details: Record<string, any>, user?: User): AuditLog {
    const newLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: user?.id,
      userEmail: user?.email,
      action,
      entityType,
      entityId,
      details,
    };
    this.data.auditLogs.unshift(newLog);
    this.saveDatabase();
    return newLog;
  }
}

export const db = new DatabaseService();
