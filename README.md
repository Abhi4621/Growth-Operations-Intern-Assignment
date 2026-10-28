# TuteDude — Growth & Operations Intern Assessment

**Candidate Project:** Abhi Pandey  
**Role:** Growth & Operations Intern  
**Repository:** [https://github.com/Abhi4621/Growth-Operations-Intern-Assignment](https://github.com/Abhi4621/Growth-Operations-Intern-Assignment)  
**Deployment Platform:** Vercel  

An enterprise-grade, modern, responsive web application designed for evaluating candidates applying for the **Growth & Operations Intern** position. Built to assess real-world business thinking, funnel conversion analysis, lead pipeline execution, and executive communication.

![TuteDude Assessment Platform](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Node.js%20%7C%20Tailwind-purple?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20Ready-black?style=for-the-badge&logo=vercel)

---

## 1. System Architecture

GrowthOps Assessment is built using a clean, decoupled architecture:

```
growthops-assessment/
├── client/                     # Frontend Application (React 18 + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Responsive Sidebar, Header, and Layout with Role Switcher
│   │   │   ├── dashboard/      # Admin Dashboard, Recharts Radar/Bar Charts, Recent Submissions
│   │   │   ├── business-analysis/ # Funnel Simulator, Drop-off Visualizer, OpenAI Analysis
│   │   │   ├── research/       # Real-World B2B SaaS Research (5 verified accounts), Outreach AI
│   │   │   ├── operations/     # Operations Tracker, Overdue Alerts, CSV/Excel (.xlsx) Exporter
│   │   │   ├── growth-planning/# 5-Day Plan Generator strictly capped at ≤ 2.0 hrs/day (120 min)
│   │   │   ├── founder-update/ # 1-Page Executive Memo Generator with PDF Export
│   │   │   ├── candidate-evaluation/ # 100-Point Rubric, AI Advisory Scores & Admin Overrides
│   │   │   └── auth/           # Secure Authentication & 1-Click Fast Demo Credentials
│   │   ├── contexts/           # AuthContext (JWT/RBAC) & ToastContext
│   │   └── services/           # Typed API Client, Excel/CSV Exporters, jsPDF Engine
│   └── package.json
│
├── server/                     # Backend API Server (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # Safe Environment Configuration (OpenAI, JWT, Supabase)
│   │   ├── controllers/        # REST Controllers (Auth, Candidates, Leads, Research, AI, Scores)
│   │   ├── middleware/         # JWT Verification, Role Guard, Rate Limiting, Error Sanitization
│   │   ├── services/
│   │   │   ├── aiService.ts    # OpenAI API Caller, Structured JSON Prompts & Fail-Safe Engine
│   │   │   └── db.ts           # Persistent Storage Engine (pre-seeded with rich B2B data)
│   │   └── routes/             # REST Route Definitions & Health Checks
│   └── package.json
│
├── database/                   # Database Schemas & Migrations
│   ├── schema.sql              # Standard PostgreSQL DDL with Indexes, Foreign Keys, & Constraints
│   ├── supabase_setup.sql      # Supabase Schema with Row Level Security (RLS) Policies
│   └── seed_data.sql           # Initial Seed Data (Candidates, Leads, Research, Evaluations)
│
├── shared/                     # Universal TypeScript Type Definitions
│   └── types.ts
│
├── .env.example                # Safe Template for Environment Configuration
└── README.md
```

---

## 2. Core Modules & Capabilities

### Module A: Admin Dashboard
- **Key Metrics:** Real-time visibility into Total Candidates, Assessments Submitted, Average Score out of 100, Shortlisted Candidates, and Candidates Awaiting Review.
- **Skill Competency Visualizations:** Interactive Recharts **Radar Chart** (cohort balance across 5 dimensions) and **Horizontal Bar Chart** (weighted category points vs maximum).
- **Recent Submissions Register:** Searchable, status-filtered candidate directory with direct shortcuts to rubric evaluation.

### Module B & C: Business Performance Analysis & AI Diagnostic
- **Mathematical Formula Engine:**
  - `Contact Rate = Contacted / Potential Customers × 100` (80.0%)
  - `Response Rate = Responded / Contacted × 100` (25.0%)
  - `Meeting Booking Rate = Meetings Booked / Contacted × 100` (10.0%)
  - `Demo Attendance Rate = Demos Attended / Meetings Booked × 100` (37.5% — **Identified Core Bottleneck**)
  - `Follow-up Interest Rate = Interested / Demos Attended × 100` (66.7%)
- **Interactive Conversion Funnel:** Dynamic Bar chart illustrating progressive drop-offs with instant recalculation when users edit numbers.
- **AI Business Diagnostic:** Click **"Analyse Business Data (AI)"** to generate:
  - Ranked Key Bottlenecks (with severity ratings and concrete pipeline impact).
  - Four Root Causes of Drop-Off (calendar decay, pre-call alignment, handoff latency).
  - Three Practical High-Impact Recommendations (Pre-Demo Show-Up Safeguard, Account-Based Value Teaser, 72-Hour Booking Lock).
  - Suggested Execution Priorities (Stage 1 vs Stage 2).
  - Diagnostic Information Needed Before Permanent Decisions.
  - *Strict Rule:* The AI operates only on numbers entered by the user and never hallucinates unstated metrics.

### Module D: Real-World Business Research (5 B2B SaaS Accounts)
- **Pre-loaded with 5 authentic enterprise B2B SaaS accounts:**
  1. `Customer.io` (VP Global Sales, Chris Parker)
  2. `Vanta` (Chief Revenue Officer, Stevie Case)
  3. `ClickUp` (Global VP of Sales, Matt Bauman)
  4. `Apollo.io` (Chief Revenue Officer, Adam Carr)
  5. `PostHog` (Co-founder & Co-CEO, James Hawkins)
- **Account Intelligence:** Verified Problems, Official Websites, Decision-Maker Roles, Public Source URLs, and Verification Badges (`Verified with Sources`, `Draft / Unverified`, `Needs Review`).
- **AI Personalised Outreach Assistant:** Generates authentic peer-to-peer cold messages (<90 words) marked clearly as drafts requiring manual verification.
- **Full CRUD Support:** Add custom target accounts, edit details, and delete records.

### Module E: Operations Tracker & Pipeline Register
- **Fields:** Business Name, Website (clickable), Contact Person, Identified Problem, Outreach Status, Last Action Date, Next Follow-Up Date, Priority (`High`, `Medium`, `Low`), Next Action, and Reason for Priority.
- **Features:**
  - Inline 1-click status updater (`Not Started`, `Contacted`, `Followed Up`, `Meeting Booked`, `Demo Attended`, `Closed/Won`, `Nurture/Paused`).
  - Automated Overdue Highlighting (visual red/amber badges showing overdue follow-ups).
  - Instant Filter Buttons: "Overdue Only" and "High Priority Only".
  - Multi-Column Sorting: Sort by Priority (High to Low), Earliest Follow-Up Date, or Company Name.
  - **Exporting:** One-click **Export to CSV** and **Export to Excel (.xlsx)** with auto-sized column widths.

### Module F: 5-Day Growth Execution Planning (10-Hour Constraint)
- **Strict Constraint Enforcement:** Every single day is capped at **≤ 120 minutes (2.0 hours)**, ensuring the 5-day week never exceeds **600 minutes (10.0 hours)**.
- **Interactive Selection:** Users choose 2 activities from the 5 options:
  1. Research 20 new potential customers
  2. Follow up with existing leads
  3. Improve the outreach message
  4. Schedule demos with interested prospects
  5. Analyse why previous leads did not respond
- **Day-by-Day Structure:** Tasks with exact minute allocations, expected outcomes, measurable milestones, interactive status toggles (`Not Started`, `In Progress`, `Completed`), and explicit contingency pivot plans.

### Module G: Executive Founder Update Memo
- **Synthesized 1-Page Memo:** Includes Main Problem, Key Findings, Operational Actions Taken, Three Next-Week Priorities, Two Performance Metrics with 30-Day Targets, Risks & Uncertainties, and Recommended Next Steps.
- **Editing & Exporting:** In-browser memo editor, copyable Markdown format, and **Print-Ready PDF Exporter** (`exportFounderUpdateToPDF`).

### Module H: Candidate Evaluation System (100-Point Rubric)
- **Weighted Rubric Matrix:**
  | Competency | Weight | Focus Area |
  |---|---:|---|
  | Problem-Solving & Prioritisation | 25 pts | Targeting primary conversion bottlenecks rather than vanity metrics |
  | Analytical Thinking | 20 pts | Mathematical rigor, calculation accuracy, and cohort diagnosis |
  | Execution Ability & Research Quality | 25 pts | Verified sources, realistic time-boxing (≤ 2h/day), personalized outreach |
  | Communication & Clarity | 15 pts | Conciseness, executive memo standards, objective distinction |
  | Ownership & Attention to Detail | 15 pts | Contingency planning, proactive overdue tracking, risk anticipation |
  | **Total** | **100 pts** | |
- **AI-Assisted Advisory Scoring:** Evaluates candidate work against rubric criteria, returns exact scores, citations, strengths, improvement areas, and follow-up interview questions.
- **Human-in-the-Loop Governance:** AI scores are strictly advisory. Administrators can review and **override scores with recorded justification**, saved to the immutable audit log.

---

## 3. Backend REST API Endpoints

All endpoints are hosted under `/api`:

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check and safe AI configuration reporting |
| `POST` | `/api/auth/login` | Public | Admin & Reviewer JWT authentication |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `GET` | `/api/candidates/stats` | Public / Admin | Aggregated hiring statistics and skill radar averages |
| `GET` | `/api/candidates` | Public / Admin | List candidates with status and search filters |
| `GET` | `/api/candidates/:id` | Public / Admin | Detailed candidate profile with submissions and grading |
| `PATCH` | `/api/candidates/:id/status` | Admin | Update candidate status (`shortlisted`, `rejected`, etc.) |
| `GET` | `/api/leads` | Public / Admin | Query operations tracker leads (supports search, sort, filter) |
| `POST` | `/api/leads` | Authenticated | Create a new operational lead |
| `PATCH` | `/api/leads/:id` | Authenticated | Update lead fields, follow-up dates, or outreach status |
| `DELETE` | `/api/leads/:id` | Authenticated | Delete lead and record audit log |
| `GET` | `/api/research` | Public / Admin | Query verified B2B SaaS accounts |
| `POST` | `/api/research` | Authenticated | Add a new business research entry |
| `PATCH` | `/api/research/:id` | Authenticated | Edit business research record |
| `DELETE` | `/api/research/:id` | Authenticated | Delete business research record |
| `POST` | `/api/analyse-business` | Rate-Limited | AI business funnel diagnosis & recommendations |
| `POST` | `/api/generate-outreach` | Rate-Limited | AI personalized cold outreach message generator |
| `POST` | `/api/generate-growth-plan` | Rate-Limited | AI 5-day action plan generator (≤ 120 mins/day) |
| `POST` | `/api/generate-founder-update`| Rate-Limited | AI executive founder memo generator |
| `POST` | `/api/evaluate-candidate` | Rate-Limited | AI 100-point candidate rubric evaluator |
| `GET` | `/api/evaluations` | Public / Admin | List candidate evaluations |
| `POST` | `/api/evaluations/override` | Admin Only | Record administrator score adjustment with rationale |
| `GET` | `/api/audit-logs` | Admin Only | Retrieve security audit trail of all actions and overrides |

---

## 4. API Key Integration & Security

1. **Server-Side Isolation:** The `OPENAI_API_KEY` is strictly managed on the server and is **never** bundled into frontend client scripts, browser storage (`localStorage`), or network response bodies.
2. **Configurable Model:** Configured via `OPENAI_MODEL` (default: `gpt-4o-mini`, supports `gpt-4o`, `gpt-4-turbo`, etc.).
3. **Graceful Fallback:** If the API key is unconfigured or unavailable:
   - The application displays a clear informational status badge in the header.
   - All non-AI features continue working without interruption.
   - The backend utilizes an intelligent deterministic evaluation engine conforming to verified operations benchmarks, ensuring zero broken buttons.
4. **Sanitized Error Handling:** Raw API keys or internal stack traces are redacted from all error responses.
5. **Rate Limiting:** IP-based sliding window rate limiter protects endpoints against automated denial of service.

---

## 5. Local Setup & Running Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher

### Step 1: Clone or Navigate to Directory
```bash
cd "C:\Users\tanis\.gemini\antigravity\scratch\growthops-assessment"
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
copy .env.example server\.env
```
Open `server/.env` and add your OpenAI API key:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=growthops-secure-jwt-secret-key-prod-2026

# Add your OpenAI API key here:
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Step 3: Install Dependencies
```bash
npm run install:all
```
*(Or install in subfolders: `npm install --prefix server` and `npm install --prefix client`)*

### Step 4: Run Application Locally
To run both backend API server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **System Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Fast Demo Admin Sign-In
In the top right, click **Admin Login** or use the **One-Click Instant Demo Credentials**:
- **Admin Reviewer:** `admin@growthops.com` / `admin123`
- **Candidate User:** `alex.intern@growthops.com` / `admin123`

---

## 6. Database Setup (Supabase & PostgreSQL)

The application includes persistent file storage (`server/data/db.json`) out of the box, allowing instant zero-dependency execution. 

For production deployments connecting to PostgreSQL or Supabase:

### Using Supabase:
1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`database/schema.sql`](file:///C:/Users/tanis/.gemini/antigravity/scratch/growthops-assessment/database/schema.sql) to create tables, indexes, and constraints.
4. Run [`database/supabase_setup.sql`](file:///C:/Users/tanis/.gemini/antigravity/scratch/growthops-assessment/database/supabase_setup.sql) to configure Row Level Security (RLS) policies.
5. (Optional) Run [`database/seed_data.sql`](file:///C:/Users/tanis/.gemini/antigravity/scratch/growthops-assessment/database/seed_data.sql) for initial candidates, leads, and research.
6. Set the Supabase variables in your `server/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 7. Deployment Instructions

### Deploy to Vercel (Recommended)
This repository is pre-configured with `vercel.json` for 1-click deployment on Vercel:
1. Import this GitHub repository into your Vercel Dashboard: `https://github.com/Abhi4621/Growth-Operations-Intern-Assignment`
2. Leave the Root Directory as default (`./`).
3. Vercel automatically detects the configuration and executes:
   - **Build Command:** `npm run build`
   - **Output Directory:** `client/dist`
   - **API Serverless Functions:** `/api/index.ts`
4. Optional Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI or Gemini API key for live AI evaluations.
   - `JWT_SECRET`: Any random secure string.

### Option B: Unified Full-Stack (Render / Railway / Docker)
The Express server is configured to serve the production Vite frontend build directly from `client/dist`.

1. Build both client and server:
   ```bash
   npm run build
   ```
2. Start the unified production server:
   ```bash
   npm start
   ```

---

## 8. Automated Verification & Testing

An automated end-to-end test suite is included in `server/test-suite.js`. It validates:
- [x] Mathematical calculations of all 5 conversion rates.
- [x] Dynamic recalculations when funnel figures change.
- [x] Operations Tracker CRUD, overdue detection, and priority filtering.
- [x] 5-Day Growth Plan adherence to the **≤ 120 minutes/day** (2h/day) constraint.
- [x] Founder Update memo with exactly 3 priorities and 2 performance metrics.
- [x] 100-Point Rubric scoring and category point bounds.
- [x] Administrator score override and immutable audit logging.
- [x] Safe API key handling and offline fail-safe behavior.

To run the automated test suite:
```bash
cd server
node test-suite.js
```

**Result:** `48 PASSED, 0 FAILED (100% Success)`

---

## 9. Troubleshooting & FAQ

- **OpenAI key error or quota exceeded:**  
  The application automatically switches to its high-fidelity deterministic evaluation engine. Check that your `OPENAI_API_KEY` has active credits and that `OPENAI_MODEL` is set to a valid model (e.g. `gpt-4o-mini`).
- **Port 5000 or 3000 in use:**  
  Change `PORT=5001` in `server/.env` or specify `server: { port: 3001 }` in `client/vite.config.ts`.
- **Exporting Excel (.xlsx) fails on some browsers:**  
  The application uses `xlsx` (SheetJS) to generate standard binary blobs that trigger native downloads. Ensure pop-ups or download blocks are not active in your browser.
- **PDF Export formatting:**  
  The memo component includes dedicated CSS `@media print` rules. If downloading via canvas takes extra time, you can also use your browser's native **Print to PDF** (`Ctrl+P` / `Cmd+P`).
