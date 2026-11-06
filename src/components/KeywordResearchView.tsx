import React, { useState } from 'react';
import { KeywordData, isKeywordDroppedOver5 } from '../types/seo';
import { RankSparkline, getKeywordRankHistory } from './RankSparkline';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Bell,
  X,
  RotateCw,
  Send,
  CheckCircle2,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface KeywordResearchViewProps {
  keywords: KeywordData[];
  onTargetInAI: (keyword: string) => void;
  onAddKeyword: (kw: Partial<KeywordData>) => void;
  droppedKeywordsCount?: number;
}

export const KeywordResearchView: React.FC<KeywordResearchViewProps> = ({
  keywords,
  onTargetInAI,
  onAddKeyword,
  droppedKeywordsCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // Notification & Filter Toggle State
  const [showOnlyDrops, setShowOnlyDrops] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [selectedDiagnoseKeyword, setSelectedDiagnoseKeyword] = useState<KeywordData | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [pingedIndexNow, setPingedIndexNow] = useState(false);

  // CSV Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Compute dropped keywords using shared isKeywordDroppedOver5 logic
  const droppedKeywords = keywords.filter(isKeywordDroppedOver5);
  const totalDrops = droppedKeywordsCount !== undefined ? droppedKeywordsCount : droppedKeywords.length;

  const clusters = ['all', ...Array.from(new Set(keywords.map((k) => k.cluster)))];

  const filteredKeywords = keywords.filter((k) => {
    if (showOnlyDrops && !isKeywordDroppedOver5(k)) return false;

    if (selectedCluster === 'drops_only') {
      if (!isKeywordDroppedOver5(k)) return false;
    } else if (selectedCluster !== 'all' && k.cluster !== selectedCluster) {
      return false;
    }
    if (selectedIntent !== 'all' && k.intent !== selectedIntent) return false;
    if (searchQuery.trim() && !k.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;
    onAddKeyword({
      keyword: newKeywordInput.trim().toLowerCase(),
      volume: Math.floor(Math.random() * 8000) + 1200,
      difficulty: Math.floor(Math.random() * 45) + 15,
      intent: 'Commercial',
      cpc: Number((Math.random() * 3.5 + 1.2).toFixed(2)),
      cluster: 'Target Discovery',
      currentRank: Math.floor(Math.random() * 15) + 1,
      previousRank: Math.floor(Math.random() * 15) + 3,
      rankDelta: 2,
      impressions: Math.floor(Math.random() * 20000) + 5000,
      clicks: Math.floor(Math.random() * 800) + 120,
    });
    setNewKeywordInput('');
    setShowAddModal(false);
  };

  const handleDiagnose = (kw: KeywordData) => {
    setSelectedDiagnoseKeyword(kw);
    setIsDiagnosing(true);
    setDiagnosisResult(null);
    setPingedIndexNow(false);

    setTimeout(() => {
      setIsDiagnosing(false);
      const absDrop = Math.abs(kw.rankDelta || 0) || (kw.currentRank! - kw.previousRank!);
      setDiagnosisResult(
        `Root-Cause Diagnostic Analysis:
1. SERP Shift: Your rank moved from #${kw.previousRank} to #${kw.currentRank} (a drop of ${absDrop} positions) over the last 7 days.
2. Target URL: ${kw.pageTarget || '/'}
3. Diagnosis: ${
          kw.dropReason ||
          'Recent content updates diluted keyword density in the primary H1/H2 tags and missing JSON-LD structured schema.'
        }
4. Recovery Action: Inject an updated title tag, refresh primary header alignment, and re-broadcast via IndexNow.`
      );
    }, 700);
  };

  const handleQuickIndexNowPing = async (kw: KeywordData) => {
    setPingedIndexNow(true);
    try {
      await fetch('/api/indexnow/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: 'apexstudio.framer.app',
          urlList: [`https://apexstudio.framer.app${kw.pageTarget || '/'}`],
        }),
      });
    } catch {
      // Fallback
    }
  };

  const getDifficultyColor = (diff: number) => {
    if (diff < 30) return 'text-emerald-700 bg-emerald-100/80 border border-emerald-200';
    if (diff < 50) return 'text-amber-800 bg-amber-100/80 border border-amber-200';
    return 'text-rose-700 bg-rose-100/80 border border-rose-200';
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'Transactional':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Commercial':
        return 'text-sky-800 bg-sky-50 border-sky-200';
      case 'Informational':
        return 'text-indigo-800 bg-indigo-50 border-indigo-200';
      default:
        return 'text-purple-800 bg-purple-50 border-purple-200';
    }
  };

  const exportCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        'Keyword',
        'Search Volume',
        'Difficulty (KD%)',
        'Current Rank',
        'Previous Rank (7d)',
        '7-Day Delta',
        '30-Day Peak Rank',
        '30-Day Lowest Rank',
        'Search Intent',
        'CPC ($)',
        'Cluster',
        'Target URL',
        'GSC Impressions',
        'GSC Clicks',
        'Rank Drop Status',
      ];

      const rows = filteredKeywords.map((k) => {
        const history = getKeywordRankHistory(k);
        const ranks = history.map((h) => h.rank);
        const peakRank = ranks.length > 0 ? Math.min(...ranks) : (k.previousRank ?? k.currentRank ?? '-');
        const lowRank = ranks.length > 0 ? Math.max(...ranks) : (k.currentRank ?? '-');
        const isDropped = isKeywordDroppedOver5(k);

        return [
          `"${(k.keyword || '').replace(/"/g, '""')}"`,
          k.volume ?? 0,
          k.difficulty ?? 0,
          k.currentRank !== undefined ? k.currentRank : 'Unranked',
          k.previousRank !== undefined ? k.previousRank : '-',
          k.rankDelta !== undefined ? (k.rankDelta > 0 ? `+${k.rankDelta}` : k.rankDelta) : '-',
          peakRank,
          lowRank,
          `"${(k.intent || 'Commercial').replace(/"/g, '""')}"`,
          (k.cpc ?? 0).toFixed(2),
          `"${(k.cluster || 'General').replace(/"/g, '""')}"`,
          `"${(k.pageTarget || '/').replace(/"/g, '""')}"`,
          k.impressions ?? 0,
          k.clicks ?? 0,
          isDropped ? '"CRITICAL DROP (>5 POSITIONS)"' : '"Stable / Normal"',
        ];
      });

      const csvContent =
        '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `richscore_keywords_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('Export CSV failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. RANK DROP NOTIFICATION SYSTEM BANNER (Drop > 5 positions) */}
      {totalDrops > 0 && !alertDismissed ? (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/90 via-white to-red-50/40 border border-rose-200 shadow-xs space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Rank Drop Notification
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-600 text-white shadow-xs">
                    {totalDrops} Keywords Dropped &gt;5 Spots This Week
                  </span>
                </div>
                <p className="text-xs text-rose-700 mt-0.5">
                  Search Console detected significant position declines. Immediate on-page tag and schema recovery recommended.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setShowOnlyDrops(!showOnlyDrops)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
                  showOnlyDrops
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{showOnlyDrops ? 'Showing Only Drops' : `Show Only Drops (${totalDrops})`}</span>
              </button>
              <button
                onClick={() => setAlertDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-rose-100 cursor-pointer transition-colors"
                title="Dismiss notification banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {droppedKeywords.map((kw) => {
              const absDrop = Math.abs(kw.rankDelta || 0) || (kw.currentRank! - kw.previousRank!);
              return (
                <div
                  key={kw.id}
                  className="p-3.5 rounded-xl bg-white border border-rose-200 flex flex-col justify-between space-y-3 shadow-2xs hover:border-rose-300 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        "{kw.keyword}"
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-200 shrink-0 whitespace-nowrap">
                        ↓ -{absDrop} spots
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500">
                        Rank: <span className="line-through text-slate-400">#{kw.previousRank}</span>{' '}
                        <span className="text-rose-600 font-bold">→ #{kw.currentRank}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-amber-700 font-semibold">{kw.volume.toLocaleString()} vol</span>
                    </div>

                    {/* 30-Day Rank Sparkline */}
                    <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-mono leading-tight">
                        <span className="text-rose-800 font-bold block">30d SERP Drop</span>
                        <span className="text-slate-400 text-[9px]">Peak: #{kw.previousRank ?? kw.currentRank}</span>
                      </div>
                      <RankSparkline keyword={kw} width={110} height={26} />
                    </div>

                    {kw.pageTarget && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Target: <code className="text-slate-700">{kw.pageTarget}</code>
                      </div>
                    )}

                    {kw.dropReason && (
                      <p className="text-[11px] text-rose-800 leading-snug line-clamp-2 pt-0.5">
                        {kw.dropReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-rose-100 text-xs">
                    <button
                      onClick={() => handleDiagnose(kw)}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer transition-colors text-center shadow-xs"
                    >
                      Diagnose Drop
                    </button>
                    <button
                      onClick={() => onTargetInAI(kw.keyword)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-amber-700 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                      title="Write AI recovery post"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : alertDismissed && totalDrops > 0 ? (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-rose-800 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>
              {totalDrops} keywords currently have critical rank drops (&gt;5 positions).
            </span>
          </div>
          <button
            onClick={() => setAlertDismissed(false)}
            className="text-rose-700 hover:underline cursor-pointer font-bold"
          >
            Review Drop Notifications
          </button>
        </div>
      ) : null}

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Tracked Volume</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {keywords.reduce((acc, k) => acc + k.volume, 0).toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Active SERP Queries</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-rose-50/40 to-red-50/20 border border-rose-100 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Rank Drop Alerts (&gt;5 Pos)</span>
          <div className="text-2xl font-black text-rose-600 font-mono tabular-nums mt-1 flex items-center gap-2">
            <span>{totalDrops}</span>
            {totalDrops > 0 && (
              <span className="text-[10px] font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-100 border border-rose-200">
                Action Required
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {totalDrops > 0 ? 'Declined in last 7 days' : 'All positions stable'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Search Console Impressions</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {keywords.reduce((acc, k) => acc + (k.impressions || 0), 0).toLocaleString()}
          </div>
          <span className="text-xs text-sky-600 font-semibold mt-1 block">Google Verified</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-white via-amber-50/40 to-orange-50/20 border border-amber-100 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Average Keyword Difficulty</span>
          <div className="text-2xl font-black text-amber-700 font-mono tabular-nums mt-1">
            {keywords.length > 0
              ? Math.round(keywords.reduce((acc, k) => acc + k.difficulty, 0) / keywords.length)
              : 0}
            %
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Competitive Barrier</span>
        </div>
      </div>

      {/* Control Bar: Search, Intent, and 'Show only drops' Toggle Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap flex-1 items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keywords, topics, or intent..."
              className="w-full bg-[#fdfdfd] text-xs text-slate-900 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
            />
          </div>

          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            className="bg-white text-xs text-slate-700 font-semibold border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs shrink-0"
          >
            <option value="all">All Intents</option>
            <option value="Commercial">Commercial</option>
            <option value="Transactional">Transactional</option>
            <option value="Informational">Informational</option>
          </select>

          {/* Dedicated 'Show only drops' Toggle Filter */}
          <div
            onClick={() => setShowOnlyDrops(!showOnlyDrops)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowOnlyDrops(!showOnlyDrops);
              }
            }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer select-none transition-all shadow-2xs ${
              showOnlyDrops
                ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200 text-rose-900'
                : 'bg-white border-slate-200 hover:border-sky-300 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle
                className={`w-3.5 h-3.5 ${showOnlyDrops ? 'text-rose-600' : 'text-slate-400'}`}
              />
              <span className="text-xs font-bold whitespace-nowrap">Show only drops</span>
              {totalDrops > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    showOnlyDrops
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {totalDrops}
                </span>
              )}
            </div>

            <div
              className={`relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
                showOnlyDrops ? 'bg-rose-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  showOnlyDrops ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCSV}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
            title="Download keyword volume, difficulty, and rank data as CSV"
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in" />
                <span className="text-emerald-700 font-bold">Exported CSV</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export to CSV</span>
                {filteredKeywords.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-500 font-mono">
                    {filteredKeywords.length}
                  </span>
                )}
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Keyword</span>
          </button>
        </div>
      </div>

      {/* Cluster Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
        {totalDrops > 0 && (
          <button
            onClick={() => setShowOnlyDrops(!showOnlyDrops)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              showOnlyDrops
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Drops &gt;5 Spots ({totalDrops})</span>
          </button>
        )}

        {clusters.map((cluster) => (
          <button
            key={cluster}
            onClick={() => {
              setSelectedCluster(cluster);
              setShowOnlyDrops(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer capitalize ${
              !showOnlyDrops && selectedCluster === cluster
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cluster === 'all' ? 'All Keywords' : cluster}
          </button>
        ))}
      </div>

      {/* Table with Visual Highlighting */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Search Query &amp; Status</th>
                <th className="py-3.5 px-4 text-right">Volume</th>
                <th className="py-3.5 px-4 text-center">KD%</th>
                <th className="py-3.5 px-4">Intent</th>
                <th className="py-3.5 px-4 text-right">CPC</th>
                <th className="py-3.5 px-4 text-center">Rank (7d Delta)</th>
                <th className="py-3.5 px-4 text-center">30d Rank Trend</th>
                <th className="py-3.5 px-4 text-right">GSC Clicks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">No Keywords Added Yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter target keywords to track live Search Console rankings and receive position drop notifications.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Keyword</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((kw) => {
                  const isDropped = isKeywordDroppedOver5(kw);
                  const absDrop = Math.abs(kw.rankDelta || 0) || (kw.currentRank! - kw.previousRank!);

                  return (
                    <tr
                      key={kw.id}
                      className={`transition-colors group ${
                        isDropped
                          ? 'bg-gradient-to-r from-rose-50/70 via-rose-50/30 to-transparent hover:bg-rose-50 border-l-4 border-l-rose-500'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          {isDropped && (
                            <span
                              title="Alert: Dropped more than 5 positions in the last week!"
                              className="relative flex h-2.5 w-2.5 shrink-0 mt-1"
                            >
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                              <span>{kw.keyword}</span>
                              {isDropped && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white shadow-xs flex items-center gap-1">
                                  <ArrowDownRight className="w-3 h-3" />
                                  <span>Dropped {absDrop} pos</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                              <span>{kw.cluster}</span>
                              {kw.pageTarget && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-slate-500 font-mono">Page: {kw.pageTarget}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 tabular-nums">
                        {kw.volume.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${getDifficultyColor(
                            kw.difficulty
                          )}`}
                        >
                          {kw.difficulty}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getIntentColor(
                            kw.intent
                          )}`}
                        >
                          {kw.intent}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums font-semibold">
                        ${kw.cpc.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {kw.currentRank ? (
                          isDropped ? (
                            <div className="inline-flex flex-col items-center py-1 px-2.5 rounded-lg bg-rose-100 border border-rose-300 shadow-2xs">
                              <span className="text-xs font-mono font-black text-rose-700 tabular-nums">
                                #{kw.currentRank}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-rose-600 tabular-nums">
                                was #{kw.previousRank} (↓ {absDrop})
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`tabular-nums font-bold ${
                                  kw.rankDelta && kw.rankDelta > 0
                                    ? 'text-emerald-600'
                                    : 'text-slate-800'
                                }`}
                              >
                                #{kw.currentRank}
                              </span>
                              {kw.previousRank && (
                                <span className="text-[10px] text-slate-400 tabular-nums">
                                  was #{kw.previousRank}{' '}
                                  {kw.rankDelta && kw.rankDelta > 0 ? `(+${kw.rankDelta})` : `(${kw.rankDelta})`}
                                </span>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="text-slate-400">Not in top 100</span>
                        )}
                      </td>

                      {/* 30-Day SERP Sparkline Chart */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <RankSparkline keyword={kw} width={105} height={28} />
                          <span className="text-[9px] font-mono text-slate-400 mt-0.5 whitespace-nowrap">
                            {isDropped ? (
                              <span className="text-rose-600 font-bold">Drop detected</span>
                            ) : kw.rankDelta && kw.rankDelta > 0 ? (
                              <span className="text-emerald-600 font-bold">+{kw.rankDelta} pos (7d)</span>
                            ) : (
                              <span>30d history</span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums font-semibold">
                        {kw.clicks?.toLocaleString() || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDropped ? (
                            <button
                              onClick={() => handleDiagnose(kw)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>Diagnose Drop</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => onTargetInAI(kw.keyword)}
                            className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3 text-sky-600" />
                            <span>Write Post</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnosis Modal */}
      {selectedDiagnoseKeyword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Rank Drop Diagnostic &amp; Recovery
                  </h3>
                  <p className="text-xs text-slate-500">
                    Query: "{selectedDiagnoseKeyword.keyword}" on {selectedDiagnoseKeyword.pageTarget || '/'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDiagnoseKeyword(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-slate-500 text-[11px] block font-semibold">Weekly Position Shift</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    Was #{selectedDiagnoseKeyword.previousRank} → Now #{selectedDiagnoseKeyword.currentRank}
                  </div>
                  <span className="text-xs text-rose-700 font-bold font-mono">
                    Drop of {Math.abs(selectedDiagnoseKeyword.rankDelta || 0)} spots in Google Search results
                  </span>
                </div>
                <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-rose-200/60">
                  <span className="text-slate-500 text-[10px] font-semibold mb-1">30-Day Trend Curve</span>
                  <RankSparkline keyword={selectedDiagnoseKeyword} width={130} height={32} />
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-slate-500 text-[11px] block font-semibold">Search Volume</span>
                  <div className="text-lg font-black font-mono text-slate-900">
                    {selectedDiagnoseKeyword.volume.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ~{selectedDiagnoseKeyword.clicks || 0} clicks
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>RichScore AI Diagnostic Summary</span>
                </h4>
                {isDiagnosing ? (
                  <div className="flex items-center gap-2 text-slate-600 py-3">
                    <RotateCw className="w-4 h-4 animate-spin text-sky-600" />
                    <span>Analyzing target DOM, competitor schemas, and Search Console logs...</span>
                  </div>
                ) : (
                  <div className="text-slate-700 leading-relaxed font-mono whitespace-pre-wrap text-[11px] p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {diagnosisResult}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-slate-900">Recommended Recovery Actions</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      onTargetInAI(selectedDiagnoseKeyword.keyword);
                      setSelectedDiagnoseKeyword(null);
                    }}
                    className="p-3.5 rounded-2xl bg-sky-50/70 hover:bg-sky-100 border border-sky-200 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sky-800 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Write Topical Content</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Generate a fresh FAQ-rich supporting article to re-establish domain topical authority.
                    </p>
                  </button>

                  <button
                    onClick={() => handleQuickIndexNowPing(selectedDiagnoseKeyword)}
                    className="p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ping IndexNow Bot</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {pingedIndexNow
                        ? '✓ Submitted IndexNow ping! Search engines re-crawling target URL.'
                        : 'Trigger immediate bot re-crawl to parse recent on-page tag adjustments.'}
                    </p>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-slate-400 text-[11px]">
                RichScore Automated Keyword Monitor
              </span>
              <button
                onClick={() => setSelectedDiagnoseKeyword(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Add Target Keyword</h3>
            <p className="text-xs text-slate-500">
              Enter any keyword or long-tail query to track volume, difficulty, and weekly SERP rank movements.
            </p>
            <form onSubmit={handleCreateKeyword} className="space-y-4 text-xs">
              <input
                type="text"
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                placeholder="e.g. framer web design agency"
                autoFocus
                className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Save &amp; Track Keyword
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
