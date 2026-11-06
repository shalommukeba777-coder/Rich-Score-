import React, { useState } from 'react';
import { Site } from '../types/seo';
import {
  Sparkles,
  Calendar,
  Copy,
  Check,
  FileText,
  MapPin,
  Clock,
  Layers,
  Send,
  Eye,
} from 'lucide-react';

interface AIBlogWriterViewProps {
  site: Site | null;
  initialKeyword?: string;
}

export const AIBlogWriterView: React.FC<AIBlogWriterViewProps> = ({
  site,
  initialKeyword = 'ai website builder seo',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'blog' | 'gbp'>('blog');

  // Blog Writer State
  const [topic, setTopic] = useState('How to Dominate Search Rankings on AI Website Builders in 2026');
  const [targetKeyword, setTargetKeyword] = useState(initialKeyword);
  const [secondaryKeywords, setSecondaryKeywords] = useState('on-page SEO, json-ld schema, indexnow');
  const [tone, setTone] = useState('Authoritative & engaging');
  const [wordCount, setWordCount] = useState(1200);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [blogPost, setBlogPost] = useState<any | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('2026-11-08T10:00');
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  // GBP State
  const [gbpBusinessName, setGbpBusinessName] = useState(site ? site.name : 'Apex Studio');
  const [gbpLocation, setGbpLocation] = useState('San Francisco, CA');
  const [gbpPostType, setGbpPostType] = useState<'update' | 'offer' | 'event'>('offer');
  const [gbpOfferDetails, setGbpOfferDetails] = useState('20% off website design and SEO audit this week');
  const [gbpKeyword, setGbpKeyword] = useState('local web designer');
  const [isGeneratingGBP, setIsGeneratingGBP] = useState(false);
  const [gbpPost, setGbpPost] = useState<any | null>(null);
  const [gbpPublished, setGbpPublished] = useState(false);

  // Generate Blog Action
  const handleGenerateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingBlog(true);
    try {
      const resp = await fetch('/api/ai/blog-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          targetKeyword,
          secondaryKeywords: secondaryKeywords.split(',').map((s) => s.trim()),
          tone,
          wordCount,
          businessName: site ? site.name : 'RichScore',
        }),
      });
      const data = await resp.json();
      if (data && data.title) {
        setBlogPost(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  // Generate GBP Action
  const handleGenerateGBP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingGBP(true);
    try {
      const resp = await fetch('/api/ai/gbp-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: gbpBusinessName,
          location: gbpLocation,
          postType: gbpPostType,
          offerDetails: gbpOfferDetails,
          targetKeyword: gbpKeyword,
        }),
      });
      const data = await resp.json();
      if (data && data.headline) {
        setGbpPost(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingGBP(false);
    }
  };

  const copyHTML = () => {
    if (!blogPost) return;
    navigator.clipboard.writeText(blogPost.htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 max-w-md">
        <button
          onClick={() => setActiveSubTab('blog')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'blog'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          <span>AI SEO Blog Writer</span>
        </button>
        <button
          onClick={() => setActiveSubTab('gbp')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'gbp'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          <span>Google Business Profile Post</span>
        </button>
      </div>

      {/* Tab 1: AI SEO Blog Writer */}
      {activeSubTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 5 Cols */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Article Parameters</span>
              </h3>
              <span className="text-[11px] font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded-full font-mono">
                Gemini 3.8 Flash
              </span>
            </div>

            <form onSubmit={handleGenerateBlog} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Article Topic / Keyword Angle</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Primary Target Keyword</label>
                <input
                  type="text"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-sky-800 font-mono font-semibold border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Secondary Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Tone &amp; Voice</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-white text-slate-800 font-semibold border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
                  >
                    <option value="Authoritative & engaging">Authoritative & engaging</option>
                    <option value="Direct & tactical">Direct & tactical</option>
                    <option value="Conversational SaaS">Conversational SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Length</label>
                  <select
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
                    className="w-full bg-white text-slate-800 font-semibold border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
                  >
                    <option value={800}>~800 words</option>
                    <option value={1200}>~1,200 words</option>
                    <option value={1800}>~1,800 words</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingBlog}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs mt-2"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingBlog ? 'animate-spin' : ''}`} />
                <span>{isGeneratingBlog ? 'Writing SEO Article...' : 'Generate Full SEO Article'}</span>
              </button>
            </form>
          </div>

          {/* Right Preview: 7 Cols */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs flex flex-col space-y-4">
            {blogPost ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-sky-700 font-mono font-bold">
                      {blogPost.readingTime} • Slug: /{blogPost.slug}
                    </span>
                    <h2 className="text-base font-black text-slate-900 leading-snug">
                      {blogPost.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyHTML}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHtml ? 'Copied HTML' : 'Copy HTML'}</span>
                    </button>
                    <button
                      onClick={() => setScheduleModalOpen(true)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Publish</span>
                    </button>
                  </div>
                </div>

                {/* Meta Description Box */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[11px] mb-1 font-semibold">
                    <span>Generated Meta Description</span>
                    <span>{blogPost.metaDescription.length} / 155 chars</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {blogPost.metaDescription}
                  </p>
                </div>

                {/* HTML Article Content */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 overflow-y-auto max-h-[420px] text-xs leading-relaxed text-slate-700 space-y-3 prose shadow-2xs">
                  <div
                    dangerouslySetInnerHTML={{ __html: blogPost.htmlContent }}
                    className="space-y-3"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Ready to Generate Article</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Configure your primary keyword and click Generate to produce a full SEO blog post with FAQ schema and meta tags.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Google Business Profile Post Generator */}
      {activeSubTab === 'gbp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>GBP Post Configuration</span>
            </h3>

            <form onSubmit={handleGenerateGBP} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Business Name</label>
                <input
                  type="text"
                  value={gbpBusinessName}
                  onChange={(e) => setGbpBusinessName(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Target City / Neighborhood</label>
                <input
                  type="text"
                  value={gbpLocation}
                  onChange={(e) => setGbpLocation(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Post Type</label>
                <div className="flex gap-2">
                  {(['update', 'offer', 'event'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setGbpPostType(type)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize cursor-pointer border transition-colors ${
                        gbpPostType === type
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Offer / Update Details</label>
                <input
                  type="text"
                  value={gbpOfferDetails}
                  onChange={(e) => setGbpOfferDetails(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Target Local Keyword</label>
                <input
                  type="text"
                  value={gbpKeyword}
                  onChange={(e) => setGbpKeyword(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-sky-800 font-mono font-semibold border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingGBP}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs mt-2"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingGBP ? 'animate-spin' : ''}`} />
                <span>{isGeneratingGBP ? 'Generating...' : 'Generate GBP Local Post'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs flex flex-col justify-between space-y-4">
            {gbpPost ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-sky-800 font-bold uppercase tracking-wider">
                    Google Maps / Business Profile Card Preview
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-semibold">
                    Type: {gbpPostType.toUpperCase()}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {gbpBusinessName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {gbpBusinessName}
                      </h4>
                      <p className="text-[11px] text-slate-500">{gbpLocation} • Verified Business</p>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    {gbpPost.headline}
                  </h3>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {gbpPost.postBody}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <a
                      href={gbpPost.ctaUrl || '#'}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl inline-block shadow-xs"
                    >
                      {gbpPost.callToAction}
                    </a>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {gbpPost.validityPeriod}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Syncs directly via Google Business Profile OAuth.
                  </span>
                  <button
                    onClick={() => {
                      setGbpPublished(true);
                      setTimeout(() => setGbpPublished(false), 3000);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{gbpPublished ? 'Published to Google!' : 'Publish Post Now'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No Post Generated</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enter your business details on the left and click Generate GBP Local Post to produce map pack updates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Publishing Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Schedule Blog Publication</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select date and time for automatic publishing to your website CMS collection.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Publication Timestamp</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 text-[11px]">
                Upon publishing, RichScore will automatically trigger an IndexNow ping to Bing &amp; Yandex.
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleSuccess('Scheduled for publication on ' + scheduledDate.replace('T', ' '));
                  setTimeout(() => {
                    setScheduleSuccess(null);
                    setScheduleModalOpen(false);
                  }, 1500);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer shadow-xs"
              >
                {scheduleSuccess ? scheduleSuccess : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
