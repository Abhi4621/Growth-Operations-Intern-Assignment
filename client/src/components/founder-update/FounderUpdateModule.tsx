import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { FounderUpdate } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { exportService } from '../../services/exportService.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  FileText,
  Download,
  Sparkles,
  Edit3,
  Printer,
  Copy,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';

export const FounderUpdateModule: React.FC = () => {
  const { showToast } = useToast();

  const [update, setUpdate] = useState<FounderUpdate | null>(null);
  const [originalUpdate, setOriginalUpdate] = useState<FounderUpdate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setIsGenerating(true);
        const existing = await api.getFounderUpdates();
        if (existing && existing.length > 0) {
          setUpdate(existing[0]);
          setOriginalUpdate(existing[0]);
        } else {
          await handleGenerateUpdate();
        }
      } catch {
        await handleGenerateUpdate();
      } finally {
        setIsGenerating(false);
      }
    };
    loadInitial();
  }, []);

  const handleGenerateUpdate = async () => {
    setIsGenerating(true);
    try {
      const generated = await api.generateFounderUpdate({
        potentialCustomers: 100,
        contactedCustomers: 80,
        respondedCustomers: 20,
        meetingsBooked: 8,
        demosAttended: 3,
        interestedFollowUp: 2,
      });
      // Save newly generated update to database
      const saved = await api.saveFounderUpdate(generated);
      setUpdate(saved);
      setOriginalUpdate(saved);
      showToast('Generated & saved 1-page executive founder memo.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate founder update.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEdit = () => {
    if (update) {
      setOriginalUpdate(JSON.parse(JSON.stringify(update)));
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (originalUpdate) {
      setUpdate(JSON.parse(JSON.stringify(originalUpdate)));
    }
    setIsEditing(false);
    showToast('Editing cancelled.', 'info');
  };

  const handleSaveMemo = async () => {
    if (!update) return;
    try {
      const saved = await api.saveFounderUpdate(update);
      setUpdate(saved);
      setOriginalUpdate(saved);
      setIsEditing(false);
      showToast('Founder update memo saved to database.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save memo.', 'error');
    }
  };

  // Helper mutation functions for arrays
  const updateItemInArray = (field: 'keyFindings' | 'actionsTaken' | 'nextWeekPriorities' | 'risksAndUncertainties' | 'recommendedNextSteps', index: number, value: string) => {
    if (!update) return;
    const arr = [...update[field]];
    arr[index] = value;
    setUpdate({ ...update, [field]: arr });
  };

  const addItemToArray = (field: 'keyFindings' | 'actionsTaken' | 'risksAndUncertainties' | 'recommendedNextSteps', defaultValue = 'New entry') => {
    if (!update) return;
    setUpdate({ ...update, [field]: [...update[field], defaultValue] });
  };

  const removeItemFromArray = (field: 'keyFindings' | 'actionsTaken' | 'risksAndUncertainties' | 'recommendedNextSteps', index: number) => {
    if (!update) return;
    const arr = update[field].filter((_, i) => i !== index);
    setUpdate({ ...update, [field]: arr });
  };

  const updateMetric = (index: number, key: 'metric' | 'current' | 'target', value: string) => {
    if (!update) return;
    const metrics = [...update.performanceMetrics];
    metrics[index] = { ...metrics[index], [key]: value };
    setUpdate({ ...update, performanceMetrics: metrics });
  };

  const addMetric = () => {
    if (!update) return;
    setUpdate({
      ...update,
      performanceMetrics: [
        ...update.performanceMetrics,
        { metric: 'New Metric', current: '0%', target: '100%' },
      ],
    });
  };

  const removeMetric = (index: number) => {
    if (!update) return;
    setUpdate({
      ...update,
      performanceMetrics: update.performanceMetrics.filter((_, i) => i !== index),
    });
  };

  const handleExportPDF = () => {
    exportService.exportFounderUpdateToPDF('founder-update-memo-container');
    showToast('Exporting executive memo as PDF...', 'info');
  };

  const handleCopyMarkdown = () => {
    if (!update) return;
    const md = `# ${update.title}
**Date:** ${update.date}

## 1. Main Problem
${update.mainProblem}

## 2. Key Findings
${update.keyFindings.map(f => `- ${f}`).join('\n')}

## 3. Actions Taken
${update.actionsTaken.map(a => `- ${a}`).join('\n')}

## 4. Next-Week Priorities
${update.nextWeekPriorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 5. Performance Metrics
${update.performanceMetrics.map(m => `- **${m.metric}:** Current: ${m.current} | Target: ${m.target}`).join('\n')}

## 6. Risks & Uncertainties
${update.risksAndUncertainties.map(r => `- ${r}`).join('\n')}

## 7. Recommended Next Steps
${update.recommendedNextSteps.map(s => `- ${s}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    showToast('Copied Markdown memo to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Module Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Weekly Manager Update
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A 1-page summary of weekly progress, blockers, and next priorities. Edit inline and export as PDF.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Copy Markdown
          </Button>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="purple"
                size="sm"
                onClick={handleSaveMemo}
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                Save Memo to Database
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Memo
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateUpdate}
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Regenerate AI
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleExportPDF}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* The Printable / Viewable One-Page Executive Memo */}
      {update && (
        <div
          id="founder-update-memo-container"
          className="bg-white rounded-2xl border border-slate-300 shadow-md p-7 sm:p-10 max-w-4xl mx-auto space-y-6 print-page"
        >
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-1.5">
                <img src="/tutedude-logo.png" alt="TuteDude" className="h-6 w-auto object-contain" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-700">
                  Executive Operations Memo {isEditing && <span className="text-amber-600 font-bold ml-1.5">(Editing Mode)</span>}
                </span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={update.title}
                  onChange={e => setUpdate({ ...update, title: e.target.value })}
                  className="w-full text-lg sm:text-xl font-black text-slate-900 border border-slate-300 rounded px-2.5 py-1 focus:ring-1 focus:ring-navy-800"
                />
              ) : (
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {update.title}
                </h1>
              )}
            </div>
            <div className="text-right sm:text-right font-mono text-xs text-slate-500 shrink-0">
              <div>
                <strong>Date:</strong>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={update.date}
                    onChange={e => setUpdate({ ...update, date: e.target.value })}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono"
                  />
                ) : (
                  update.date
                )}
              </div>
              <div><strong>Author:</strong> Growth & Operations Intern</div>
            </div>
          </div>

          {/* Section 1: Main Problem */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>1. Main Problem</span>
            </h3>
            {isEditing ? (
              <textarea
                rows={2}
                value={update.mainProblem}
                onChange={e => setUpdate({ ...update, mainProblem: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-sans focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            ) : (
              <p className="text-xs text-slate-800 font-medium leading-relaxed p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                {update.mainProblem}
              </p>
            )}
          </div>

          {/* Section 2: Key Findings */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Key Findings from Funnel Data
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => addItemToArray('keyFindings', 'New finding based on conversion rates')}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Finding
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                {update.keyFindings.map((finding, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800 shrink-0" />
                    <input
                      type="text"
                      value={finding}
                      onChange={e => updateItemInArray('keyFindings', idx, e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemFromArray('keyFindings', idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {update.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800 mt-1.5 shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Section 3: Actions Taken */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                3. Operational Actions Taken This Week
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => addItemToArray('actionsTaken', 'Completed pipeline operational task')}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Action
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                {update.actionsTaken.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      value={action}
                      onChange={e => updateItemInArray('actionsTaken', idx, e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemFromArray('actionsTaken', idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {update.actionsTaken.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Section 4: Three Next-Week Priorities */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-purple" />
              <span>4. Three Next-Week Priorities</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {update.nextWeekPriorities.map((priority, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 mb-1">
                    Priority {idx + 1}
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={priority}
                      onChange={e => updateItemInArray('nextWeekPriorities', idx, e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-purple-300 text-purple-950 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-xs text-purple-950 font-medium leading-snug">
                      {priority}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Performance Metrics */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                5. Performance Metrics (Current vs. 30-Day Target)
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={addMetric}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Metric
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {update.performanceMetrics.map((pm, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Metric {idx + 1}</span>
                        {update.performanceMetrics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMetric(idx)}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={pm.metric}
                        onChange={e => updateMetric(idx, 'metric', e.target.value)}
                        placeholder="Metric Name"
                        className="w-full text-xs font-bold px-2 py-1 rounded border border-slate-300"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Current</label>
                          <input
                            type="text"
                            value={pm.current}
                            onChange={e => updateMetric(idx, 'current', e.target.value)}
                            className="w-full text-xs font-bold text-rose-700 px-2 py-1 rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Target</label>
                          <input
                            type="text"
                            value={pm.target}
                            onChange={e => updateMetric(idx, 'target', e.target.value)}
                            className="w-full text-xs font-bold text-emerald-700 px-2 py-1 rounded border border-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Metric {idx + 1}</span>
                        <span className="text-xs font-bold text-slate-900 block mt-0.5">{pm.metric}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-700 block">Current: {pm.current}</span>
                        <span className="text-xs font-bold text-emerald-700 block">Target: {pm.target}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 6 & 7: Risks & Recommended Next Steps (Two Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Risks */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  6. Risks and Uncertainties
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => addItemToArray('risksAndUncertainties', 'Identified operational risk or bottleneck')}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Risk
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {update.risksAndUncertainties.map((risk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold shrink-0">!</span>
                      <input
                        type="text"
                        value={risk}
                        onChange={e => updateItemInArray('risksAndUncertainties', idx, e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemFromArray('risksAndUncertainties', idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {update.risksAndUncertainties.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                      <span className="text-amber-500 font-bold shrink-0">!</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recommended Next Steps */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  7. Recommended Next Steps
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => addItemToArray('recommendedNextSteps', 'Recommended next operational step')}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {update.recommendedNextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-purple-600 font-bold shrink-0">→</span>
                      <input
                        type="text"
                        value={step}
                        onChange={e => updateItemInArray('recommendedNextSteps', idx, e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemFromArray('recommendedNextSteps', idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {update.recommendedNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                      <span className="text-purple-600 font-bold shrink-0">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>TuteDude Assessment • Confidential Executive Brief</span>
            <span>Generated strictly from verified operations data</span>
          </div>
        </div>
      )}
    </div>
  );
};
