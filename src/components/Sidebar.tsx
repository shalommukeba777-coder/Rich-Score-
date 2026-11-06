import React from 'react';
import { Site, FixMode } from '../types/seo';
import {
  BarChart3,
  AlertCircle,
  Search,
  Share2,
  FileText,
  Clock,
  Building,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Code2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Globe,
  RotateCw,
  LogOut,
  LogIn,
  Database,
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  sites: Site[];
  currentSite: Site | null;
  onSelectSite: (siteId: string) => void;
  onOpenAddSite: () => void;
  onOpenPricing: () => void;
  onOpenScriptModal: () => void;
  onOpenScriptInspector: () => void;
  onChangeFixMode: (mode: FixMode) => void;
  onToggleRevoke: () => void;
  droppedKeywordsCount?: number;
  isCrawling?: boolean;
  onRunCrawl?: () => void;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  sites,
  currentSite,
  onSelectSite,
  onOpenAddSite,
  onOpenPricing,
  onOpenScriptModal,
  onOpenScriptInspector,
  onChangeFixMode,
  onToggleRevoke,
  droppedKeywordsCount = 0,
  isCrawling = false,
  onRunCrawl,
  user = null,
  onSignIn,
  onSignOut,
}) => {
  const pendingIssuesCount = currentSite ? currentSite.issues.filter((i) => !i.applied).length : 0;

  return (
    <aside className="w-72 shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto shadow-sm">
      <div className="p-5 space-y-6">
        {/* Brand Lockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-extrabold text-lg">
              R
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Rich<span className="text-sky-600">Score</span>
              </span>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                AI On-Page SEO Engine
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SITE SELECTOR & QUICK ADD                                      */}
        {/* ============================================================== */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-white border border-sky-100/90 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Active Website</span>
            </span>
            <button
              onClick={onOpenAddSite}
              className="text-[11px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          {sites.length > 0 && currentSite ? (
            <div className="space-y-2">
              <div className="relative">
                <select
                  value={currentSite.id}
                  onChange={(e) => onSelectSite(e.target.value)}
                  className="w-full appearance-none bg-white text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xs"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.builder})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Status pill & score preview */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                {currentSite.scriptRevoked ? (
                  <button
                    onClick={onToggleRevoke}
                    className="flex items-center gap-1 text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span>Script Revoked</span>
                  </button>
                ) : currentSite.scriptVerified ? (
                  <button
                    onClick={onOpenScriptModal}
                    className="flex items-center gap-1 text-emerald-600 hover:underline font-medium cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Script Active</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenScriptModal}
                    className="flex items-center gap-1 text-amber-600 hover:underline font-medium cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Install Script</span>
                  </button>
                )}

                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400">Score:</span>
                  <span className="font-bold text-sky-700 bg-sky-100/60 px-1.5 py-0.2 rounded">
                    {currentSite.overallScore}/100
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center space-y-2">
              <p className="text-xs text-slate-500">No websites connected yet.</p>
              <button
                onClick={onOpenAddSite}
                className="w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect Your Site</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* AUTOMATION MODE SELECTOR                                       */}
        {/* ============================================================== */}
        {currentSite && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/30 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>Script Automation Mode</span>
              <span className="text-sky-600 capitalize font-mono text-[10px] font-semibold">
                {currentSite.fixMode}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs">
              <button
                onClick={() => onChangeFixMode('suggest')}
                className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  currentSite.fixMode === 'suggest'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Only view fixes; no code injected"
              >
                Suggest
              </button>
              <button
                onClick={() => onChangeFixMode('approve')}
                className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  currentSite.fixMode === 'approve'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Approve each change before it is injected"
              >
                Approve
              </button>
              <button
                onClick={() => onChangeFixMode('auto')}
                className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  currentSite.fixMode === 'auto'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Auto-apply fixes immediately"
              >
                Auto
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <button
                onClick={onOpenScriptInspector}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-sky-600" />
                <span>DOM Inspector</span>
              </button>

              <button
                onClick={onToggleRevoke}
                className={`cursor-pointer ${
                  currentSite.scriptRevoked
                    ? 'text-emerald-600 font-semibold hover:underline'
                    : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                {currentSite.scriptRevoked ? 'Re-enable' : 'Revoke'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MAIN NAVIGATION ITEMS                                          */}
        {/* ============================================================== */}
        <nav className="space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 pb-1">
            Dashboard Modules
          </div>

          <button
            onClick={() => onSelectTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-sky-50 text-sky-900 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className={`w-4 h-4 ${currentTab === 'overview' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Score &amp; Crawler</span>
            </div>
            {currentSite && (
              <span className="font-mono text-[11px] text-slate-500">
                {currentSite.overallScore}/100
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('issues')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'issues'
                ? 'bg-sky-50 text-sky-900 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className={`w-4 h-4 ${currentTab === 'issues' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Issues &amp; Fixes</span>
            </div>
            {pendingIssuesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {pendingIssuesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('keywords')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'keywords'
                ? 'bg-sky-50 text-sky-900 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className={`w-4 h-4 ${currentTab === 'keywords' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Keywords &amp; SERP</span>
            </div>
            {droppedKeywordsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                {droppedKeywordsCount} drops
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('integrations')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'integrations'
                ? 'bg-sky-50 text-sky-900 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className={`w-4 h-4 ${currentTab === 'integrations' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Google &amp; IndexNow</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('content')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'content'
                ? 'bg-sky-50 text-sky-900 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className={`w-4 h-4 ${currentTab === 'content' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>AI Blog &amp; GBP</span>
            </div>
            <span className="text-[10px] font-bold text-sky-600">Gemini</span>
          </button>

          <button
            onClick={() => onSelectTab('changelog')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'changelog'
                ? 'bg-sky-50 text-sky-900 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className={`w-4 h-4 ${currentTab === 'changelog' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Changelog &amp; Rollbacks</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('agency')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'agency'
                ? 'bg-sky-50 text-sky-900 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building className={`w-4 h-4 ${currentTab === 'agency' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Agency &amp; White-Label</span>
            </div>
          </button>
        </nav>
      </div>

      {/* ============================================================== */}
      {/* SIDEBAR FOOTER (User Auth & Firestore Status)                 */}
      {/* ============================================================== */}
      <div className="p-4 border-t border-slate-200/80 bg-gradient-to-b from-transparent to-sky-50/50 space-y-2.5">
        {/* User Account / Google Sign-in Card */}
        {user ? (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user.displayName || 'Account'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {user.email}
                  </div>
                </div>
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Firestore Synced</span>
              </span>
              <span className="text-slate-400 font-mono text-[9px]">live</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-50 via-blue-50/50 to-white border border-sky-100 shadow-2xs space-y-2">
            <div className="text-[11px] font-semibold text-slate-700">
              Sync across devices with Firestore
            </div>
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        )}

        {/* Upgrade Plan Card */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>RichScore Pro</span>
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              $29/mo
            </span>
          </div>
          <p className="text-[10px] text-sky-100 leading-tight">
            Unlimited automated script overrides &amp; Gemini AI blog generator.
          </p>
          <button
            onClick={onOpenPricing}
            className="w-full mt-1 py-1.5 bg-white hover:bg-sky-50 text-sky-900 font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
          >
            Upgrade Tier
          </button>
        </div>
      </div>
    </aside>
  );
};
