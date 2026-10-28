import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { GrowthPlan, DailyGrowthPlan, GrowthTask } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Target,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const GrowthPlanningModule: React.FC = () => {
  const { showToast } = useToast();

  const activityOptions = [
    'Research 20 new potential customers',
    'Follow up with existing leads',
    'Improve the outreach message',
    'Schedule demos with interested prospects',
    'Analyse why previous leads did not respond',
  ];

  // Default selection: Follow up with existing leads & Schedule demos with interested prospects
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    activityOptions[1],
    activityOptions[3],
  ]);

  const [plan, setPlan] = useState<GrowthPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing plan from database if available, else generate
    const loadInitial = async () => {
      try {
        setIsLoading(true);
        const existing = await api.getGrowthPlans();
        if (existing && existing.length > 0) {
          setPlan(existing[0]);
          if (existing[0].selectedActivities && existing[0].selectedActivities.length === 2) {
            setSelectedActivities(existing[0].selectedActivities);
          }
        } else {
          await handleGeneratePlan();
        }
      } catch {
        await handleGeneratePlan();
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, []);

  const handleToggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      if (selectedActivities.length === 1) {
        showToast('Please keep at least 2 activities selected.', 'warning');
        return;
      }
      setSelectedActivities(prev => prev.filter(a => a !== activity));
    } else {
      if (selectedActivities.length >= 2) {
        // Swap out the first one
        setSelectedActivities([selectedActivities[1], activity]);
      } else {
        setSelectedActivities(prev => [...prev, activity]);
      }
    }
  };

  const handleGeneratePlan = async () => {
    if (selectedActivities.length !== 2) {
      showToast('Please select exactly two activities to generate the plan.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const generated = await api.generateGrowthPlan(selectedActivities);
      // Persist plan to database
      const saved = await api.saveGrowthPlan(generated);
      setPlan(saved);
      showToast('Generated & saved 5-day action plan (capped at ≤ 2h/day).', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate growth plan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTaskStatus = async (dayIndex: number, taskId: string) => {
    if (!plan) return;
    const newDaily = [...plan.dailyPlans];
    const task = newDaily[dayIndex].tasks.find(t => t.id === taskId);
    if (!task) return;

    let nextStatus: 'Not Started' | 'In Progress' | 'Completed' = 'In Progress';
    if (task.status === 'Completed') nextStatus = 'Not Started';
    else if (task.status === 'Not Started') nextStatus = 'In Progress';
    else nextStatus = 'Completed';

    task.status = nextStatus;
    const updatedPlan = {
      ...plan,
      dailyPlans: newDaily,
    };
    setPlan(updatedPlan);

    // Save to database
    try {
      if (plan.id) {
        await api.updateGrowthPlanTask(plan.id, taskId, nextStatus);
      } else {
        await api.saveGrowthPlan(updatedPlan);
      }
      showToast(`Task status updated to "${nextStatus}".`, 'info');
    } catch (err) {
      console.warn('Failed to persist task status to DB:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            5-Day Work Schedule (2 Hours / Day)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan daily tasks for Monday to Friday, capped at 2 hours (120 minutes) per day.
          </p>
        </div>
        <Button
          variant="purple"
          size="md"
          onClick={handleGeneratePlan}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Generate 5-Day Plan (AI)
        </Button>
      </div>

      {/* Activity Selector Card */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Select Two Core Growth Activities</span>
          </div>
        }
        subtitle="Choose exactly 2 of the 5 options per assessment brief constraints"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {activityOptions.map((act, idx) => {
            const isSelected = selectedActivities.includes(act);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleToggleActivity(act)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Option {idx + 1}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className={`font-semibold text-xs leading-snug ${isSelected ? 'text-purple-950' : 'text-slate-800'}`}>
                    {act}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected activities summary */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            Active Selection: <strong className="text-purple-900 font-semibold">{selectedActivities.join(' AND ')}</strong>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Strict Cap: 120 min/day (600 min/week)
          </span>
        </div>
      </Card>

      {/* Weekly Schedule View */}
      {plan && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-navy-800" />
              <span>5-Day Action Plan Schedule</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Weekly Planned Time: <strong className="text-slate-900 font-bold">{plan.totalWeeklyMinutes} mins</strong> ({((plan.totalWeeklyMinutes || 0) / 60).toFixed(1)} / 10.0 hrs)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {plan.dailyPlans.map((dayPlan, dayIdx) => {
              const dayMins = dayPlan.tasks.reduce((acc, t) => acc + (t.minutes || 0), 0);
              const completedCount = dayPlan.tasks.filter(t => t.status === 'Completed').length;

              return (
                <div
                  key={dayIdx}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Day {dayPlan.day}: {dayPlan.dayName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {completedCount}/{dayPlan.tasks.length} tasks completed
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border font-mono ${
                        dayMins <= 120
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {dayMins} min
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="p-3.5 space-y-3 flex-1">
                    {dayPlan.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border text-xs transition-all ${
                          task.status === 'Completed'
                            ? 'bg-slate-50/80 border-slate-200 text-slate-400 line-through'
                            : task.status === 'In Progress'
                            ? 'bg-purple-50/60 border-purple-200 text-purple-950'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
                            {task.minutes} mins
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(dayIdx, task.id)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${
                              task.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : task.status === 'In Progress'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {task.status}
                          </button>
                        </div>

                        <div className="font-semibold text-xs text-slate-900 leading-snug mb-1">
                          {task.target}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {task.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Contingency Box */}
                  <div className="p-3 bg-amber-50/40 border-t border-amber-100/80 text-[11px]">
                    <span className="font-bold text-amber-900 block mb-0.5 text-[10px] uppercase">
                      Contingency Plan:
                    </span>
                    <p className="text-amber-800 text-[10px] leading-snug">
                      {dayPlan.contingencyPlan}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
