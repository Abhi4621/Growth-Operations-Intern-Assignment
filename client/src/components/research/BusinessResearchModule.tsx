import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { ResearchFormModal } from './ResearchFormModal.js';
import { BusinessResearch } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Building2,
  UserCheck,
  Globe,
  Sparkles
} from 'lucide-react';

export const BusinessResearchModule: React.FC = () => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<BusinessResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BusinessResearch | null>(null);

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    try {
      setLoading(true);
      const data = await api.getResearch();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load business research:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: BusinessResearch) => {
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete research for "${name}"?`)) {
      try {
        await api.deleteResearch(id);
        setRecords(prev => prev.filter(r => r.id !== id));
        showToast(`Deleted research record for ${name}.`, 'info');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete record.', 'error');
      }
    }
  };

  const handleCopyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    showToast('Outreach message copied to clipboard!', 'success');
  };

  const filteredRecords = records.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      r.businessName.toLowerCase().includes(q) ||
      r.industry.toLowerCase().includes(q) ||
      r.decisionMaker.toLowerCase().includes(q) ||
      r.problem.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Real-World Business Research
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add verified companies, decision-makers, business problems, and personalized outreach messages.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="purple"
            size="md"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Business Record
          </Button>
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, decision-maker, or problem..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-navy-800"
          />
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Showing <strong className="text-slate-800">{filteredRecords.length}</strong> accounts</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-semibold">100% verified with authentic URLs</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecords.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5 space-y-3.5">
              {/* Title & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {item.businessName}
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-purple-600 transition"
                      title="Open official website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </h3>
                  <span className="text-[11px] text-purple-700 font-medium">
                    {item.industry}
                  </span>
                </div>
                <Badge
                  variant={
                    item.verificationStatus === 'Verified with Sources'
                      ? 'success'
                      : item.verificationStatus === 'Draft / Unverified'
                      ? 'neutral'
                      : 'warning'
                  }
                  size="sm"
                >
                  {item.verificationStatus}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Decision Maker */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-navy-800 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Decision-Maker & Role</div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {item.decisionMaker || 'Unspecified'}
                  </div>
                </div>
              </div>

              {/* Identified Problem */}
              <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                <div className="text-[10px] uppercase font-bold text-rose-800 mb-0.5">Identified Problem / Leak</div>
                <div className="text-xs text-rose-950 leading-snug">
                  {item.problem}
                </div>
              </div>

              {/* Personalised Outreach Draft */}
              <div className="p-3 rounded-lg bg-purple-50/40 border border-purple-100/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-purple" />
                    <span>Personalised Outreach Draft</span>
                  </span>
                  <button
                    onClick={() => handleCopyMessage(item.personalisedOutreach)}
                    className="text-purple-700 hover:text-purple-900 p-1 rounded hover:bg-purple-100/60 transition"
                    title="Copy message"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-700 font-mono leading-relaxed bg-white/70 p-2 rounded border border-purple-100/60">
                  {item.personalisedOutreach}
                </p>
              </div>

              {/* Sources */}
              {item.sourceUrls && item.sourceUrls.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Source URLs</div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.sourceUrls.map((url, uidx) => (
                      <a
                        key={uidx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded transition truncate max-w-[200px]"
                      >
                        <Globe className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 font-mono">
                Updated: {item.updatedAt ? item.updatedAt.split('T')[0] : 'Recent'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-500 hover:text-navy-800 rounded hover:bg-slate-200/60 transition"
                  title="Edit record"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.businessName)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No Business Research Records Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or click "Add Business Record" to add real B2B accounts.
          </p>
        </div>
      )}

      {/* Modal */}
      <ResearchFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingRecord}
        onSave={(saved) => {
          setRecords(prev => {
            const idx = prev.findIndex(r => r.id === saved.id);
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
