/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_SITES,
  INITIAL_CHANGELOG,
  MOCK_KEYWORDS,
  MOCK_AGENCY_CLIENTS,
  DEMO_SEED_SITE,
} from './data/mockData';
import {
  Site,
  SEOIssue,
  FixMode,
  ChangelogItem,
  KeywordData,
  AgencyClient,
  isKeywordDroppedOver5,
} from './types/seo';
import { Sidebar } from './components/Sidebar';
import { CrawlerScoreView } from './components/CrawlerScoreView';
import { IssueList } from './components/IssueList';
import { KeywordResearchView } from './components/KeywordResearchView';
import { GoogleIntegrationsView } from './components/GoogleIntegrationsView';
import { AIBlogWriterView } from './components/AIBlogWriterView';
import { ChangelogView } from './components/ChangelogView';
import { AgencyDashboardView } from './components/AgencyDashboardView';
import { ScriptModal } from './components/ScriptModal';
import { ScriptInspector } from './components/ScriptInspector';
import { PricingModal } from './components/PricingModal';
import { AddSiteModal } from './components/AddSiteModal';
import {
  Sparkles,
  Globe,
  RotateCw,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Code2,
  Search,
  X,
  Check,
  Command,
  LogIn,
  LogOut,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  testConnection,
  signInWithGoogle,
  signOutUser,
} from './lib/firebase';
import {
  saveUserProfile,
  subscribeToSites,
  saveSiteToFirestore,
  deleteSiteFromFirestore,
  subscribeToKeywords,
  saveKeywordToFirestore,
  subscribeToChangelog,
  saveChangelogToFirestore,
} from './services/firestoreService';

