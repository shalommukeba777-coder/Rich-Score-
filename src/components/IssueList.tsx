import React, { useState } from 'react';
import { SEOIssue, IssueCategory, IssueSeverity, Site } from '../types/seo';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface IssueListProps {
  site: Site | null;
  onApplyIssue: (issue: SEOIssue) => void;
  onRollbackIssue: (issueId: string) => void;
  onRejectIssue: (issueId: string) => void;
  onAIFixEnhance: (issue: SEOIssue) => Promise<string | undefined>;
  onOpenAddSite?: () => void;
}

export const IssueList: React.FC<IssueListProps> = ({
  site,
  onApplyIssue,
  onRollbackIssue,
  onRejectIssue,
  onAIFixEnhance,
  onOpenAddSite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({
    'iss-title-01': true,
    'iss-meta-01': true,
  });
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({});

  if (!site) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Connected Site</h3>
          <p className="text-xs text-slate-500 mt-1">
            Connect a website to view ranked SEO issues, plain-language fixes, and before/after previews.
          </p>
        </div>
        {onOpenAddSite && (
          <button
            onClick={onOpenAddSite}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Connect Site
          </button>
        )}
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAIEnhance = async (issue: SEOIssue) => {
    setLoadingAI((prev) => ({ ...prev, [issue.id]: true }));
    try {
      await onAIFixEnhance(issue);
    } finally {
      setLoadingAI((prev) => ({ ...prev, [issue.id]: false }));
    }
  };

  // Filter issues
  const filteredIssues = site.issues.filter((issue) => {
    if (selectedCategory === 'applied') return issue.applied;
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    return true;
  });

  const pendingCount = site.issues.filter((i) => !i.applied).length;
  const appliedCount = site.issues.filter((i) => i.applied).length;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Issues ({site.issues.length})
          </button>
          <button
            onClick={() => setSelectedCategory('schema_meta')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'schema_meta'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Schema &amp; Meta
          </button>
          <button
            onClick={() => setSelectedCategory('content_keywords')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'content_keywords'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Headings &amp; Content
          </button>
          <button
            onClick={() => setSelectedCategory('media_a11y')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'media_a11y'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Media &amp; Alt Text
          </button>
          <button
            onClick={() => setSelectedCategory('technical')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'technical'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internal Links &amp; Robots
          </button>
          <button
            onClick={() => setSelectedCategory('applied')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              selectedCategory === 'applied'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Applied ({appliedCount})</span>
          </button>
        </div>

        {/* Severity Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-white text-xs text-slate-700 font-semibold border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer shadow-2xs"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Issues Accordion List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Issues Found in this View</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All items in this filter category have either been resolved, applied via the script, or skipped.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isExpanded = !!expandedIssues[issue.id];
            const isAIWorking = !!loadingAI[issue.id];

            return (
              <div
                key={issue.id}
                className={`rounded-2xl border transition-all ${
                  issue.applied
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                    : issue.severity === 'critical'
                    ? 'bg-white border-rose-200/90 shadow-2xs'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-sky-300'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(issue.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Severity Label */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                          issue.severity === 'critical'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : issue.severity === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {issue.severity}
                      </span>

                      {/* Page */}
                      <span className="text-xs text-slate-600 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {issue.page}
                      </span>

                      {/* Type */}
                      <span className="text-xs text-slate-400 font-semibold">
                        {issue.type.replace('_', ' ').toUpperCase()}
                      </span>

                      {/* Status */}
                      {issue.applied && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 font-mono">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active via Script</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {issue.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-emerald-600 font-mono hidden sm:inline-block">
                      {issue.impact}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details & Diff Comparison */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                    {/* Plain Language Fix */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50/70 to-blue-50/40 border border-sky-100">
                      <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>Plain-Language Fix</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {issue.plainFix}
                      </p>
                    </div>

                    {/* Before vs After Diff Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Before / Current */}
                      <div className="p-3.5 rounded-xl bg-rose-50/30 border border-rose-200/70 space-y-1.5">
                        <div className="flex items-center justify-between text-rose-700 font-mono font-bold text-[11px]">
                          <span>BEFORE (Current DOM)</span>
                          <span className="text-xs text-slate-400">
                            {issue.currentValue.length} chars
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white text-slate-800 font-mono overflow-x-auto whitespace-pre-wrap break-all border border-rose-100 min-h-[56px] shadow-2xs">
                          {issue.currentValue || (
                            <span className="text-slate-400 italic">None (tag missing)</span>
                          )}
                        </div>
                      </div>

                      {/* After / Script Injection */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/30 border border-emerald-200/70 space-y-1.5">
                        <div className="flex items-center justify-between text-emerald-700 font-mono font-bold text-[11px]">
                          <span>AFTER (Script Injected)</span>
                          <span className="text-xs text-emerald-600 font-bold">
                            {issue.impact}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white text-slate-800 font-mono overflow-x-auto whitespace-pre-wrap break-all border border-emerald-100 min-h-[56px] shadow-2xs">
                          {issue.recommendedValue}
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        {/* Gemini Polish */}
                        <button
                          onClick={() => handleAIEnhance(issue)}
                          disabled={isAIWorking}
                          className="px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Sparkles
                            className={`w-3.5 h-3.5 text-sky-600 ${
                              isAIWorking ? 'animate-spin' : ''
                            }`}
                          />
                          <span>{isAIWorking ? 'Generating with Gemini...' : 'Re-craft with AI'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {issue.applied ? (
                          <button
                            onClick={() => onRollbackIssue(issue.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Rollback Fix</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => onRejectIssue(issue.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => onApplyIssue(issue)}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve &amp; Apply via Script</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
