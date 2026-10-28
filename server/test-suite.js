// End-to-End Automated Verification Script for GrowthOps Assessment
// Tests all API endpoints, business logic formulas, rubric score validation, and error states.

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting GrowthOps Assessment Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health and Configuration Check
    console.log('1. Testing System Health & Safe AI Key Configuration...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds with 200 OK');
    assert(health.status === 'healthy', 'System status is healthy');
    assert(typeof health.aiConfig.openaiConfigured === 'boolean', 'Safe AI configuration reporting without exposing keys');
    assert(health.aiConfig.statusMessage.length > 0, 'User-friendly configuration message provided');

    // 2. Authentication & Protected Routes
    console.log('\n2. Testing Authentication & RBAC Governance...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@growthops.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Admin login with valid credentials succeeds');
    assert(Boolean(loginData.token), 'JWT token issued successfully');
    assert(loginData.user.role === 'admin', 'User has admin role');
    const adminToken = loginData.token;

    // Test invalid login
    const badLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@growthops.com', password: 'wrongpassword' })
    });
    assert(badLogin.status === 401, 'Unauthorized access rejected for wrong password');

    // 3. Candidate Statistics & 5 Core Competency Averages
    console.log('\n3. Testing Admin Dashboard & Competency Aggregates...');
    const statsRes = await fetch(`${BASE_URL}/candidates/stats`);
    const stats = await statsRes.json();
    assert(statsRes.status === 200, 'Stats endpoint responds with 200 OK');
    assert(stats.totalCandidates >= 5, 'Total candidates count is populated');
    assert(stats.averageScore > 0 && stats.averageScore <= 100, `Average score is valid (${stats.averageScore}/100)`);
    assert(stats.skillAverages.length === 5, 'Evaluates all 5 competencies required by prompt');
    
    // Check competency weights
    const weightsSum = stats.skillAverages.reduce((acc, s) => acc + s.weight, 0);
    assert(weightsSum === 100, `Competency weights sum exactly to 100 (Problem 25 + Analytical 20 + Execution 25 + Comm 15 + Ownership 15 = ${weightsSum})`);

    // 4. Business Performance Formulas & Analysis
    console.log('\n4. Testing Funnel Mathematical Calculations & AI Analysis...');
    const funnelPayload = {
      potentialCustomers: 100,
      contactedCustomers: 80,
      respondedCustomers: 20,
      meetingsBooked: 8,
      demosAttended: 3,
      interestedFollowUp: 2
    };

    const analysisRes = await fetch(`${BASE_URL}/analyse-business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(funnelPayload)
    });
    const analysisData = await analysisRes.json();
    assert(analysisRes.status === 200, 'Business analysis endpoint returned 200 OK');

    // Verify exact mathematical formulas required by prompt
    assert(analysisData.metrics.contactRate === 80.0, 'Contact rate = 80/100 * 100 = 80.0%');
    assert(analysisData.metrics.responseRate === 25.0, 'Response rate = 20/80 * 100 = 25.0%');
    assert(analysisData.metrics.meetingBookingRate === 10.0, 'Meeting booking rate = 8/80 * 100 = 10.0%');
    assert(analysisData.metrics.demoAttendanceRate === 37.5, 'Demo attendance rate = 3/8 * 100 = 37.5%');
    assert(analysisData.metrics.followUpInterestRate === 66.7, 'Follow-up interest rate = 2/3 * 100 = 66.7%');

    // Verify AI analysis structure
    const analysis = analysisData.analysis;
    assert(Array.isArray(analysis.keyBottlenecks) && analysis.keyBottlenecks.length > 0, 'Key bottlenecks identified');
    assert(analysis.recommendations.length >= 3, 'Three actionable improvements recommended');
    assert(analysis.dropOffCauses.length > 0, 'Drop-off causes diagnosed');
    assert(analysis.additionalInformationNeeded.length > 0, 'Diagnostic information needed highlighted');

    // 5. Operations Tracker: Leads CRUD & Filters
    console.log('\n5. Testing Operations Tracker Leads CRUD & Overdue Tracking...');
    // Create new lead
    const newLeadRes = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        businessName: 'Retool Test Account',
        website: 'https://retool.com',
        contactPerson: 'David Hsu, CEO',
        businessProblem: 'Internal tool demo ghosting',
        outreachStatus: 'Contacted',
        lastActionDate: '2026-10-26',
        nextFollowUpDate: '2026-10-27', // Overdue
        priority: 'High',
        nextAction: 'Send automated reminder test',
        reasonForPriority: 'Tier-1 developer platform'
      })
    });
    const createdLead = await newLeadRes.json();
    assert(newLeadRes.status === 201, 'New lead created in operations tracker');
    const leadId = createdLead.id;

    // Filter by priority
    const filterRes = await fetch(`${BASE_URL}/leads?priority=High`);
    const highLeads = await filterRes.json();
    assert(highLeads.every(l => l.priority === 'High'), 'Priority filter returns only High priority leads');

    // Filter by overdue
    const overdueRes = await fetch(`${BASE_URL}/leads?overdueOnly=true`);
    const overdueLeads = await overdueRes.json();
    assert(overdueLeads.length > 0, 'Overdue leads correctly identified by date');

    // Update lead status
    const patchRes = await fetch(`${BASE_URL}/leads/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ outreachStatus: 'Meeting Booked' })
    });
    const updatedLead = await patchRes.json();
    assert(updatedLead.outreachStatus === 'Meeting Booked', 'Lead status successfully updated');

    // Delete lead
    const delRes = await fetch(`${BASE_URL}/leads/${leadId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(delRes.status === 200, 'Lead deleted successfully');

    // 6. Growth Planning: 2 Hours/Day Constraint Check
    console.log('\n6. Testing 5-Day Growth Plan (≤ 2 Hours/Day Constraint)...');
    const planRes = await fetch(`${BASE_URL}/generate-growth-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedActivities: [
          'Follow up with existing leads',
          'Schedule demos with interested prospects'
        ]
      })
    });
    const plan = await planRes.json();
    assert(planRes.status === 200, 'Growth plan generated');
    assert(plan.dailyPlans.length === 5, 'Plan covers all 5 working days (Monday-Friday)');
    
    // Check time limits
    const maxDailyMins = Math.max(...plan.dailyPlans.map(d => d.totalMinutes));
    assert(maxDailyMins <= 120, `Daily time cap enforced: maximum day is ${maxDailyMins} mins (≤ 120 mins / 2.0 hrs)`);
    assert(plan.totalWeeklyMinutes <= 600, `Weekly time cap enforced: total is ${plan.totalWeeklyMinutes} mins (≤ 600 mins / 10.0 hrs)`);

    // 7. Founder Update Memo
    console.log('\n7. Testing Founder Update Memo Generation...');
    const memoRes = await fetch(`${BASE_URL}/generate-founder-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funnelData: funnelPayload,
        companyName: 'GrowthOps Test'
      })
    });
    const memo = await memoRes.json();
    assert(memoRes.status === 200, 'Founder memo generated');
    assert(memo.mainProblem.length > 0, 'Includes main bottleneck problem');
    assert(memo.nextWeekPriorities.length === 3, 'Includes exactly three next-week priorities');
    assert(memo.performanceMetrics.length === 2, 'Includes exactly two performance metrics');

    // 8. Candidate Evaluation & Score Override
    console.log('\n8. Testing Candidate Evaluation & Rubric Scores (Max 100)...');
    const evalRes = await fetch(`${BASE_URL}/evaluate-candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateName: 'Test Intern Candidate',
        funnelData: funnelPayload,
        candidateNotes: 'Calculated exact conversion metrics, scheduled 5 days under 2 hours daily.'
      })
    });
    const evaluation = await evalRes.json();
    assert(evalRes.status === 200, 'AI candidate evaluation completed');
    
    // Check score categories and weights
    const scores = evaluation.scores;
    assert(scores.problemSolving <= 25, `Problem solving score valid: ${scores.problemSolving}/25`);
    assert(scores.analyticalThinking <= 20, `Analytical thinking score valid: ${scores.analyticalThinking}/20`);
    assert(scores.executionAbility <= 25, `Execution ability score valid: ${scores.executionAbility}/25`);
    assert(scores.communication <= 15, `Communication score valid: ${scores.communication}/15`);
    assert(scores.ownershipDetail <= 15, `Ownership score valid: ${scores.ownershipDetail}/15`);
    
    const calculatedSum = scores.problemSolving + scores.analyticalThinking + scores.executionAbility + scores.communication + scores.ownershipDetail;
    assert(Math.abs(calculatedSum - evaluation.totalScore) < 0.1, `Scores correctly sum to total score: ${evaluation.totalScore} / 100`);
    assert(Boolean(evaluation.suggestedRecommendation), `Suggested hiring recommendation: ${evaluation.suggestedRecommendation}`);
    assert(evaluation.followUpInterviewQuestions.length >= 2, 'Follow-up interview authenticity questions provided');

    // 9. Score Override & Audit Logging
    console.log('\n9. Testing Score Override & Audit Logging...');
    const overrideRes = await fetch(`${BASE_URL}/evaluations/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        evaluationId: 'e0000000-0000-0000-0000-000000000001',
        scores: { problemSolving: 25.0, analyticalThinking: 20.0 },
        overrideReason: 'Demonstrated superior depth in live interview discussion.',
        finalStatus: 'Shortlist'
      })
    });
    const overrideData = await overrideRes.json();
    assert(overrideRes.status === 200, 'Admin score override recorded successfully');
    assert(overrideData.overrideReason.length > 0, 'Override reason recorded');

    // Verify audit log
    const auditRes = await fetch(`${BASE_URL}/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const logs = await auditRes.json();
    assert(logs.some(l => l.action === 'SCORE_OVERRIDE'), 'Audit log records SCORE_OVERRIDE event with details');

    // 10. Growth Plan DB Persistence & Task Toggling
    console.log('\n10. Testing Growth Plan DB Persistence & Task Status Toggle...');
    const savePlanRes = await fetch(`${BASE_URL}/growth-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(plan)
    });
    const savedPlan = await savePlanRes.json();
    assert(savePlanRes.status === 200, 'Growth plan saved to persistent storage');

    const firstTaskId = savedPlan.dailyPlans[0].tasks[0].id;
    const toggleTaskRes = await fetch(`${BASE_URL}/growth-plans/${savedPlan.id}/tasks/${firstTaskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    const toggledPlan = await toggleTaskRes.json();
    assert(toggleTaskRes.status === 200, 'Task status updated to Completed in DB');
    assert(toggledPlan.dailyPlans[0].tasks[0].status === 'Completed', 'Task status verified Completed');

    // 11. Founder Memo DB Persistence
    console.log('\n11. Testing Founder Memo DB Persistence...');
    const saveMemoRes = await fetch(`${BASE_URL}/founder-updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(memo)
    });
    const savedMemo = await saveMemoRes.json();
    assert(saveMemoRes.status === 200, 'Founder memo persisted to database');
    assert(savedMemo.title === memo.title, 'Persisted founder memo title matches');

    // 12. Candidate Registration & Submission Persistence
    console.log('\n12. Testing Candidate Registration & Submission Persistence...');
    const createCandidateRes = await fetch(`${BASE_URL}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Lee',
        email: 'jordan.lee@test.com',
        phone: '+1 (555) 999-8888',
        experienceLevel: 'B.S. Industrial Engineering'
      })
    });
    const newCandidate = await createCandidateRes.json();
    assert(createCandidateRes.status === 201, 'Candidate registration created successfully');

    const subRes = await fetch(`${BASE_URL}/candidates/${newCandidate.id}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funnelData: funnelPayload,
        metrics: analysisData.metrics,
        savedAt: new Date().toISOString()
      })
    });
    assert(subRes.status === 200, 'Candidate assessment submission saved');

    // 13. Candidate Status Update
    console.log('\n13. Testing Candidate Status Lifecycle Update...');
    const statusUpdateRes = await fetch(`${BASE_URL}/candidates/${newCandidate.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'shortlisted' })
    });
    const statusCandidate = await statusUpdateRes.json();
    assert(statusUpdateRes.status === 200, 'Candidate status updated to shortlisted');
    assert(statusCandidate.status === 'shortlisted', 'Candidate status verified in response');

    // 14. AI Personalized Outreach Message Generation
    console.log('\n14. Testing AI Personalized Outreach Message Generation...');
    const outreachRes = await fetch(`${BASE_URL}/generate-outreach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Figma',
        industry: 'Design Software',
        businessProblem: 'High demo drop-off rate on enterprise design system audits',
        decisionMaker: 'Dylan Field, CEO',
        tone: 'Consultative & concise'
      })
    });
    const outreachData = await outreachRes.json();
    assert(outreachRes.status === 200, 'Personalized outreach message generated');
    assert(typeof outreachData.draft === 'string' && outreachData.draft.length > 0, 'Outreach message draft generated');
    assert(typeof outreachData.rationale === 'string' && outreachData.rationale.length > 0, 'Personalization rationale generated');
    assert(outreachData.isDraft === true, 'Clearly flagged as draft requiring verification');

    console.log(`\n=======================================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=======================================================`);
    
    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
