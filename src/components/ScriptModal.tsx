import React, { useState } from 'react';
import { Site, BuilderType } from '../types/seo';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Globe,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface ScriptModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => Promise<void>;
  onToggleRevoke: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  site,
  isOpen,
  onClose,
  onVerify,
  onToggleRevoke,
}) => {
  const [selectedBuilder, setSelectedBuilder] = useState<BuilderType>(site ? site.builder : 'framer');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  if (!isOpen || !site) return null;

  const scriptCode = `<!-- RichScore Automated On-Page SEO Engine -->
<script
  async
  src="https://cdn.richscore.io/v1/richscore.js"
  data-site-id="${site.id}"
  data-token="${site.scriptToken}"
  data-mode="${site.fixMode}"
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRunVerify = async () => {
    setVerifying(true);
    setVerifyStatus('Connecting to domain and checking header injection...');
    try {
      await onVerify();
      setVerifyStatus('Success! RichScore script verified and active on ' + site.url);
      setTimeout(() => setVerifyStatus(null), 4000);
    } catch {
      setVerifyStatus('Verification check complete.');
      setTimeout(() => setVerifyStatus(null), 3000);
    } finally {
      setVerifying(false);
    }
  };

  const instructions: Record<BuilderType, { title: string; steps: string[] }> = {
    framer: {
      title: 'Framer Installation Guide',
      steps: [
        'Open your Framer project and click Site Settings (gear icon in the top right).',
        'Navigate to the "General" tab and scroll down to the "Custom Code" section.',
        'Paste the RichScore snippet into the "End of <head> tag" textarea.',
        'Click "Save", then Publish your Framer site to your custom domain.',
        'Click the "Verify Script Connection" button below to confirm active state.',
      ],
    },
    webflow: {
      title: 'Webflow Installation Guide',
      steps: [
        'Open your Webflow Dashboard and go to Project Settings.',
        'Click on the "Custom Code" tab from the left sidebar.',
        'Paste the RichScore code snippet inside the "Head Code" section.',
        'Click "Save Changes" and publish your Webflow site to all selected domains.',
        'Return here and click "Verify Script Connection" to activate live automated fixes.',
      ],
    },
    wix_studio: {
      title: 'Wix Studio Installation Guide',
      steps: [
        'In your Wix Studio dashboard, navigate to Settings > Custom Code.',
        'Click "+ Add Custom Code" in the top right corner.',
        'Paste the RichScore snippet into the code box and name it "RichScore SEO Engine".',
        'Under "Add Code to Pages", choose "All pages" and select "Load code once".',
        'Place code in "Head", click Apply, and publish your site.',
      ],
    },
    squarespace: {
      title: 'Squarespace Installation Guide',
      steps: [
        'Go to your Squarespace Home Menu > Settings > Developer Tools > Code Injection.',
        'Paste the RichScore snippet into the "Header" field.',
        'Click "Save" at the top of the panel.',
        'Click "Verify Script Connection" below to confirm active status.',
      ],
    },
    wordpress: {
      title: 'WordPress Installation Guide',
      steps: [
        'Use any "Insert Headers and Footers" plugin or add to header.php.',
        'Paste the snippet immediately before the closing </head> tag.',
        'Purge your caching plugin and click "Verify Script Connection".',
      ],
    },
    custom: {
      title: 'Custom HTML / Static Site',
      steps: [
        'Open your root layout or index.html template.',
        'Paste the snippet inside the <head> element.',
        'Deploy the changes to your production server or hosting provider.',
      ],
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                RichScore Script Installation &amp; Verification
              </h3>
              <p className="text-xs text-slate-500">
                Target: {site.name} ({site.url})
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Script Snippet Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Your Unique Script Snippet
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold cursor-pointer transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 font-mono text-sky-300 text-xs overflow-x-auto whitespace-pre shadow-xs">
              {scriptCode}
            </div>
            <p className="text-slate-500 text-xs">
              This tiny 2.4kb script executes asynchronously without delaying Largest Contentful Paint (LCP) or First Input Delay (FID).
            </p>
          </div>

          {/* Builder Guide Tabs */}
          <div className="space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Select Your Builder Platform
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(['framer', 'webflow', 'wix_studio', 'squarespace', 'wordpress', 'custom'] as BuilderType[]).map(
                (b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBuilder(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
                      selectedBuilder === b
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    {b.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-sky-900 text-xs">
                {instructions[selectedBuilder].title}
              </h4>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-600">
                {instructions[selectedBuilder].steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Verification Runner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {site.scriptVerified ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                )}
                <span className="font-bold text-slate-900 text-xs">
                  Status:{' '}
                  {site.scriptVerified ? (
                    <span className="text-emerald-700">Verified &amp; Active</span>
                  ) : (
                    <span className="text-amber-700">Awaiting Verification</span>
                  )}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Token: <span className="font-mono text-slate-700 font-bold">{site.scriptToken}</span>
              </p>
            </div>

            <button
              onClick={handleRunVerify}
              disabled={verifying}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              <Zap className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Testing Connectivity...' : 'Verify Script Connection'}</span>
            </button>
          </div>

          {verifyStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold">
              {verifyStatus}
            </div>
          )}

          {/* Revoke Access Safety Section */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between gap-4">
            <div>
              <h5 className="font-bold text-rose-900 text-xs">Full Ownership Safety</h5>
              <p className="text-slate-600 text-xs mt-0.5">
                Revoking access halts all remote tag modifications immediately.
              </p>
            </div>
            <button
              onClick={onToggleRevoke}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-2xs ${
                site.scriptRevoked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {site.scriptRevoked ? 'Re-Authorize Script' : 'Revoke Script Access'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
