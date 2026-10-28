import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface SkillChartProps {
  skillAverages: {
    skill: string;
    shortSkill: string;
    score: number;
    maxScore: number;
    weight: number;
    percentage: number;
  }[];
}

export const SkillChart: React.FC<SkillChartProps> = ({ skillAverages }) => {
  const radarData = skillAverages.map(s => ({
    subject: s.shortSkill,
    fullMark: 100,
    percentage: s.percentage,
    score: s.score,
    weight: s.weight,
  }));

  const barData = skillAverages.map(s => ({
    name: s.shortSkill,
    candidateScore: s.score,
    maxScore: s.maxScore,
    percentage: s.percentage,
  }));

  const colors = ['#7c3aed', '#6366f1', '#0f2744', '#0284c7', '#059669'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar Chart: Skill Competency Mapping */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col items-center">
        <div className="w-full mb-2">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Competency Balance (Radar)</h4>
          <p className="text-xs text-slate-500">Cohort average % proficiency across evaluated dimensions</p>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="Average Proficiency"
                dataKey="percentage"
                stroke="#7c3aed"
                fill="#8b5cf6"
                fillOpacity={0.45}
              />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Proficiency']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Weighted Scores vs Max Points */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col">
        <div className="mb-2">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Skill Scores vs Category Weights</h4>
          <p className="text-xs text-slate-500">Points earned compared to category maximum</p>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 25]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }} />
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value} / ${item.payload.maxScore} pts (${item.payload.percentage}%)`,
                  'Score',
                ]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="candidateScore" radius={[0, 6, 6, 0]}>
                {barData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
