-- GrowthOps Assessment - Supabase Row Level Security (RLS) & Policies Setup
-- Execute this script in the Supabase SQL Editor

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Helper functions to check user roles from Supabase auth.jwt()
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role'),
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
    'candidate'
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
  SELECT auth.get_user_role() IN ('admin', 'reviewer');
$$ LANGUAGE sql STABLE;

-- 3. Users Table Policies
CREATE POLICY "Admins have full access to users"
ON users FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- 4. Candidates Table Policies
CREATE POLICY "Admins have full access to candidates"
ON candidates FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Candidates can view their own candidate record"
ON candidates FOR SELECT
USING (auth.uid() = id);

-- 5. Submissions Policies
CREATE POLICY "Admins have full access to submissions"
ON candidate_submissions FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Candidates can insert and view their own submissions"
ON candidate_submissions FOR ALL
USING (candidate_id = auth.uid())
WITH CHECK (candidate_id = auth.uid());

-- 6. Business Research Policies
CREATE POLICY "Admins have full access to business research"
ON business_research FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Candidates can manage their own business research"
ON business_research FOR ALL
USING (candidate_id = auth.uid() OR candidate_id IS NULL)
WITH CHECK (candidate_id = auth.uid() OR candidate_id IS NULL);

-- 7. Leads Table Policies (Operations Tracker)
CREATE POLICY "Admins have full access to leads"
ON leads FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Candidates can manage their assigned leads"
ON leads FOR ALL
USING (candidate_id = auth.uid() OR candidate_id IS NULL)
WITH CHECK (candidate_id = auth.uid() OR candidate_id IS NULL);

-- 8. Growth Plans Policies
CREATE POLICY "Admins have full access to growth plans"
ON growth_plans FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Candidates can manage their own growth plans"
ON growth_plans FOR ALL
USING (candidate_id = auth.uid() OR candidate_id IS NULL)
WITH CHECK (candidate_id = auth.uid() OR candidate_id IS NULL);

-- 9. Founder Updates Policies
CREATE POLICY "Admins have full access to founder updates"
ON founder_updates FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Candidates can manage their own founder updates"
ON founder_updates FOR ALL
USING (candidate_id = auth.uid() OR candidate_id IS NULL)
WITH CHECK (candidate_id = auth.uid() OR candidate_id IS NULL);

-- 10. Evaluations Policies (Private to Admins)
CREATE POLICY "Only admins and reviewers can access evaluations"
ON evaluations FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- 11. Audit Logs Policies (Admins read-only, server creates logs)
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
USING (auth.is_admin());

CREATE POLICY "Authenticated users and server can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- 12. Trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER set_timestamp_candidates
BEFORE UPDATE ON candidates
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER set_timestamp_leads
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
