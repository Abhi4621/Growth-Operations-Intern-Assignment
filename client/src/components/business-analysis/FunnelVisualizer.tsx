import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { FunnelData, FunnelMetrics } from '../../../../shared/types.js';

interface FunnelVisualizerProps {
  funnel: FunnelData;
  metrics: FunnelMetrics;
}

export const FunnelVisualizer: React.FC<FunnelVisualizerProps> = ({ funnel, metrics }) => {
  const chartData = [
    {
      stage: 'Identified',
      count: funnel.potentialCustomers,
      rateLabel: '100% Base',
      color: '#0f2744',
      dropOff: `${funnel.potentialCustomers - funnel.contactedCustomers} uncontacted`,
    },
    {
      stage: 'Contacted',
      count: funnel.contactedCustomers,
      rateLabel: `${metrics.contactRate}% Contact Rate`,
      color: '#1e3a5f',
      dropOff: `${funnel.contactedCustomers - funnel.respondedCustomers} non-responders`,
    },
    {
      stage: 'Responded',
      count: funnel.respondedCustomers,
      rateLabel: `${metrics.responseRate}% Response Rate`,
      color: '#334e68',
      dropOff: `${funnel.respondedCustomers - funnel.meetingsBooked} unbooked replies`,
    },
    {
      stage: 'Meetings Booked',
      count: funnel.meetingsBooked,
      rateLabel: `${metrics.meetingBookingRate}% Booking Rate`,
      color: '#6366f1',
      dropOff: `${funnel.meetingsBooked - funnel.demosAttended} no-shows (CRITICAL LEAK)`,
    },
    {
      stage: 'Demos Attended',
      count: funnel.demosAttended,
      rateLabel: `${metrics.demoAttendanceRate}% Attendance Rate`,
      color: '#8b5cf6',
      dropOff: `${funnel.demosAttended - funnel.interestedFollowUp} dropped interest`,
    },
    {
      stage: 'Interested Follow-Up',
      count: funnel.interestedFollowUp,
      rateLabel: `${metrics.followUpInterestRate}% Interest Rate`,
      color: '#059669',
      dropOff: '0 (Qualified pipeline)',
    },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Interactive Conversion Funnel</h4>
          <p className="text-xs text-slate-500">Visualizing drop-off stages and retention efficiency</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
            ⚠️ Largest Bottleneck: Demo Show-Up ({metrics.demoAttendanceRate}%)
          </span>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="stage" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} interval={0} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              formatter={(value: any, name: any, item: any) => [
                `${value} accounts (${item.payload.rateLabel})`,
                'Volume',
              ]}
              labelFormatter={(label: any) => `Funnel Stage: ${label}`}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Visual step percentage badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100">
        {chartData.map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {item.stage}
            </span>
            <span className="text-base font-extrabold text-slate-900 block mt-0.5">
              {item.count}
            </span>
            <span className="text-[11px] font-semibold text-purple-700 block">
              {item.rateLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
