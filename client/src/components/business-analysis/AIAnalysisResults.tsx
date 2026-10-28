import React from 'react';
import { AIBusinessAnalysis } from '../../../../shared/types.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';

interface AIAnalysisResultsProps {
  analysis: AIBusinessAnalysis;
}

export const AIAnalysisResults: React.FC<AIAnalysisResultsProps> = ({ analysis }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Header & Provenance Banner */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-purple flex items-center justify-center text-white shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Operations Diagnosis & Recommendations
              <Badge variant={analysis.isAIGenerated ? 'purple' : 'primary'} size="sm">
                {analysis.isAIGenerated ? 'Live AI Generated' : 'Deterministic Operations Model'}
              </Badge>
            </h4>
            <p className="text-xs text-slate-600">
              Analysis strictly synthesized from user-entered funnel figures. No hallucinations or assumed unverified data.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Key Bottlenecks */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Identified Pipeline Bottlenecks</span>
          </div>
        }
        subtitle="Ranked by drop-off severity and operational revenue impact"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.keyBottlenecks.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                item.severity === 'High'
                  ? 'bg-rose-50/50 border-rose-200'
                  : item.severity === 'Medium'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {item.stage}
                  </span>
                  <Badge
                    variant={item.severity === 'High' ? 'danger' : item.severity === 'Medium' ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {item.severity} Severity
                  </Badge>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight my-1">
                  {item.dropOffRate}% Drop
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {item.impact}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Three Recommended Improvements */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Three Practical, High-Impact Improvements</span>
          </div>
        }
        subtitle="Actionable interventions to plug the identified drop-offs without swelling budget"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {rec.stage}
                  </span>
                  <Badge
                    variant={rec.effort === 'Low' ? 'success' : rec.effort === 'Medium' ? 'primary' : 'warning'}
                    size="sm"
                  >
                    {rec.effort} Effort
                  </Badge>
                </div>
                <h5 className="text-sm font-bold text-slate-900 mt-1 mb-2">
                  {rec.id}. {rec.title}
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {rec.action}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Expected Impact: {rec.expectedImpact}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Drop-off Causes & Suggested Priorities (Two Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Causes */}
        <Card
          title={
            <div className="flex items-center gap-2 text-slate-900">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Possible Root Causes of Drop-Off</span>
            </div>
          }
          subtitle="Qualitative friction points derived from operational benchmarks"
        >
          <ul className="space-y-2.5 text-xs">
            {analysis.dropOffCauses.map((cause, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-700 leading-relaxed">{cause}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Suggested Priorities */}
        <Card
          title={
            <div className="flex items-center gap-2 text-slate-900">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Suggested Execution Priorities</span>
            </div>
          }
          subtitle="Sequencing interventions by revenue leverage and time-to-impact"
        >
          <div className="space-y-3">
            {analysis.suggestedPriorities.map((prio, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-navy-50/60 border border-navy-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-navy-900">{prio.stage}</span>
                  <Badge variant="purple" size="sm">{prio.timeframe}</Badge>
                </div>
                <p className="text-xs text-navy-800 leading-relaxed mt-1">
                  {prio.reason}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Additional Diagnostic Information Needed */}
      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Diagnostic Information Needed Before Final Decisions</span>
          </div>
        }
        subtitle="Critical data points a high-performing Growth Intern must verify rather than blindly guessing"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {analysis.additionalInformationNeeded.map((info, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span className="text-slate-700 leading-snug">{info}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
