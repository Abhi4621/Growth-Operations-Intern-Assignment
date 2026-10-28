import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  FileText,
  Clock,
  Building2,
  Send,
  Save,
  Percent,
  Sparkles,
  Users,
  CheckCircle2
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar.js';

interface TakeHomeAssignmentModuleProps {
  onNavigate?: (tab: NavTab, candidateId?: string) => void;
}

export const TakeHomeAssignmentModule: React.FC<TakeHomeAssignmentModuleProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [candidateName, setCandidateName] = useState(user?.fullName || 'Abhi Pandey');
  const [candidateEmail, setCandidateEmail] = useState(user?.email || 'abhi.pandey@example.com');
  const [candidateId, setCandidateId] = useState('c0000000-0000-0000-0000-000000000001');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Funnel Diagnostic (Basic, clear intern questions)
  const [part1Bottleneck, setPart1Bottleneck] = useState(
    'Out of 8 people who booked a meeting, only 3 actually attended the call (5 people did not show up). The biggest problem is people booking calls and then forgetting or skipping them. Once people attend, 2 out of 3 are interested.'
  );
  const [part1Fix1, setPart1Fix1] = useState(
    'Send a friendly WhatsApp or email reminder 2 hours before the call with the meeting link.'
  );
  const [part1Fix2, setPart1Fix2] = useState(
    'Message them 1 day before to confirm if the timing still works or if they need to pick another slot.'
  );

  // 2. Real Accounts (2 real, everyday relatable companies)
  const [accounts, setAccounts] = useState([
    {
      companyName: 'Razorpay',
      website: 'https://razorpay.com',
      decisionMaker: 'Harshil Mathur (Co-Founder & CEO)',
      decisionMakerUrl: 'https://www.linkedin.com/in/harshilmathur',
      signalUrl: 'https://razorpay.com/careers',
      outreachMessage:
        'Hi Harshil, loved your recent update on scaling customer operations. At TuteDude, we train motivated students in hands-on operations, CRM tracking, and customer support. Would you be open to a quick 5-minute chat to see how our trained interns could support your operations team this month?',
    },
    {
      companyName: 'Urban Company',
      website: 'https://www.urbancompany.com',
      decisionMaker: 'Abhiraj Singh Bhal (Co-Founder & CEO)',
      decisionMakerUrl: 'https://www.linkedin.com/in/abhiraj-bhal',
      signalUrl: 'https://www.urbancompany.com/blog',
      outreachMessage:
        'Hi Abhiraj, really admire how Urban Company manages partner quality at scale. We help fast-growing teams handle day-to-day lead follow-ups and partner coordination without adding overhead. Could I send over a quick 2-minute overview of how our interns assist operations teams?',
    },
  ]);

  // 3. 5-Day Plan (Simple daily intern schedule, <= 120 min/day)
  const [selectedInitiatives, setSelectedInitiatives] = useState<string[]>([
    'Follow up with existing leads who did not reply',
    'Send reminders to people who booked calls',
  ]);

  const [dailyPlan, setDailyPlan] = useState([
    { day: 'Monday', task: 'Search for 15 new company leads on Google/LinkedIn and collect email addresses', minutes: 120, target: '15 new leads added to spreadsheet' },
    { day: 'Tuesday', task: 'Send 15 personalized introductory emails to the leads collected yesterday', minutes: 120, target: '15 emails sent' },
    { day: 'Wednesday', task: 'Follow up with leads from last week who have not replied yet', minutes: 120, target: '15 follow-ups completed' },
    { day: 'Thursday', task: 'Send reminder messages and meeting links to all calls booked for Friday/Monday', minutes: 120, target: 'Reminders sent to all booked calls' },
    { day: 'Friday', task: 'Update lead statuses in the sheet, check what worked, and write weekly update for manager', minutes: 120, target: 'Spreadsheet updated & weekly summary sent' },
  ]);

  // 4. Team Update (Simple, practical weekly summary)
  const [founderMemo, setFounderMemo] = useState({
    mainProblem: '5 out of 8 booked calls were missed because prospects forgot about the meeting.',
    actionsTaken: [
      'Created a simple WhatsApp reminder template sent 2 hours before every call.',
      'Followed up with 15 older leads and got 3 new replies.',
      'Researched and added 15 verified new company contacts to the tracker.',
    ],
    nextWeekPriorities: [
      'Call or WhatsApp all booked prospects the morning of their call to confirm attendance.',
      'Follow up with the 2 prospects who attended calls and showed interest.',
      'Find and reach out to 20 new companies next week.',
    ],
  });

  // Calculate total minutes & validation
  const totalWeeklyMinutes = useMemo(() => {
    return dailyPlan.reduce((acc, d) => acc + (Number(d.minutes) || 0), 0);
  }, [dailyPlan]);

  const hasDailyOvercap = useMemo(() => {
    return dailyPlan.some(d => (Number(d.minutes) || 0) > 120);
  }, [dailyPlan]);

  const wordCount = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  // Load existing submission if present
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const id = user?.role === 'candidate' ? (user.id.startsWith('c') ? user.id : candidateId) : candidateId;
        const res = await api.getCandidate(id);
        if (res.candidate) {
          setCandidateName(res.candidate.name);
          setCandidateEmail(res.candidate.email);
        }
        if (res.submission?.assignmentData) {
          const sub = res.submission.assignmentData;
          if (sub.part1Bottleneck) setPart1Bottleneck(sub.part1Bottleneck);
          if (sub.part1Fix1) setPart1Fix1(sub.part1Fix1);
          if (sub.part1Fix2) setPart1Fix2(sub.part1Fix2);
          if (sub.accounts) setAccounts(sub.accounts);
          if (sub.dailyPlan) setDailyPlan(sub.dailyPlan);
          if (sub.selectedInitiatives) setSelectedInitiatives(sub.selectedInitiatives);
          if (sub.founderMemo) setFounderMemo(sub.founderMemo);
          setIsSubmitted(true);
        }
      } catch {
        // default state
      }
    };
    loadSaved();
  }, [user]);

  const handleSaveDraft = async () => {
    try {
      const payload = {
        candidateName,
        candidateEmail,
        assignmentData: {
          part1Bottleneck,
          part1Fix1,
          part1Fix2,
          accounts,
          dailyPlan,
          selectedInitiatives,
          founderMemo,
        },
        savedAt: new Date().toISOString(),
      };
      await api.saveCandidateSubmission(candidateId, payload);
      showToast('Draft saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save draft.', 'error');
    }
  };

  const handleSubmitOfficial = async () => {
    if (hasDailyOvercap) {
      showToast('Daily time cap exceeded! Each day must be ≤ 120 minutes (2 hours).', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        candidateName,
        candidateEmail,
        funnelData: {
          potentialCustomers: 100,
          contactedCustomers: 80,
          respondedCustomers: 20,
          meetingsBooked: 8,
          demosAttended: 3,
          interestedFollowUp: 2,
        },
        assignmentData: {
          part1Bottleneck,
          part1Fix1,
          part1Fix2,
          accounts,
          dailyPlan,
          selectedInitiatives,
          founderMemo,
        },
        submittedAt: new Date().toISOString(),
        isOfficialSubmission: true,
      };

      await api.saveCandidateSubmission(candidateId, payload);
      await api.updateCandidateStatus(candidateId, 'under_review', 'Candidate submitted take-home assessment.');
      setIsSubmitted(true);
      showToast('Assessment submitted successfully!', 'success');

      if (onNavigate) {
        onNavigate('candidate-evaluation', candidateId);
      }
    } catch (err: any) {
      showToast(err.message || 'Submission failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <img src="/tutedude-logo.png" alt="TuteDude" className="h-9 w-auto object-contain mt-1 hidden sm:block" />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-1.5 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Operations Intern Take-Home Task</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              TuteDude Operations Intern Assignment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Practical, basic tasks testing everyday operations: analyzing simple numbers, finding contacts online, and organizing your daily time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Draft
          </Button>
          <Button
            variant="purple"
            size="md"
            onClick={handleSubmitOfficial}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit Task
          </Button>
        </div>
      </div>

      {/* 1. FUNNEL & BASIC MATH */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <Percent className="w-4 h-4 text-purple-600" />
            <span>Task 1: Basic Pipeline Math & Spotting Problems (15-20 mins)</span>
          </div>
        }
        subtitle="Here are real numbers from our outreach last month. Review them and answer the 2 simple questions below."
      >
        <div className="space-y-4 text-xs">
          {/* Visual Step-by-Step Numbers */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-600 mb-2">
              Last Month's Numbers:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">1. Found</span>
                <span className="text-sm font-bold text-slate-800 font-mono">100 leads</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">2. Contacted</span>
                <span className="text-sm font-bold text-slate-800 font-mono">80</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">3. Replied</span>
                <span className="text-sm font-bold text-slate-800 font-mono">20</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[10px]">4. Booked Call</span>
                <span className="text-sm font-bold text-slate-800 font-mono">8</span>
              </div>
              <div className="p-2 rounded bg-rose-50 border border-rose-200">
                <span className="text-rose-700 block text-[10px] font-bold">5. Joined Call</span>
                <span className="text-sm font-black text-rose-700 font-mono">3 (5 missed!)</span>
              </div>
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block text-[10px] font-bold">6. Interested</span>
                <span className="text-sm font-black text-emerald-700 font-mono">2</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap gap-3 text-[11px] text-slate-500 font-mono">
              <span>Reply Rate: <strong>25%</strong> (20/80)</span>
              <span>Call Book Rate: <strong>10%</strong> (8/80)</span>
              <span className="text-rose-700 font-bold">Show-Up Rate: <strong>37.5%</strong> (3/8)</span>
              <span className="text-emerald-700 font-bold">Interest Rate: <strong>66.7%</strong> (2/3)</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Q1: Looking at the numbers, where is the biggest drop-off/problem? (2-3 sentences) *
            </label>
            <textarea
              rows={2}
              value={part1Bottleneck}
              onChange={e => setPart1Bottleneck(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 leading-relaxed font-sans"
              placeholder="e.g. The biggest problem is that out of 8 booked calls, only 3 people showed up..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Q2: What is 1 simple thing you would do before the call to make sure people show up? *
              </label>
              <input
                type="text"
                value={part1Fix1}
                onChange={e => setPart1Fix1(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-sans"
                placeholder="e.g. Send a reminder message on WhatsApp 2 hours before the call with the Google Meet link"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Q3: What would you do 1 day before the call? *
              </label>
              <input
                type="text"
                value={part1Fix2}
                onChange={e => setPart1Fix2(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-sans"
                placeholder="e.g. Confirm if the time still works or offer to reschedule if they are busy"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 2. FINDING LEADS & SIMPLE OUTREACH */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Task 2: Finding 2 Real Companies & Writing a Polite Outreach Message (25 mins)</span>
          </div>
        }
        subtitle="Pick 2 real companies you know or find online. Find a relevant person on LinkedIn and write a short, polite 3-sentence message."
      >
        <div className="space-y-4">
          {accounts.map((acc, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-sm text-slate-900">
                  Company #{idx + 1}: {acc.companyName || 'Company Name'}
                </span>
                <span className={`text-[11px] font-bold ${wordCount(acc.outreachMessage) <= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {wordCount(acc.outreachMessage)} words (keep under 75)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name & Website *</label>
                  <input
                    type="text"
                    value={acc.companyName}
                    onChange={e => {
                      const updated = [...accounts];
                      updated[idx].companyName = e.target.value;
                      setAccounts(updated);
                    }}
                    placeholder="e.g. Razorpay (razorpay.com)"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Person to Contact (Name & Title) *</label>
                  <input
                    type="text"
                    value={acc.decisionMaker}
                    onChange={e => {
                      const updated = [...accounts];
                      updated[idx].decisionMaker = e.target.value;
                      setAccounts(updated);
                    }}
                    placeholder="e.g. Harshil Mathur (CEO / Founder)"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Their LinkedIn Profile Link *</label>
                  <input
                    type="url"
                    value={acc.decisionMakerUrl}
                    onChange={e => {
                      const updated = [...accounts];
                      updated[idx].decisionMakerUrl = e.target.value;
                      setAccounts(updated);
                    }}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short, polite message to send them (3-4 sentences, ask for 5 minutes of their time) *
                </label>
                <textarea
                  rows={2}
                  value={acc.outreachMessage}
                  onChange={e => {
                    const updated = [...accounts];
                    updated[idx].outreachMessage = e.target.value;
                    setAccounts(updated);
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 leading-relaxed font-sans"
                  placeholder="Hi [Name], loved your recent work at [Company]. At TuteDude, we train motivated interns in operations and tech skills. Would you be open to a quick 5-minute chat to see how our trained interns could help your team?"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. YOUR DAILY 2-HOUR SCHEDULE */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Task 3: Your Daily Intern Schedule (2 Hours / Day)</span>
          </div>
        }
        subtitle="As an intern, you have 2 hours per day (10 hours a week). How will you organize your work from Monday to Friday?"
      >
        <div className="space-y-4 text-xs">
          {/* 2 focus areas */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1.5">
              Pick 2 main things you will focus on this week:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Search for new company leads online',
                'Send introductory outreach messages',
                'Follow up with existing leads who did not reply',
                'Send reminders to people who booked calls',
              ].map(item => {
                const active = selectedInitiatives.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      if (active) {
                        setSelectedInitiatives(selectedInitiatives.filter(i => i !== item));
                      } else if (selectedInitiatives.length < 2) {
                        setSelectedInitiatives([...selectedInitiatives, item]);
                      } else {
                        showToast('Please pick 2 items.', 'warning');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      active ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily 5 rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>Monday to Friday Plan (Must be ≤ 120 minutes each day):</span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
                totalWeeklyMinutes <= 600 && !hasDailyOvercap ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                Weekly Total: {totalWeeklyMinutes} / 600 mins {hasDailyOvercap && '(Daily cap > 120m exceeded!)'}
              </span>
            </div>

            {dailyPlan.map((d, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <span className="sm:col-span-2 font-bold text-slate-800">{d.day}</span>
                <input
                  type="text"
                  value={d.task}
                  onChange={e => {
                    const updated = [...dailyPlan];
                    updated[idx].task = e.target.value;
                    setDailyPlan(updated);
                  }}
                  placeholder="What will you do in these 2 hours?"
                  className="sm:col-span-6 px-2.5 py-1.5 rounded border border-slate-200 text-xs"
                />
                <div className="sm:col-span-2 flex items-center gap-1">
                  <input
                    type="number"
                    max="120"
                    min="0"
                    value={d.minutes}
                    onChange={e => {
                      const updated = [...dailyPlan];
                      updated[idx].minutes = parseInt(e.target.value, 10) || 0;
                      setDailyPlan(updated);
                    }}
                    className={`w-14 px-1.5 py-1 rounded border font-mono font-bold text-xs ${
                      d.minutes <= 120 ? 'border-slate-300' : 'border-rose-400 bg-rose-50 text-rose-800'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500">mins</span>
                </div>
                <input
                  type="text"
                  value={d.target}
                  onChange={e => {
                    const updated = [...dailyPlan];
                    updated[idx].target = e.target.value;
                    setDailyPlan(updated);
                  }}
                  placeholder="Expected result (e.g. 15 emails)"
                  className="sm:col-span-2 px-2 py-1 rounded border border-slate-200 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. WEEKLY TEAM UPDATE */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Task 4: Friday Weekly Update for Your Manager (15 mins)</span>
          </div>
        }
        subtitle="At the end of every week, interns send a quick summary to their manager. Fill in the 3 basic sections below."
      >
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              1. Biggest problem or blocker this week (1-2 sentences) *
            </label>
            <input
              type="text"
              value={founderMemo.mainProblem}
              onChange={e => setFounderMemo({ ...founderMemo, mainProblem: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              placeholder="e.g. 5 out of 8 booked calls were missed because prospects forgot..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              2. Three things you completed this week *
            </label>
            <div className="space-y-1.5">
              {founderMemo.actionsTaken.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={action}
                    onChange={e => {
                      const updated = [...founderMemo.actionsTaken];
                      updated[idx] = e.target.value;
                      setFounderMemo({ ...founderMemo, actionsTaken: updated });
                    }}
                    placeholder={`Task #${idx + 1} completed`}
                    className="flex-1 px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              3. Three things you will focus on next week *
            </label>
            <div className="space-y-1.5">
              {founderMemo.nextWeekPriorities.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                  <input
                    type="text"
                    value={p}
                    onChange={e => {
                      const updated = [...founderMemo.nextWeekPriorities];
                      updated[idx] = e.target.value;
                      setFounderMemo({ ...founderMemo, nextWeekPriorities: updated });
                    }}
                    placeholder={`Priority #${idx + 1} for next week`}
                    className="flex-1 px-2.5 py-1.5 rounded border border-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="font-bold text-sm">Done filling your answers?</div>
          <div className="text-slate-400 text-xs mt-0.5">
            Click Submit to record your assignment. The hiring team will review your work against the rubric.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button
            variant="purple"
            size="md"
            onClick={handleSubmitOfficial}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};
