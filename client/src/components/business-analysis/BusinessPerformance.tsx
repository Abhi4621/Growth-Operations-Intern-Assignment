import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { FunnelVisualizer } from './FunnelVisualizer.js';
import { AIAnalysisResults } from './AIAnalysisResults.js';
import { FunnelData, FunnelMetrics, AIBusinessAnalysis } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  Calculator,
  Sparkles,
  RotateCcw,
  Sliders,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';

export const BusinessPerformance: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  // Initial Sample Business Data from Prompt:
  // Potential customers identified: 100
  // Customers contacted: 80
  // Customers who responded: 20
  // Meetings booked: 8
  // Demos attended: 3
  // Customers interested in follow-up: 2
  const defaultFunnel: FunnelData = {
    potentialCustomers: 100,
    contactedCustomers: 80,
    respondedCustomers: 20,
    meetingsBooked: 8,
    demosAttended: 3,
    interestedFollowUp: 2,
  };

  const [funnel, setFunnel] = useState<FunnelData>(defaultFunnel);
  const [analysis, setAnalysis] = useState<AIBusinessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const candidateId = user?.role === 'candidate' ? (user.id.startsWith('c') ? user.id : 'c0000000-0000-0000-0000-000000000001') : 'c0000000-0000-0000-0000-000000000001';
        const res = await api.getCandidate(candidateId);
        if (res.submission?.funnelData) {
          setFunnel(res.submission.funnelData);
        }
        if (res.submission?.analysis) {
          setAnalysis(res.submission.analysis);
        }
      } catch {
        // use defaults
      }
    };
    loadSaved();
  }, [user]);

  // Automatically calculate metrics on every change
  const metrics: FunnelMetrics = useMemo(() => {
    const contactRate = funnel.potentialCustomers > 0
      ? (funnel.contactedCustomers / funnel.potentialCustomers) * 100
      : 0;
    const responseRate = funnel.contactedCustomers > 0
      ? (funnel.respondedCustomers / funnel.contactedCustomers) * 100
      : 0;
    const meetingBookingRate = funnel.contactedCustomers > 0
      ? (funnel.meetingsBooked / funnel.contactedCustomers) * 100
      : 0;
    const demoAttendanceRate = funnel.meetingsBooked > 0
      ? (funnel.demosAttended / funnel.meetingsBooked) * 100
      : 0;
    const followUpInterestRate = funnel.demosAttended > 0
      ? (funnel.interestedFollowUp / funnel.demosAttended) * 100
      : 0;

    return {
      contactRate: parseFloat(contactRate.toFixed(1)),
      responseRate: parseFloat(responseRate.toFixed(1)),
      meetingBookingRate: parseFloat(meetingBookingRate.toFixed(1)),
      demoAttendanceRate: parseFloat(demoAttendanceRate.toFixed(1)),
      followUpInterestRate: parseFloat(followUpInterestRate.toFixed(1)),
    };
  }, [funnel]);

  const handleInputChange = (field: keyof FunnelData, val: string) => {
    const parsed = parseInt(val, 10);
    setFunnel(prev => ({
      ...prev,
      [field]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handlePreset = (presetName: string) => {
    if (presetName === 'default') {
      setFunnel(defaultFunnel);
      showToast('Reset to prompt baseline funnel data.', 'info');
    } else if (presetName === 'optimized') {
      setFunnel({
        potentialCustomers: 150,
        contactedCustomers: 130,
        respondedCustomers: 45,
        meetingsBooked: 22,
        demosAttended: 18,
        interestedFollowUp: 12,
      });
      showToast('Loaded Optimized Pipeline scenario.', 'info');
    } else if (presetName === 'high-volume') {
      setFunnel({
        potentialCustomers: 300,
        contactedCustomers: 250,
        respondedCustomers: 50,
        meetingsBooked: 15,
        demosAttended: 5,
        interestedFollowUp: 3,
      });
      showToast('Loaded High-Volume Top-of-Funnel scenario.', 'info');
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.analyseBusiness(funnel);
      setAnalysis(res.analysis);
      showToast('Business performance analysis completed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to complete analysis.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveSubmission = async () => {
    setIsSaving(true);
    try {
      const candidateId = user?.role === 'candidate' ? (user.id.startsWith('c') ? user.id : 'c0000000-0000-0000-0000-000000000001') : 'c0000000-0000-0000-0000-000000000001';
      await api.saveCandidateSubmission(candidateId, {
        funnelData: funnel,
        metrics,
        analysis,
        savedAt: new Date().toISOString(),
      });
      showToast('Saved Funnel & AI Diagnostic to Candidate Assessment Submission!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save submission.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Module Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Funnel Performance & AI Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your outreach numbers to calculate conversion rates and get AI recommendations on bottlenecks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset('default')}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Default
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSubmission}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5 text-navy-800" />}
          >
            Save Funnel Data
          </Button>
          <Button
            variant="purple"
            size="md"
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Analyse Business Data (AI)
          </Button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600 flex items-center gap-1.5 px-2">
          <Sliders className="w-3.5 h-3.5 text-navy-800" />
          <span>Quick Funnel Scenarios:</span>
        </span>
        <button
          onClick={() => handlePreset('default')}
          className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium transition"
        >
          Baseline Prompt Data (100 → 80 → 20 → 8 → 3 → 2)
        </button>
        <button
          onClick={() => handlePreset('optimized')}
          className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-200 font-medium transition"
        >
          Optimized Attendance Scenario (78% show-up)
        </button>
        <button
          onClick={() => handlePreset('high-volume')}
          className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-indigo-800 border border-indigo-200 font-medium transition"
        >
          High-Volume Top-of-Funnel (300 Identified)
        </button>
      </div>

      {/* Funnel Inputs & Real-Time Calculated Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Fields */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title={
              <div className="flex items-center gap-2 text-slate-900">
                <Calculator className="w-4 h-4 text-purple-600" />
                <span>Funnel Activity Numbers</span>
              </div>
            }
            subtitle="Edit any number below to automatically update the rates and chart."
          >
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Potential Customers Identified
                </label>
                <input
                  type="number"
                  min="0"
                  value={funnel.potentialCustomers}
                  onChange={e => handleInputChange('potentialCustomers', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-mono text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Customers Contacted
                </label>
                <input
                  type="number"
                  min="0"
                  value={funnel.contactedCustomers}
                  onChange={e => handleInputChange('contactedCustomers', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-mono text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Customers Who Responded
                </label>
                <input
                  type="number"
                  min="0"
                  value={funnel.respondedCustomers}
                  onChange={e => handleInputChange('respondedCustomers', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-mono text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. Meetings Booked
                </label>
                <input
                  type="number"
                  min="0"
                  value={funnel.meetingsBooked}
                  onChange={e => handleInputChange('meetingsBooked', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-mono text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  5. Demos Attended
                </label>
                <input
                  type="number"
                  min="0"
                  value={funnel.demosAttended}
                  onChange={e => handleInputChange('demosAttended', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-mono text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  6. Customers Interested in Follow-Up
                </label>
                <input
                  type="number"
                  min="0"
                  value={funnel.interestedFollowUp}
                  onChange={e => handleInputChange('interestedFollowUp', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 font-mono text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Real-Time Calculated Conversion Rates */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            title={
              <div className="flex items-center gap-2 text-slate-900">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Calculated Conversion Rates</span>
              </div>
            }
            subtitle="Automated calculations per prompt operational formulas"
          >
            <div className="space-y-3">
              {/* Contact Rate */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Contact Rate</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Contacted / Potential ({funnel.contactedCustomers} / {funnel.potentialCustomers}) × 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-navy-900 font-mono">
                    {metrics.contactRate}%
                  </span>
                </div>
              </div>

              {/* Response Rate */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Response Rate</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Responses / Contacted ({funnel.respondedCustomers} / {funnel.contactedCustomers}) × 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-navy-900 font-mono">
                    {metrics.responseRate}%
                  </span>
                </div>
              </div>

              {/* Meeting Booking Rate */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Meeting Booking Rate</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Meetings Booked / Contacted ({funnel.meetingsBooked} / {funnel.contactedCustomers}) × 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-indigo-900 font-mono">
                    {metrics.meetingBookingRate}%
                  </span>
                </div>
              </div>

              {/* Demo Attendance Rate - High Risk Warning */}
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <span>Demo Attendance Rate</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 font-bold uppercase">
                      Core Bottleneck
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-700 font-mono mt-0.5">
                    Demos Attended / Meetings Booked ({funnel.demosAttended} / {funnel.meetingsBooked}) × 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-700 font-mono">
                    {metrics.demoAttendanceRate}%
                  </span>
                </div>
              </div>

              {/* Follow-up Interest Rate */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">Follow-Up Interest Rate</div>
                  <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                    Interested / Demos Attended ({funnel.interestedFollowUp} / {funnel.demosAttended}) × 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-700 font-mono">
                    {metrics.followUpInterestRate}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Visual Funnel Representation */}
      <FunnelVisualizer funnel={funnel} metrics={metrics} />

      {/* AI Analysis Results Section */}
      {analysis && <AIAnalysisResults analysis={analysis} />}
      {!analysis && (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
          <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-bounce" />
          <h4 className="text-sm font-bold text-slate-800">
            Ready to Run OpenAI Business Analysis
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Click the button below to diagnose bottlenecks, calculate drop-off causes, and receive 3 prioritized recommendations tailored to your exact data.
          </p>
          <Button
            variant="purple"
            size="md"
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Analyse Business Data (AI)
          </Button>
        </div>
      )}
    </div>
  );
};