export default function App() {
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [currentSiteId, setCurrentSiteId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [changelog, setChangelog] = useState<ChangelogItem[]>(INITIAL_CHANGELOG);
  const [keywords, setKeywords] = useState<KeywordData[]>(MOCK_KEYWORDS);
  const [clients, setClients] = useState<AgencyClient[]>(MOCK_AGENCY_CLIENTS);
  const [targetAIKeyword, setTargetAIKeyword] = useState<string>('ai website builder seo');
  const [isCrawling, setIsCrawling] = useState(false);

  // Firebase Auth & Firestore State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Site Search Bar State
  const [siteSearchQuery, setSiteSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Modals
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [scriptInspectorOpen, setScriptInspectorOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [addSiteModalOpen, setAddSiteModalOpen] = useState(false);

  // Test connection on boot & listen to Auth state changes
  React.useEffect(() => {
    testConnection();

    let unsubSites: (() => void) | undefined;
    let unsubKeywords: (() => void) | undefined;
    let unsubChangelog: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        try {
          await saveUserProfile(currentUser);
        } catch (e) {
          console.error(e);
        }

        unsubSites = subscribeToSites(currentUser.uid, (remoteSites) => {
          if (remoteSites.length > 0) {
            setSites(remoteSites);
            setCurrentSiteId((prevId) => {
              if (remoteSites.some((s) => s.id === prevId)) return prevId;
              return remoteSites[0].id;
            });
          }
        });

        unsubKeywords = subscribeToKeywords(currentUser.uid, (remoteKws) => {
          if (remoteKws.length > 0) {
            setKeywords(remoteKws);
          }
        });

        unsubChangelog = subscribeToChangelog(currentUser.uid, (remoteLogs) => {
          if (remoteLogs.length > 0) {
            setChangelog(remoteLogs);
          }
        });
      } else {
        if (unsubSites) unsubSites();
        if (unsubKeywords) unsubKeywords();
        if (unsubChangelog) unsubChangelog();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubSites) unsubSites();
      if (unsubKeywords) unsubKeywords();
      if (unsubChangelog) unsubChangelog();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-in failed', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-out failed', err);
    }
  };

  // Keyboard shortcut (⌘K or /) to focus site search bar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dismiss search dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered sites based on query
  const filteredSites = sites.filter((site) => {
    if (!siteSearchQuery.trim()) return true;
    const q = siteSearchQuery.toLowerCase();
    return (
      site.name.toLowerCase().includes(q) ||
      site.url.toLowerCase().includes(q) ||
      site.builder.toLowerCase().includes(q)
    );
  });

  // Current Site (null-safe)
  const currentSite = sites.find((s) => s.id === currentSiteId) || (sites.length > 0 ? sites[0] : null);

  // Helper to update current site
  const updateCurrentSite = (updater: (s: Site) => Site) => {
    if (!currentSite) return;
    const updated = updater(currentSite);
    setSites((prev) =>
      prev.map((site) => (site.id === currentSite.id ? updated : site))
    );
    if (user) {
      saveSiteToFirestore(user.uid, updated);
    }
  };

  // 1. Run Crawl
  const handleRunCrawl = async (url?: string) => {
    if (!currentSite) return;
    const targetUrl = url || currentSite.url;
    setIsCrawling(true);
    try {
      const resp = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, builderType: currentSite.builder }),
      });
      const data = await resp.json();

      updateCurrentSite((site) => ({
        ...site,
        url: data.url || targetUrl,
        lastCrawledAt: 'Just now',
        pagesScanned: data.pagesScanned || 20,
        overallScore: data.overallScore || site.overallScore,
        projectedScore: data.projectedScore || site.projectedScore,
        subScores: data.subScores || site.subScores,
        issues: data.issues || site.issues,
      }));
    } catch {
      updateCurrentSite((site) => ({
        ...site,
        lastCrawledAt: 'Just now',
        pagesScanned: site.pagesScanned + 2,
      }));
    } finally {
      setIsCrawling(false);
    }
  };

  // 2. Apply Issue
  const handleApplyIssue = (issue: SEOIssue) => {
    if (!currentSite) return;
    const impactDelta = parseInt(issue.impact.replace(/[^0-9]/g, ''), 10) || 5;

    updateCurrentSite((site) => {
      const newScore = Math.min(100, site.overallScore + impactDelta);
      const updatedIssues = site.issues.map((i) =>
        i.id === issue.id
          ? { ...i, applied: true, status: 'applied' as const, appliedAt: new Date().toISOString() }
          : i
      );

      // Adjust subscore
      const newSubScores = { ...site.subScores };
      if (issue.category === 'schema_meta') {
        newSubScores.schemaMeta = Math.min(100, newSubScores.schemaMeta + impactDelta * 2);
      } else if (issue.category === 'content_keywords') {
        newSubScores.contentKeywords = Math.min(100, newSubScores.contentKeywords + impactDelta * 2);
      } else if (issue.category === 'media_a11y') {
        newSubScores.mediaA11y = Math.min(100, newSubScores.mediaA11y + impactDelta * 2);
      } else {
        newSubScores.technical = Math.min(100, newSubScores.technical + impactDelta * 2);
      }

      return {
        ...site,
        overallScore: newScore,
        subScores: newSubScores,
        issues: updatedIssues,
      };
    });

    // Add to changelog
    const newLogItem: ChangelogItem = {
      id: `cl-${Date.now()}`,
      siteId: currentSite.id,
      issueId: issue.id,
      type: issue.type,
      page: issue.page,
      title: `Applied fix for: ${issue.title}`,
      before: issue.currentValue || 'None',
      after: issue.recommendedValue,
      appliedBy: currentSite.fixMode === 'auto' ? 'Auto-apply engine' : 'Manual approval',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'active',
    };
    setChangelog((prev) => [newLogItem, ...prev]);
    if (user) {
      saveChangelogToFirestore(user.uid, newLogItem);
    }
  };

  // 3. Apply All Critical Issues
  const handleApplyAllCritical = () => {
    if (!currentSite) return;
    const criticalIssues = currentSite.issues.filter(
      (i) => !i.applied && i.severity === 'critical'
    );
    criticalIssues.forEach((iss) => handleApplyIssue(iss));
  };

  // 4. Rollback Issue
  const handleRollbackIssue = (issueId: string) => {
    if (!currentSite) return;
    updateCurrentSite((site) => {
      const targetIssue = site.issues.find((i) => i.id === issueId);
      const impactDelta = targetIssue ? parseInt(targetIssue.impact.replace(/[^0-9]/g, ''), 10) || 5 : 5;
      const newScore = Math.max(30, site.overallScore - impactDelta);

      return {
        ...site,
        overallScore: newScore,
        issues: site.issues.map((i) =>
          i.id === issueId ? { ...i, applied: false, status: 'reverted' as const } : i
        ),
      };
    });

    setChangelog((prev) =>
      prev.map((log) => (log.issueId === issueId ? { ...log, status: 'reverted' as const } : log))
    );
  };

  // 5. Dismiss Issue
  const handleRejectIssue = (issueId: string) => {
    if (!currentSite) return;
    updateCurrentSite((site) => ({
      ...site,
      issues: site.issues.map((i) =>
        i.id === issueId ? { ...i, status: 'rejected' as const } : i
      ),
    }));
  };

  // 6. Gemini AI Polish
  const handleAIFixEnhance = async (issue: SEOIssue) => {
    if (!currentSite) return;
    try {
      const resp = await fetch('/api/ai/fix-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueType: issue.type,
          pageUrl: issue.page,
          currentContent: issue.currentValue,
          siteName: currentSite.name,
        }),
      });
      const data = await resp.json();
      if (data && data.fix) {
        updateCurrentSite((site) => ({
          ...site,
          issues: site.issues.map((i) =>
            i.id === issue.id
              ? {
                  ...i,
                  recommendedValue: data.fix,
                  plainFix: data.explanation || i.plainFix,
                }
              : i
          ),
        }));
        return data.fix;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Verify Script
  const handleVerifyScript = async () => {
    if (!currentSite) return;
    try {
      await fetch('/api/verify-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: currentSite.url,
          siteId: currentSite.id,
        }),
      });
    } catch {
      // Fallback
    }
    updateCurrentSite((site) => ({
      ...site,
      scriptVerified: true,
      scriptRevoked: false,
    }));
  };

  // 8. Toggle Revoke Access
  const handleToggleRevoke = () => {
    if (!currentSite) return;
    updateCurrentSite((site) => ({
      ...site,
      scriptRevoked: !site.scriptRevoked,
    }));
  };

  // 9. Change Fix Mode
  const handleChangeFixMode = (mode: FixMode) => {
    if (!currentSite) return;
    updateCurrentSite((site) => {
      const updatedSite = { ...site, fixMode: mode };
      if (mode === 'auto') {
        const pendingCritical = site.issues.filter((i) => !i.applied && i.severity === 'critical');
        if (pendingCritical.length > 0) {
          setTimeout(() => handleApplyAllCritical(), 100);
        }
      }
      return updatedSite;
    });
  };

  // 10. Add Site
  const handleAddSite = (newSiteData: Partial<Site>) => {
    const fullSite: Site = {
      id: newSiteData.id || `site-${Date.now()}`,
      name: newSiteData.name || 'New Site',
      url: newSiteData.url || 'https://yoursite.com',
      builder: newSiteData.builder || 'framer',
      scriptVerified: newSiteData.scriptVerified ?? false,
      scriptToken: newSiteData.scriptToken || `rs_live_${Math.random().toString(36).substring(2, 11)}`,
      fixMode: newSiteData.fixMode || 'approve',
      scriptRevoked: newSiteData.scriptRevoked ?? false,
      overallScore: newSiteData.overallScore ?? 54,
      projectedScore: newSiteData.projectedScore ?? 92,
      pagesScanned: newSiteData.pagesScanned ?? 16,
      lastCrawledAt: newSiteData.lastCrawledAt || 'Just now',
      subScores: newSiteData.subScores || {
        technical: 70,
        contentKeywords: 55,
        schemaMeta: 42,
        mediaA11y: 62,
      },
      issues: newSiteData.issues || [],
    };
    setSites((prev) => [fullSite, ...prev]);
    setCurrentSiteId(fullSite.id);
    if (user) {
      saveSiteToFirestore(user.uid, fullSite);
    }
    if (!fullSite.scriptVerified) {
      setScriptModalOpen(true);
    }
  };

  // Seed sample site with real issues & keywords
  const handleSeedDemoSite = () => {
    handleAddSite(DEMO_SEED_SITE);
    setKeywords([
      {
        id: 'kw-demo-1',
        keyword: 'framer ai website builder',
        volume: 8100,
        difficulty: 32,
        intent: 'Commercial',
        cpc: 4.8,
        cluster: 'AI Builders',
        currentRank: 6,
        previousRank: 9,
        rankDelta: 3,
        pageTarget: '/framer-builder',
        impressions: 14200,
        clicks: 860,
      },
      {
        id: 'kw-demo-2',
        keyword: 'ai on page seo automation',
        volume: 3600,
        difficulty: 28,
        intent: 'Transactional',
        cpc: 7.2,
        cluster: 'Automation',
        currentRank: 14,
        previousRank: 6,
        rankDelta: -8, // Dropped > 5!
        pageTarget: '/solutions/automation',
        dropReason: 'H1 tags were replaced during redesign with non-semantic div containers, causing Google to drop query relevance.',
        impressions: 9400,
        clicks: 340,
      },
      {
        id: 'kw-demo-3',
        keyword: 'webflow schema generator',
        volume: 2400,
        difficulty: 22,
        intent: 'Informational',
        cpc: 2.1,
        cluster: 'Schema & Meta',
        currentRank: 19,
        previousRank: 13,
        rankDelta: -6, // Dropped > 5!
        pageTarget: '/tools/schema-builder',
        dropReason: 'Missing Schema.org Organization and BreadcrumbList JSON-LD in head tag after migration.',
        impressions: 4800,
        clicks: 140,
      },
      {
        id: 'kw-demo-4',
        keyword: 'nextjs seo audit tool',
        volume: 5200,
        difficulty: 38,
        intent: 'Transactional',
        cpc: 5.6,
        cluster: 'Automation',
        currentRank: 4,
        previousRank: 4,
        rankDelta: 0,
        pageTarget: '/audit',
        impressions: 18900,
        clicks: 920,
      },
      {
        id: 'kw-demo-5',
        keyword: 'framer meta tags generator',
        volume: 1900,
        difficulty: 19,
        intent: 'Informational',
        cpc: 1.8,
        cluster: 'Schema & Meta',
        currentRank: 3,
        previousRank: 8,
        rankDelta: 5,
        pageTarget: '/meta-tags',
        impressions: 7200,
        clicks: 410,
      },
    ]);
  };

  // 11. Target in AI Blog
  const handleTargetInAI = (kw: string) => {
    setTargetAIKeyword(kw);
    setCurrentTab('content');
  };

  // Count keywords that dropped >5 positions in the last week
  const droppedKeywordsCount = keywords.filter(isKeywordDroppedOver5).length;

  // Tab label mapping for clean breadcrumbs
  const tabTitles: Record<string, string> = {
    overview: 'Score & Real-Time Crawler',
    issues: 'Ranked Issues & Plain-Language Fixes',
    keywords: 'Keywords & SERP Rank Tracking',
    integrations: 'Google Search Console, GBP & IndexNow',
    content: 'AI Blog & Local Business Post Generator',
    changelog: 'Audit Changelog & 1-Click Rollbacks',
    agency: 'Agency Multi-Site & White-Label Portal',
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex selection:bg-sky-500 selection:text-white">
      {/* ============================================================== */}
      {/* LEFT SIDEBAR: Hosts all primary controls, site selector & modes */}
      {/* ============================================================== */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        sites={sites}
        currentSite={currentSite}
        onSelectSite={setCurrentSiteId}
        onOpenAddSite={() => setAddSiteModalOpen(true)}
        onOpenPricing={() => setPricingModalOpen(true)}
        onOpenScriptModal={() => setScriptModalOpen(true)}
        onOpenScriptInspector={() => setScriptInspectorOpen(true)}
        onChangeFixMode={handleChangeFixMode}
        onToggleRevoke={handleToggleRevoke}
        droppedKeywordsCount={droppedKeywordsCount}
        isCrawling={isCrawling}
        onRunCrawl={() => handleRunCrawl()}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* ============================================================== */}
      {/* MAIN VIEWPORT: Creamy white canvas with soft blue gradients     */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Streamlined Top Workspace Bar with Quick Site Search */}
        <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>RichScore</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold">{tabTitles[currentTab] || currentTab}</span>
            </div>

            {currentSite && (
              <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold capitalize">
                  {currentSite.builder.replace('_', ' ')}
                </span>
                {currentSite.scriptVerified ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Active</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setScriptModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span>Unverified</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Search Bar for Finding & Switching Between Managed Sites */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={siteSearchQuery}
                onChange={(e) => {
                  setSiteSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={
                  sites.length > 0
                    ? `Search ${sites.length} managed site${sites.length > 1 ? 's' : ''}...`
                    : 'Search managed sites...'
                }
                className="w-full pl-9 pr-14 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs transition-all font-medium"
              />
              {siteSearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSiteSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-400 font-mono pointer-events-none">
                  <Command className="w-2.5 h-2.5" />
                  <span>K</span>
                </div>
              )}
            </div>

            {/* Dropdown Results for Fast Switching */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>
                    {filteredSites.length} {filteredSites.length === 1 ? 'website' : 'websites'} found
                  </span>
                  <span className="text-[10px] text-slate-400">Esc to close</span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1">
                  {filteredSites.length > 0 ? (
                    filteredSites.map((s) => {
                      const isActive = currentSite?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCurrentSiteId(s.id);
                            setIsSearchOpen(false);
                            setSiteSearchQuery('');
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isActive
                              ? 'bg-sky-50 text-sky-950 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                isActive
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold truncate text-slate-900">{s.name}</span>
                                {isActive && (
                                  <span className="text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded font-bold">
                                    Active
                                  </span>
                                )}
                                {s.scriptVerified ? (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">{s.url}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 capitalize">
                              {s.builder.replace('_', ' ')}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-100/60 px-1.5 py-0.5 rounded">
                              {s.overallScore}/100
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center space-y-2">
                      <p className="text-slate-500 text-xs">
                        No sites matching &ldquo;<span className="font-semibold text-slate-800">{siteSearchQuery}</span>&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setAddSiteModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add new website</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentSite ? (
              <button
                onClick={() => handleRunCrawl()}
                disabled={isCrawling}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isCrawling ? 'Crawling...' : 'Crawl Live Site'}</span>
                <span className="sm:hidden">Crawl</span>
              </button>
            ) : (
              <button
                onClick={handleSeedDemoSite}
                className="px-3 py-1.5 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 text-sky-800 border border-sky-200/80 text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
                title="Populate sample site with real issues and keyword drop tests"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Load Sample Test Site</span>
                <span className="sm:hidden">Sample</span>
              </button>
            )}

            <button
              onClick={() => setAddSiteModalOpen(true)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Add Site</span>
            </button>

            {!user ? (
              <button
                type="button"
                onClick={handleSignIn}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden md:inline max-w-[100px] truncate text-[11px]">
                  {user.displayName || user.email}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <CrawlerScoreView
              site={currentSite}
              onRunCrawl={handleRunCrawl}
              onApplyIssue={handleApplyIssue}
              onApplyAllCritical={handleApplyAllCritical}
              onOpenScriptModal={() => setScriptModalOpen(true)}
              onOpenScriptInspector={() => setScriptInspectorOpen(true)}
              onGoToIssues={() => setCurrentTab('issues')}
              onGoToKeywords={() => setCurrentTab('keywords')}
              onGoToBlogWriter={() => setCurrentTab('content')}
              onOpenAddSite={() => setAddSiteModalOpen(true)}
              onSeedDemoSite={handleSeedDemoSite}
            />
          )}

          {currentTab === 'issues' && (
            <IssueList
              site={currentSite}
              onApplyIssue={handleApplyIssue}
              onRollbackIssue={handleRollbackIssue}
              onRejectIssue={handleRejectIssue}
              onAIFixEnhance={handleAIFixEnhance}
              onOpenAddSite={() => setAddSiteModalOpen(true)}
            />
          )}

          {currentTab === 'keywords' && (
            <KeywordResearchView
              keywords={keywords}
              droppedKeywordsCount={droppedKeywordsCount}
              onTargetInAI={handleTargetInAI}
              onAddKeyword={(newKw) => {
                const fullKw: KeywordData = {
                  id: `kw-${Date.now()}`,
                  keyword: newKw.keyword || 'new keyword',
                  volume: newKw.volume || 2400,
                  difficulty: newKw.difficulty || 28,
                  intent: newKw.intent || 'Commercial',
                  cpc: newKw.cpc || 3.2,
                  cluster: newKw.cluster || 'Target Discovery',
                  currentRank: newKw.currentRank || 14,
                  rankDelta: 2,
                  impressions: newKw.impressions || 8400,
                  clicks: newKw.clicks || 320,
                };
                setKeywords((prev) => [fullKw, ...prev]);
                if (user) {
                  saveKeywordToFirestore(user.uid, fullKw);
                }
              }}
            />
          )}

          {currentTab === 'integrations' && (
            <GoogleIntegrationsView
              site={currentSite}
              onGoToGBPWriter={() => setCurrentTab('content')}
              onOpenAddSite={() => setAddSiteModalOpen(true)}
            />
          )}

          {currentTab === 'content' && (
            <AIBlogWriterView
              site={currentSite}
              initialKeyword={targetAIKeyword}
            />
          )}

          {currentTab === 'changelog' && (
            <ChangelogView
              site={currentSite}
              changelog={changelog}
              onRollback={(log) => handleRollbackIssue(log.issueId)}
              onToggleRevoke={handleToggleRevoke}
            />
          )}

          {currentTab === 'agency' && (
            <AgencyDashboardView
              sites={sites}
              clients={clients}
              keywords={keywords}
              onInviteClient={(c) =>
                setClients((prev) => [
                  {
                    id: `client-${Date.now()}`,
                    name: c.name || 'Client User',
                    email: c.email || 'client@company.com',
                    role: c.role || 'Approver',
                    assignedSites: c.assignedSites || (currentSite ? [currentSite.id] : []),
                    status: 'Active',
                    lastActive: 'Just now',
                  },
                  ...prev,
                ])
              }
            />
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* GLOBAL MODALS                                                  */}
      {/* ============================================================== */}
      {currentSite && (
        <>
          <ScriptModal
            site={currentSite}
            isOpen={scriptModalOpen}
            onClose={() => setScriptModalOpen(false)}
            onVerify={handleVerifyScript}
            onToggleRevoke={handleToggleRevoke}
          />

          <ScriptInspector
            site={currentSite}
            isOpen={scriptInspectorOpen}
            onClose={() => setScriptInspectorOpen(false)}
          />
        </>
      )}

      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        currentPlanId="growth"
        onUpgradePlan={() => {}}
      />

      <AddSiteModal
        isOpen={addSiteModalOpen}
        onClose={() => setAddSiteModalOpen(false)}
        onAddSite={handleAddSite}
      />
    </div>
  );
}
