import React, { useState } from 'react';
import { Site } from '../types/seo';
import { X, Code2, Eye, ShieldCheck, Terminal, Sparkles, Layers } from 'lucide-react';

interface ScriptInspectorProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptInspector: React.FC<ScriptInspectorProps> = ({ site, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dom' | 'schema' | 'logs'>('dom');

  if (!isOpen || !site) return null;

  const appliedCount = site.issues.filter((i) => i.applied).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                RichScore Script DOM Runtime Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Live simulation of client-side overrides on {site.url}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/50 text-xs">
          <button
            onClick={() => setActiveTab('dom')}
            className={`pb-2.5 px-3 font-bold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'dom'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Virtual &lt;head&gt; Injections ({appliedCount} active)</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 font-bold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>JSON-LD Schema Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 px-3 font-bold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Runtime Execution Logs</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          {activeTab === 'dom' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-slate-400 text-xs">
                  // Simulated document.head after RichScore hydration
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-emerald-300">
                  <span className="text-slate-400">&lt;!-- Dynamic Title Override --&gt;</span>
                  <br />
                  &lt;title&gt;Apex Studio — AI Web Design Agency &amp; Framer Development Suite&lt;/title&gt;
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-emerald-300">
                  <span className="text-slate-400">&lt;!-- Dynamic Meta Description --&gt;</span>
                  <br />
                  &lt;meta name="description" content="Elevate your digital brand with Apex Studio. We design high-converting Framer websites with automated on-page SEO."&gt;
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-emerald-300">
                  <span className="text-slate-400">&lt;!-- MutationObserver: Auto-injected missing alt tags --&gt;</span>
                  <br />
                  document.querySelectorAll('img:not([alt])').forEach(img =&gt; img.setAttribute('alt', ...));
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-amber-300 overflow-x-auto whitespace-pre">
              {`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "${site.url}/#organization",
      "name": "${site.name}",
      "url": "${site.url}",
      "logo": "${site.url}/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "${site.url}/#website",
      "url": "${site.url}",
      "name": "${site.name}",
      "publisher": { "@id": "${site.url}/#organization" }
    }
  ]
}`}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-slate-300 text-xs">
              <p className="text-emerald-400">[0.02ms] richscore.js initialized: site_id={site.id}</p>
              <p className="text-slate-400">[0.05ms] mode: {site.fixMode.toUpperCase()} | rules fetched: 5</p>
              <p className="text-slate-300">[0.12ms] overriding document.title: "Home | ${site.name}"</p>
              <p className="text-slate-300">[0.18ms] injecting meta[name="description"] (152 chars)</p>
              <p className="text-slate-300">[0.24ms] mounting JSON-LD &lt;script type="application/ld+json"&gt; schema graph</p>
              <p className="text-emerald-400">[0.38ms] execution complete. Total DOM latency: 0.38ms (zero LCP penalty)</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Target Builder: <strong className="text-slate-900 capitalize">{site.builder}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-2xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
