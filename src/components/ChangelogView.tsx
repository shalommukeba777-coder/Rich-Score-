import React, { useState } from 'react';
import { ChangelogItem, Site } from '../types/seo';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Download,
  Filter,
} from 'lucide-react';

interface ChangelogViewProps {
  site: Site | null;
  changelog: ChangelogItem[];
  onRollback: (item: ChangelogItem) => void;
  onToggleRevoke: () => void;
}

export const ChangelogView: React.FC<ChangelogViewProps> = ({
  site,
  changelog,
  onRollback,
  onToggleRevoke,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'reverted'>('all');

  const filteredLogs = changelog.filter((log) => {
    if (site && log.siteId !== site.id) return false;
    if (filter !== 'all' && log.status !== filter) return false;
    return true;
  });

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Page', 'Type', 'Title', 'Applied By', 'Status', 'Before', 'After'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.page}"`,
      `"${l.type}"`,
      `"${l.title}"`,
      `"${l.appliedBy}"`,
      `"${l.status}"`,
      `"${l.before.replace(/"/g, '""')}"`,
      `"${l.after.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `richscore_audit_log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Emergency Switch */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Audit Trail &amp; One-Click Rollback History</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Every title, meta description, heading, image alt, and schema change applied to your site is logged with a 1-click snapshot restore.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={exportAuditCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Audit Log</span>
          </button>

          {site && (
            <button
              onClick={onToggleRevoke}
              className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${
                site.scriptRevoked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {site.scriptRevoked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{site.scriptRevoked ? 'Re-Authorize Script' : 'Revoke Script Access'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 max-w-xs text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Changes
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Fixes
        </button>
        <button
          onClick={() => setFilter('reverted')}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
            filter === 'reverted' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reverted
        </button>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs text-slate-500 text-xs space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No Changes Logged Yet</h4>
            <p className="max-w-sm mx-auto text-slate-500">
              Approved fixes applied through the RichScore client script will appear here with before/after comparisons and 1-click rollback.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                log.status === 'reverted'
                  ? 'bg-slate-50/70 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-bold">
                      {log.page}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">Applied by: {log.appliedBy}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`font-bold font-mono text-[11px] ${
                        log.status === 'active' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{log.title}</h4>

                  {/* Before / After Diff */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1 font-mono">
                    <div className="p-3 rounded-xl bg-rose-50/40 border border-rose-200 text-slate-800">
                      <span className="text-[10px] text-rose-700 block mb-0.5 font-bold">
                        PREVIOUS (BEFORE)
                      </span>
                      <p className="line-clamp-2 break-all">{log.before}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-800">
                      <span className="text-[10px] text-emerald-700 block mb-0.5 font-bold">
                        CURRENT (INJECTED AFTER)
                      </span>
                      <p className="line-clamp-2 break-all">{log.after}</p>
                    </div>
                  </div>
                </div>

                {/* Rollback Action */}
                <div className="shrink-0 self-start md:self-auto">
                  {log.status === 'active' ? (
                    <button
                      onClick={() => onRollback(log)}
                      className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>1-Click Rollback</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Reverted to original</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
