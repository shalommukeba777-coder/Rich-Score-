import React from 'react';
import { Site, FixMode } from '../types/seo';
import { ShieldCheck, ShieldAlert, Zap, Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  sites: Site[];
  currentSite: Site;
  onSelectSite: (siteId: string) => void;
  onOpenAddSite: () => void;
  onOpenPricing: () => void;
  onOpenScriptModal: () => void;
  onChangeFixMode: (mode: FixMode) => void;
  onToggleRevoke: () => void;
  droppedKeywordsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  sites,
  currentSite,
  onSelectSite,
  onOpenAddSite,
  onOpenPricing,
  onOpenScriptModal,
  onChangeFixMode,
  onToggleRevoke,
  droppedKeywordsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#0f3d38] bg-[#041615]/95 backdrop-blur-md">
      {/* Strict 3-zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-[#041615] font-extrabold text-base">
              R
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
              Rich<span className="text-amber-400">Score</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'overview'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Score & Crawler
          </button>
          <button
            onClick={() => onSelectTab('issues')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'issues'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Issues & Fixes</span>
            {currentSite.issues.filter(i => !i.applied).length > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded font-bold">
                {currentSite.issues.filter(i => !i.applied).length}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('keywords')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'keywords'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Keywords & SERP</span>
            {droppedKeywordsCount && droppedKeywordsCount > 0 ? (
              <span className="text-xs bg-rose-500/20 text-rose-300 font-mono px-1.5 py-0.2 rounded font-bold border border-rose-500/30">
                {droppedKeywordsCount} dropped
              </span>
            ) : null}
          </button>
          <button
            onClick={() => onSelectTab('integrations')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'integrations'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Google & IndexNow
          </button>
          <button
            onClick={() => onSelectTab('content')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'content'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            AI Blog & GBP
          </button>
          <button
            onClick={() => onSelectTab('agency')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentTab === 'agency'
                ? 'text-amber-300 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Agency Portal
          </button>
        </nav>

        {/* Zone 3: 1 primary action + Site switch */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Site Selector Dropdown */}
          <div className="relative">
            <select
              value={currentSite.id}
              onChange={(e) => onSelectSite(e.target.value)}
              className="appearance-none bg-[#092a27] hover:bg-[#0c3531] text-xs font-medium text-slate-200 border border-[#144f49] rounded-lg px-2.5 py-2 pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#092a27] text-white">
                  {s.name} ({s.builder})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#041615] bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade to Growth</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Site Status & Mode Selector */}
      <div className="bg-[#061d1b] border-t border-[#0b2f2b] px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Site Details & Script Connection */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{currentSite.url}</span>
            </span>

            {/* Script Verification Badge */}
            {currentSite.scriptRevoked ? (
              <button
                onClick={onToggleRevoke}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Script Revoked (Click to Re-enable)</span>
              </button>
            ) : currentSite.scriptVerified ? (
              <button
                onClick={onOpenScriptModal}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Script Verified</span>
              </button>
            ) : (
              <button
                onClick={onOpenScriptModal}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Install Script (Pending Verification)</span>
              </button>
            )}
          </div>

          {/* Core Automation Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Mode:</span>
            <div className="flex items-center p-0.5 bg-[#031110] rounded-lg border border-[#0d3632]">
              <button
                onClick={() => onChangeFixMode('suggest')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentSite.fixMode === 'suggest'
                    ? 'bg-[#0f443f] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Only view fixes; no code is applied"
              >
                Suggest only
              </button>
              <button
                onClick={() => onChangeFixMode('approve')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentSite.fixMode === 'approve'
                    ? 'bg-amber-500 text-[#041615] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Review each change before it is injected by the script"
              >
                Approve each change
              </button>
              <button
                onClick={() => onChangeFixMode('auto')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentSite.fixMode === 'auto'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Instant auto-healing of missing tags, schema, and alts"
              >
                Auto-apply
              </button>
            </div>

            {/* Emergency Revoke */}
            <button
              onClick={onToggleRevoke}
              className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                currentSite.scriptRevoked
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/40'
              }`}
              title="Revoke script permissions instantly"
            >
              {currentSite.scriptRevoked ? 'Re-enable Script' : 'Revoke Access'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
