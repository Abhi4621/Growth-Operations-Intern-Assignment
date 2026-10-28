import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { LeadFormModal } from './LeadFormModal.js';
import { Lead, OutreachStatus } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { exportService } from '../../services/exportService.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  Search,
  Filter,
  Download,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle,
  Calendar
} from 'lucide-react';

export const OperationsTracker: React.FC = () => {
  const { showToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'nextFollowUpDate' | 'businessName'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadLeads();
  }, [priorityFilter, statusFilter, overdueOnly, sortBy, sortOrder]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads({
        search: searchTerm,
        priority: priorityFilter,
        status: statusFilter,
        overdueOnly,
        sortBy,
        sortOrder,
      });
      setLeads(data);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: OutreachStatus) => {
    try {
      const updated = await api.updateLead(leadId, { outreachStatus: newStatus });
      setLeads(prev => prev.map(l => (l.id === leadId ? updated : l)));
      showToast(`Updated status to "${newStatus}".`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead for "${name}"?`)) {
      try {
        await api.deleteLead(id);
        setLeads(prev => prev.filter(l => l.id !== id));
        showToast(`Deleted lead for ${name}.`, 'info');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete lead.', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    exportService.exportLeadsToCSV(leads, `operations-tracker-${todayStr}.csv`);
    showToast('Exported leads to CSV.', 'success');
  };

  const handleExportExcel = () => {
    exportService.exportLeadsToExcel(leads, `operations-tracker-${todayStr}.xlsx`);
    showToast('Exported leads to Excel (.xlsx).', 'success');
  };

  const isOverdue = (followUpDate: string, status: OutreachStatus) => {
    return followUpDate < todayStr && status !== 'Closed/Won' && status !== 'Demo Attended';
  };

  const isDueToday = (followUpDate: string, status: OutreachStatus) => {
    return followUpDate === todayStr && status !== 'Closed/Won';
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Operations Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track lead status, follow-up dates, priorities, and export to Excel or CSV.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Export Excel (.xlsx)
          </Button>
          <Button
            variant="purple"
            size="md"
            onClick={() => {
              setEditingLead(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads, problems, or next actions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-navy-800"
            />
          </form>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Overdue Toggle */}
            <button
              onClick={() => setOverdueOnly(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                overdueOnly
                  ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Overdue Follow-ups Only</span>
            </button>

            {/* Quick High Priority Toggle */}
            <button
              onClick={() => setPriorityFilter(prev => (prev === 'High' ? 'all' : 'High'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                priorityFilter === 'High'
                  ? 'bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>High Priority Only</span>
            </button>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Outreach Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Contacted">Contacted</option>
              <option value="Followed Up">Followed Up</option>
              <option value="Meeting Booked">Meeting Booked</option>
              <option value="Demo Attended">Demo Attended</option>
              <option value="Closed/Won">Closed / Won</option>
              <option value="Nurture/Paused">Nurture / Paused</option>
            </select>

            {/* Sort Filter */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="priority-desc">Sort by Priority (High → Low)</option>
              <option value="nextFollowUpDate-asc">Sort by Follow-up (Earliest First)</option>
              <option value="businessName-asc">Sort by Company (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card
        bodyClassName="p-0 overflow-x-auto"
        headerClassName="hidden"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Business & Contact</th>
              <th className="py-3 px-3">Identified Problem</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Outreach Status</th>
              <th className="py-3 px-3">Next Follow-Up</th>
              <th className="py-3 px-3">Next Action</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map(lead => {
              const overdue = isOverdue(lead.nextFollowUpDate, lead.outreachStatus);
              const dueToday = isDueToday(lead.nextFollowUpDate, lead.outreachStatus);

              return (
                <tr
                  key={lead.id}
                  className={`hover:bg-slate-50/90 transition-colors ${
                    overdue ? 'bg-rose-50/20' : dueToday ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* Business & Contact */}
                  <td className="py-3.5 px-4 align-top min-w-[180px]">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {lead.businessName}
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-purple-600 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-slate-600 font-medium text-[11px] mt-0.5">
                      {lead.contactPerson}
                    </div>
                  </td>

                  {/* Business Problem */}
                  <td className="py-3.5 px-3 align-top min-w-[220px] max-w-[280px]">
                    <div className="text-slate-700 leading-snug line-clamp-2">
                      {lead.businessProblem}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    <Badge
                      variant={lead.priority === 'High' ? 'danger' : lead.priority === 'Medium' ? 'warning' : 'neutral'}
                      size="sm"
                    >
                      {lead.priority}
                    </Badge>
                    <div className="text-[10px] text-slate-400 mt-1 max-w-[140px] truncate" title={lead.reasonForPriority}>
                      {lead.reasonForPriority}
                    </div>
                  </td>

                  {/* Outreach Status Dropdown */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    <select
                      value={lead.outreachStatus}
                      onChange={e => handleStatusChange(lead.id, e.target.value as OutreachStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none transition ${
                        lead.outreachStatus === 'Meeting Booked'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : lead.outreachStatus === 'Demo Attended'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : lead.outreachStatus === 'Followed Up'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Followed Up">Followed Up</option>
                      <option value="Meeting Booked">Meeting Booked</option>
                      <option value="Demo Attended">Demo Attended</option>
                      <option value="Closed/Won">Closed / Won</option>
                      <option value="Nurture/Paused">Nurture / Paused</option>
                    </select>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Last: {lead.lastActionDate}
                    </div>
                  </td>

                  {/* Next Follow-Up */}
                  <td className="py-3.5 px-3 align-top whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.nextFollowUpDate}</span>
                    </div>
                    {overdue && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/80 px-1.5 py-0.2 rounded mt-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>OVERDUE</span>
                      </div>
                    )}
                    {dueToday && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded mt-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>DUE TODAY</span>
                      </div>
                    )}
                  </td>

                  {/* Next Action */}
                  <td className="py-3.5 px-3 align-top min-w-[200px] max-w-[260px]">
                    <div className="text-slate-800 font-medium leading-snug">
                      {lead.nextAction}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingLead(lead);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-navy-800 rounded hover:bg-slate-100 transition"
                        title="Edit lead"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id, lead.businessName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                        title="Delete lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No leads found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Modal */}
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLead={editingLead}
        onSave={(saved) => {
          setLeads(prev => {
            const idx = prev.findIndex(l => l.id === saved.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = saved;
              return copy;
            }
            return [saved, ...prev];
          });
        }}
      />
    </div>
  );
};
