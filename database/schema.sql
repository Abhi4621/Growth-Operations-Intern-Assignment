-- GrowthOps Assessment - PostgreSQL Schema
-- Production-Ready DDL with Constraints, Indexes, and Foreign Keys

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users and Roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'candidate', 'reviewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Candidates
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'shortlisted', 'interview_scheduled', 'rejected')),
    overall_score NUMERIC(5,2) DEFAULT 0.00 CHECK (overall_score >= 0 AND overall_score <= 100),
    resume_url TEXT,
    experience_level VARCHAR(50) DEFAULT 'Intern',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Candidate Submissions
CREATE TABLE IF NOT EXISTS candidate_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    funnel_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    business_analysis JSONB DEFAULT '{}'::jsonb,
    growth_plan JSONB DEFAULT '{}'::jsonb,
    founder_update JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Business Research Records
CREATE TABLE IF NOT EXISTS business_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
    business_name VARCHAR(200) NOT NULL,
    website TEXT NOT NULL,
    industry VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    problem TEXT NOT NULL,
    decision_maker VARCHAR(200) NOT NULL,
    personalised_outreach TEXT NOT NULL,
    source_urls TEXT[] NOT NULL DEFAULT '{}',
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Draft / Unverified' CHECK (verification_status IN ('Verified with Sources', 'Draft / Unverified', 'Needs Review')),
    verified_facts TEXT[] DEFAULT '{}',
    assumptions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Leads and Follow-ups (Operations Tracker)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
    business_name VARCHAR(200) NOT NULL,
    website TEXT NOT NULL,
    contact_person VARCHAR(200) NOT NULL,
    business_problem TEXT NOT NULL,
    outreach_status VARCHAR(50) NOT NULL DEFAULT 'Not Started' CHECK (outreach_status IN ('Not Started', 'Contacted', 'Followed Up', 'Meeting Booked', 'Demo Attended', 'Closed/Won', 'Nurture/Paused')),
    last_action_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_follow_up_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    next_action TEXT NOT NULL,
    reason_for_priority TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Growth Plans
CREATE TABLE IF NOT EXISTS growth_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    selected_activities TEXT[] NOT NULL,
    total_weekly_minutes INT NOT NULL DEFAULT 600 CHECK (total_weekly_minutes <= 600), -- max 2 hrs/day * 5 days = 10 hrs = 600 mins
    daily_plans JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Founder Updates
CREATE TABLE IF NOT EXISTS founder_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Weekly Growth & Operations Executive Update',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    main_problem TEXT NOT NULL,
    key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    actions_taken JSONB NOT NULL DEFAULT '[]'::jsonb,
    next_week_priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
    performance_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    risks_and_uncertainties JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Evaluation Scores (Candidate Evaluation System)
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    problem_solving_score NUMERIC(5,2) NOT NULL CHECK (problem_solving_score >= 0 AND problem_solving_score <= 25),
    analytical_score NUMERIC(5,2) NOT NULL CHECK (analytical_score >= 0 AND analytical_score <= 20),
    execution_score NUMERIC(5,2) NOT NULL CHECK (execution_score >= 0 AND execution_score <= 25),
    communication_score NUMERIC(5,2) NOT NULL CHECK (communication_score >= 0 AND communication_score <= 15),
    ownership_score NUMERIC(5,2) NOT NULL CHECK (ownership_score >= 0 AND ownership_score <= 15),
    total_score NUMERIC(5,2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    strengths TEXT[] NOT NULL DEFAULT '{}',
    areas_for_improvement TEXT[] NOT NULL DEFAULT '{}',
    follow_up_questions TEXT[] NOT NULL DEFAULT '{}',
    suggested_recommendation VARCHAR(50) NOT NULL CHECK (suggested_recommendation IN ('Strong Hire', 'Hire', 'Needs Further Interview', 'Do Not Hire')),
    is_ai_advisory BOOLEAN NOT NULL DEFAULT true,
    override_reason TEXT,
    overridden_by UUID REFERENCES users(id),
    final_status VARCHAR(50) CHECK (final_status IN ('Shortlist', 'Move to Interview', 'Hold', 'Reject')),
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_overall_score ON candidates(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(outreach_status);
CREATE INDEX IF NOT EXISTS idx_research_candidate ON business_research(candidate_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_candidate ON evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
