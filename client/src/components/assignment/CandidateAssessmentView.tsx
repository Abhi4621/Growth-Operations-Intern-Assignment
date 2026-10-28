import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  CheckCircle2,
  Send,
  Building2,
  Clock,
  FileText,
  Percent,
  Check,
  ChevronRight
} from 'lucide-react';

interface CandidateAssessmentViewProps {
  onAdminClick?: () => void;
}

export const CandidateAssessmentView: React.FC<CandidateAssessmentViewProps> = ({ onAdminClick }) => {
  const { showToast } = useToast();

  // Basic Candidate Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // 1. Funnel Math (Simple)
  const [bottleneck, setBottleneck] = useState('');
  const [fix1, setFix1] = useState('');
  const [fix2, setFix2] = useState('');

  // 2. Lead Research (2 companies)
  const [company1Name, setCompany1Name] = useState('');
  const [company1Person, setCompany1Person] = useState('');
  const [company1LinkedIn, setCompany1LinkedIn] = useState('');
  const [company1Message, setCompany1Message] = useState('');

  const [company2Name, setCompany2Name] = useState('');
  const [company2Person, setCompany2Person] = useState('');
  const [company2LinkedIn, setCompany2LinkedIn] = useState('');
  const [company2Message, setCompany2Message] = useState('');

  // 3. Daily 2-Hour Plan (Mon - Fri)
  const [monTask, setMonTask] = useState('');
  const [tueTask, setTueTask] = useState('');
  const [wedTask, setWedTask] = useState('');
  const [thuTask, setThuTask] = useState('');
  const [friTask, setFriTask] = useState('');

  // 4. Weekly Manager Update
  const [biggestProblem, setBiggestProblem] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [nextWeekPriorities, setNextWeekPriorities] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      showToast('Please enter your Name and Email.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create or register candidate
      const candidate = await api.createCandidate({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 00000 00000',
        experienceLevel: 'Operations Intern Candidate',
        status: 'under_review',
      });

      // 2. Save submission answers
      await api.saveCandidateSubmission(candidate.id, {
        candidateName: name.trim(),
        candidateEmail: email.trim(),
        candidatePhone: phone.trim(),
        assignmentData: {
          bottleneck,
          fix1,
          fix2,
          companies: [
            { name: company1Name, person: company1Person, linkedin: company1LinkedIn, message: company1Message },
            { name: company2Name, person: company2Person, linkedin: company2LinkedIn, message: company2Message },
          ],
          dailySchedule: {
            monday: monTask,
            tuesday: tueTask,
            wednesday: wedTask,
            thursday: thuTask,
            friday: friTask,
          },
          weeklyUpdate: {
            biggestProblem,
            tasksCompleted,
            nextWeekPriorities,
          },
        },
        submittedAt: new Date().toISOString(),
      });

      setIsSubmitted(true);
      showToast('Your assessment has been submitted to TuteDude!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Submission failed. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 max-w-lg w-full text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Assessment Received!
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Thank you, <strong>{name}</strong>. Your Operations Intern task has been submitted to the TuteDude hiring team.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            We review all submissions and will get in touch with you at <strong className="text-slate-800">{email}</strong>.
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 pt-2 block mx-auto"
          >
            Submit another response / Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/tutedude-logo.png" alt="TuteDude" className="h-8 w-auto object-contain" />
          <div className="border-l border-slate-200 pl-3 hidden sm:block">
            <span className="text-xs font-semibold text-slate-700">Operations Intern Assessment</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 transition"
            >
              Admin Portal
            </button>
          )}
        </div>
      </header>

      {/* Main Assessment Container */}
      <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Operations Intern Take-Home Task
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            4 simple tasks to see how you think, organize your daily work, and communicate. Takes about 30–45 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 0: Candidate Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Your Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abhi Pandey"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. abhi.pandey@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Pipeline Problem */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Task 1
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Fixing a Meeting Problem
              </h2>
            </div>

            {/* Simple Numbers Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 block mb-2">Here is what happened last month:</span>
              <ul className="space-y-1 font-mono text-slate-600 text-xs">
                <li>• We contacted <strong>80</strong> potential leads</li>
                <li>• <strong>20</strong> people replied (25%)</li>
                <li>• <strong>8</strong> people booked a demo call (10%)</li>
                <li className="text-rose-700 font-bold">• But only <strong>3</strong> people actually showed up (5 missed!)</li>
                <li className="text-emerald-700 font-bold">• <strong>2</strong> of them wanted to move forward (66.7%)</li>
              </ul>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  1. Looking at these numbers, what is the biggest problem? *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="In 1-2 lines, tell us where we are losing people..."
                  value={bottleneck}
                  onChange={e => setBottleneck(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  2. What are 2 simple things you would do to make sure people don't miss their calls? *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Step 1: (e.g. Send a WhatsApp reminder 2 hours before the call with the meeting link)"
                    value={fix1}
                    onChange={e => setFix1(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Step 2: (e.g. Message them 1 day before to confirm if the timing still works)"
                    value={fix2}
                    onChange={e => setFix2(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Real Companies & Message */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Task 2
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Finding 2 Real Companies & Writing a Short Message
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick 2 real companies (e.g. Razorpay, Swiggy, Meesho, Zerodha, etc.). Find someone on LinkedIn and write a polite 3-sentence message.
              </p>
            </div>

            {/* Company 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Company #1</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Razorpay"
                    value={company1Name}
                    onChange={e => setCompany1Name(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Person's Name & Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harshil Mathur (CEO)"
                    value={company1Person}
                    onChange={e => setCompany1Person(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">Their LinkedIn Profile Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://linkedin.com/in/..."
                    value={company1LinkedIn}
                    onChange={e => setCompany1LinkedIn(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Short message you would send them (3-4 sentences)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Hi [Name], loved your recent work at [Company]. At TuteDude, we train motivated interns in operations and tech. Would you be open to a quick 5-minute chat to see how our trained interns could support your team?"
                  value={company1Message}
                  onChange={e => setCompany1Message(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Company 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Company #2</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urban Company"
                    value={company2Name}
                    onChange={e => setCompany2Name(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Person's Name & Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abhiraj Bhal (CEO)"
                    value={company2Person}
                    onChange={e => setCompany2Person(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">Their LinkedIn Profile Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://linkedin.com/in/..."
                    value={company2LinkedIn}
                    onChange={e => setCompany2LinkedIn(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-[11px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Short message you would send them (3-4 sentences)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Hi [Name], really admire how you scale your team. We help fast-growing teams handle day-to-day operations and lead follow-ups. Could I share a quick 2-minute overview of how our interns assist operations?"
                  value={company2Message}
                  onChange={e => setCompany2Message(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Daily 2-Hour Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Task 3
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Your 2-Hour Daily Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                You work 2 hours each day (Monday to Friday). Write 1 simple line for each day: what will you work on?
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-20 font-bold text-slate-700 shrink-0">Monday</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Find 15 new company leads on Google/LinkedIn and get their email addresses"
                  value={monTask}
                  onChange={e => setMonTask(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 font-bold text-slate-700 shrink-0">Tuesday</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send 15 introductory outreach emails to the leads collected"
                  value={tueTask}
                  onChange={e => setTueTask(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 font-bold text-slate-700 shrink-0">Wednesday</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up with older leads who haven't replied yet"
                  value={wedTask}
                  onChange={e => setWedTask(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 font-bold text-slate-700 shrink-0">Thursday</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send reminder messages and meeting links to all booked calls"
                  value={thuTask}
                  onChange={e => setThuTask(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 font-bold text-slate-700 shrink-0">Friday</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Update lead statuses in the spreadsheet and write a weekly update for manager"
                  value={friTask}
                  onChange={e => setFriTask(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Weekly Manager Update */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                Task 4
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Friday Weekly Update to Your Manager
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                At the end of every week, interns send a quick summary to their manager.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  1. What was the biggest challenge or blocker this week? (1 sentence) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 out of 8 booked calls were missed because prospects forgot about the meeting."
                  value={biggestProblem}
                  onChange={e => setBiggestProblem(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  2. What are 3 things you completed this week? *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 1. Contacted 15 new leads&#10;2. Set up a WhatsApp reminder template&#10;3. Cleaned up our lead tracker sheet"
                  value={tasksCompleted}
                  onChange={e => setTasksCompleted(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  3. What are 3 things you will work on next week? *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 1. Call booked prospects on the morning of their call&#10;2. Follow up with the 2 interested leads&#10;3. Find 20 new company contacts"
                  value={nextWeekPriorities}
                  onChange={e => setNextWeekPriorities(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Your Assessment...' : 'Submit Assessment to TuteDude'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Your submission will be saved and reviewed directly by the TuteDude hiring team.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};
