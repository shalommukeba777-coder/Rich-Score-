import React, { useState } from 'react';
import { BuilderType, Site } from '../types/seo';
import { X, Globe, Sparkles, ArrowRight } from 'lucide-react';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSite: (site: Partial<Site>) => void;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({ isOpen, onClose, onAddSite }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [builder, setBuilder] = useState<BuilderType>('framer');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    onAddSite({
      name: name.trim(),
      url: normalizedUrl,
      builder,
      scriptVerified: false,
      scriptToken: `rs_live_${Math.random().toString(36).substring(2, 11)}`,
      fixMode: 'approve',
      scriptRevoked: false,
      overallScore: 54,
      projectedScore: 92,
      pagesScanned: 14,
      lastCrawledAt: 'Just now',
      subScores: {
        technical: 68,
        contentKeywords: 54,
        schemaMeta: 39,
        mediaA11y: 60,
      },
      issues: [
        {
          id: `iss-${Date.now()}-1`,
          category: 'schema_meta',
          type: 'title',
          page: '/',
          severity: 'critical',
          title: 'Missing Keyword-Rich Title Tag',
          description: `The current title is default "${name.trim()}". Lacks primary target service query.`,
          impact: '+8 Pts SEO',
          currentValue: `${name.trim()} — Home`,
          recommendedValue: `${name.trim()} — Leading AI Solutions & Modern Web Platform`,
          plainFix: 'Inject an optimized title tag under 60 characters with primary brand and search keywords.',
          applied: false,
          status: 'pending',
        },
        {
          id: `iss-${Date.now()}-2`,
          category: 'schema_meta',
          type: 'json_ld',
          page: '/',
          severity: 'high',
          title: 'No Schema.org Structured Data Detected',
          description: 'Search engines cannot parse organizational info without JSON-LD.',
          impact: '+7 Pts SEO',
          currentValue: 'None',
          recommendedValue: JSON.stringify(
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: name.trim(),
              url: normalizedUrl,
            },
            null,
            2
          ),
          plainFix: 'Inject standard Schema.org Organization structured data.',
          applied: false,
          status: 'pending',
        },
      ],
    });

    setName('');
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Website</h3>
              <p className="text-[11px] text-slate-500">Connect and audit any AI builder website</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Website or Brand Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lumina Studio"
              required
              className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Production URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://lumina.framer.app or custom domain"
              required
              className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Builder Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {(['framer', 'webflow', 'wix_studio', 'squarespace', 'wordpress', 'custom'] as BuilderType[]).map(
                (b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBuilder(b)}
                    className={`py-2 px-2 text-[11px] font-semibold rounded-xl capitalize border cursor-pointer transition-all ${
                      builder === b
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {b.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/40 to-white border border-sky-100 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              Once added, RichScore generates your secure verification snippet and initiates an on-page crawl across titles, meta tags, headers, and schemas.
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
            >
              <span>Add &amp; Run Crawler</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
