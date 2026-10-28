import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { AuditLog } from '../../../../shared/types.js';
import { api } from '../../services/api.js';
import { History, Shield, RefreshCw } from 'lucide-react';

export const AuditLogsModule: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN')) return <Badge variant="primary" size="sm">Auth</Badge>;
    if (action.includes('OVERRIDE')) return <Badge variant="warning" size="sm">Score Override</Badge>;
    if (action.includes('CREATE')) return <Badge variant="success" size="sm">Created</Badge>;
    if (action.includes('DELETE')) return <Badge variant="danger" size="sm">Deleted</Badge>;
    return <Badge variant="neutral" size="sm">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Security Audit Trail & Governance Logs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable log of score overrides, status changes, and administrator operations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadLogs}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Logs
        </Button>
      </div>

      <Card
        title={
          <div className="flex items-center gap-2 text-slate-900">
            <History className="w-4 h-4 text-navy-800" />
            <span>Audit Log Events</span>
          </div>
        }
        subtitle="Chronological record of system activities and rubric score overrides"
        bodyClassName="p-0 overflow-x-auto"
      >
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-3">Action</th>
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">Target Entity</th>
              <th className="py-3 px-4">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {getActionBadge(log.action)}
                </td>
                <td className="py-3 px-3 font-medium text-slate-800">
                  {log.userEmail || 'System / Service'}
                </td>
                <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                  {log.entityType} ({log.entityId.substring(0, 8)}...)
                </td>
                <td className="py-3 px-4 text-slate-700 max-w-md">
                  <pre className="text-[10px] font-mono bg-slate-50 p-1.5 rounded border border-slate-200 overflow-x-auto">
                    {JSON.stringify(log.details, null, 1)}
                  </pre>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  No audit logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
