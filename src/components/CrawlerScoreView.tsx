import React, { useState } from 'react';
import { Site, SEOIssue } from '../types/seo';
import { ScoreRing } from './ScoreRing';
import {
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Code2,
  FileText,
  Search,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface CrawlerScoreViewProps {
  site: Site | null;
  onRunCrawl: (url: string) => Promise<void>;
  onApplyIssue: (issue: SEOIssue) => void;
  onApplyAllCritical: () => void;
  onOpenScriptModal: () => void;
  onOpenScriptInspector: () => void;
  onGoToIssues: () => void;
  onGoToKeywords: () => void;
  onGoToBlogWriter: () => void;
  onOpenAddSite: () => void;
  onSeedDemoSite?: () => void;
}

export const CrawlerScoreView: React.FC<CrawlerScoreViewProps> = ({
  site,
  onRunCrawl,
  onApplyIssue,
  onApplyAllCritical,
  onOpenScriptModal,
  onOpenScriptInspector,
  onGoToIssues,
  onGoToKeywords,
  onGoToBlogWriter,
  onOpenAddSite,
  onSeedDemoSite,
}) => {
  const [crawlUrl, setCrawlUrl] = useState(site ? site.url : '');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState<string | null>(null);

  // If no site is connected, show clean onboarding ready for backend installation
  if (!site) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-sky-50/50 to-blue-50/30 border border-sky-100 shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
          <Zap className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Connect Your Website to Begin SEO Crawl
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            RichScore crawls your website built on Framer, Webflow, Wix Studio, or Squarespace, provides an instant on-page score, and automates fixes via a single script.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenAddSite}
            className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Production Website</span>
          </button>

          {onSeedDemoSite && (
            <button
              onClick={onSeedDemoSite}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs cursor-pointer transition-colors"
            >
              Load Sample Test Site
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-sky-100/80 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
          <span>✓ Works with Framer &amp; Webflow</span>
          <span>✓ Zero code editing required</span>
          <span>✓ 1-click change rollback</span>
        </div>
      </div>
    );
  }

  const handleCrawlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim() || isCrawling) return;
    setIsCrawling(true);
    setCrawlMessage('Crawling DOM and extracting SEO tags...');
    try {
      await onRunCrawl(crawlUrl);
      setCrawlMessage('Crawl completed successfully!');
      setTimeout(() => setCrawlMessage(null), 3000);
    } catch {
      setCrawlMessage('Crawl finished.');
      setTimeout(() => setCrawlMessage(null), 3000);
    } finally {
      setIsCrawling(false);
    }
  };

  const pendingIssues = site.issues.filter((i) => !i.applied);
  const criticalCount = pendingIssues.filter((i) => i.severity === 'critical').length;
  const appliedCount = site.issues.filter((i) => i.applied).length;

  return (
    <div className="space-y-6">
      {/* Script Status Banner */}
      {site.scriptRevoked ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                Script Access Is Currently Revoked
              </h4>
              <p className="text-xs text-rose-700">
                All client-side SEO overrides are paused. Your live website remains unchanged.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenScriptModal}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer whitespace-nowrap shadow-xs"
          >
            Review Permissions
          </button>
        </div>
      ) : !site.scriptVerified ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Install RichScore Script on {site.name} ({site.builder})
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Add a 1-line script to your site's custom code header to enable automated title, meta, schema, and alt fixes.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenScriptModal}
            className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-xl cursor-pointer whitespace-nowrap shadow-xs self-start sm:self-auto"
          >
            Get Embed Code
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/80 to-blue-50/50 border border-sky-100 flex items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-700">
              <strong className="text-slate-900">RichScore Script Active:</strong> Overrides sync via{' '}
              <code className="text-sky-800 bg-white px-1.5 py-0.5 rounded font-mono border border-slate-200">
                {site.scriptToken}
              </code>{' '}
              under <span className="text-sky-700 capitalize font-bold">{site.fixMode}</span> mode.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenScriptInspector}
              className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1 font-semibold shadow-2xs"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Inspect Script DOM</span>
            </button>
            <button
              onClick={onOpenScriptModal}
              className="text-sky-600 hover:text-sky-800 font-semibold underline cursor-pointer"
            >
              Setup Guide
            </button>
          </div>
        </div>
      )}

      {/* Main Score Visual */}
      <ScoreRing
        score={site.overallScore}
        projectedScore={site.projectedScore}
        subScores={site.subScores}
      />

      {/* Re-crawl Bar & Stats */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleCrawlSubmit} className="w-full md:w-auto flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)}
              placeholder="https://yoursite.framer.app"
              className="w-full bg-[#fdfdfd] text-xs text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={isCrawling}
            className="px-4 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-all shrink-0 shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
            <span>{isCrawling ? 'Scanning Pages...' : 'Re-Crawl Site'}</span>
          </button>
        </form>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <div>
            <span>Pages Scanned:</span>{' '}
            <strong className="text-slate-900 font-mono tabular-nums">{site.pagesScanned}</strong>
          </div>
          <div>
            <span>Last Crawled:</span>{' '}
            <strong className="text-slate-900">{site.lastCrawledAt}</strong>
          </div>
          {crawlMessage && (
            <span className="text-sky-600 font-bold animate-pulse">
              {crawlMessage}
            </span>
          )}
        </div>
      </div>

      {/* Actionable Issues & Growth Engine Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Action Items */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-white via-slate-50/50 to-sky-50/30 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ranked Action Items</h3>
              <p className="text-xs text-slate-500">
                Fixes prioritized by projected SERP ranking and score lift.
              </p>
            </div>
            {criticalCount > 0 && (
              <button
                onClick={onApplyAllCritical}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-lg shadow-xs cursor-pointer transition-all flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Apply All {criticalCount} Critical Fixes</span>
              </button>
            )}
          </div>

          {/* Quick List */}
          <div className="space-y-2.5">
            {pendingIssues.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white border border-slate-200/80 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900">All Detected Issues Resolved</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your website's on-page tags, meta descriptions, and schema markup are optimized and actively served via the script.
                </p>
              </div>
            ) : (
              pendingIssues.slice(0, 3).map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                            issue.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : issue.severity === 'high'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{issue.page}</span>
                        <span className="text-xs text-emerald-600 font-bold font-mono">
                          {issue.impact}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{issue.title}</h4>
                      <p className="text-xs text-slate-600 leading-snug">{issue.plainFix}</p>
                    </div>
                    <button
                      onClick={() => onApplyIssue(issue)}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer whitespace-nowrap shrink-0 transition-colors shadow-2xs"
                    >
                      Approve Fix
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
            <span className="text-slate-500">
              Showing {Math.min(3, pendingIssues.length)} of {pendingIssues.length} pending fixes ({appliedCount} active via script).
            </span>
            <button
              onClick={onGoToIssues}
              className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Issues &amp; Diff Previews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Growth Engine Short-Cuts */}
        <div className="space-y-4">
          {/* Keyword Exploration Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 border border-sky-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-700">
                <Search className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Search Console Keywords</h4>
              </div>
              <span className="text-xs text-emerald-600 font-mono font-bold">14.8k vol</span>
            </div>
            <p className="text-xs text-slate-600">
              Discover high-intent keyword clusters and check keyword difficulty to prioritize landing page copy.
            </p>
            <button
              onClick={onGoToKeywords}
              className="w-full py-2 text-xs font-bold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Explore Keyword Clusters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Content Engine */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 border border-sky-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <FileText className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">AI Content Suite</h4>
              </div>
              <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Generate keyword-optimized blog posts with rich FAQ schema, plus Google Business Profile updates.
            </p>
            <button
              onClick={onGoToBlogWriter}
              className="w-full py-2 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Launch AI Writer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
