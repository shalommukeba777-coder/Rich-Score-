import React, { useState } from 'react';
import { AgencyClient, Site, KeywordData } from '../types/seo';
import {
  Users,
  Building,
  Mail,
  Shield,
  FileCheck,
  Send,
  Eye,
  Plus,
  Check,
  Printer,
  Sparkles,
  Palette,
} from 'lucide-react';

interface AgencyDashboardViewProps {
  sites: Site[];
  clients: AgencyClient[];
  keywords: KeywordData[];
  onInviteClient: (client: Partial<AgencyClient>) => void;
}

export const AgencyDashboardView: React.FC<AgencyDashboardViewProps> = ({
  sites,
  clients,
  keywords,
  onInviteClient,
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'whitelabel' | 'reports'>('clients');

  // Invite Client Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Viewer' | 'Approver' | 'Admin'>('Approver');
  const [inviteSite, setInviteSite] = useState(sites[0]?.id || '');

  // White-label state
  const [agencyName, setAgencyName] = useState('Vance Media Group');
  const [customDomain, setCustomDomain] = useState('seo.vancemediagroup.com');
  const [hideBranding, setHideBranding] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  // Email report modal
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    onInviteClient({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      assignedSites: inviteSite ? [inviteSite] : [],
      status: 'Active',
      lastActive: 'Just now',
    });
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleSaveWhiteLabel = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 max-w-lg text-xs">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'clients' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-600" />
          <span>Client Portals ({clients.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('whitelabel')}
          className={`flex-1 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'whitelabel' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-amber-500" />
          <span>White-Label Branding</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-blue-600" />
          <span>Weekly Email Reports</span>
        </button>
      </div>

      {/* Tab 1: Clients */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Client Access &amp; Approval Roles</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Invite your clients so they can review SEO scores, approve on-page changes, or view white-labeled reports.
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Client User</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">Role &amp; Permissions</th>
                    <th className="py-3.5 px-4">Assigned Websites</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-800">No Client Users Invited Yet</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Click "Invite Client User" to send portal access to your agency clients.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    clients.map((c) => {
                      const assignedSiteNames = c.assignedSites
                        .map((sid) => sites.find((s) => s.id === sid)?.name || sid)
                        .join(', ');

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{c.name}</div>
                            <div className="text-slate-500 text-[11px]">{c.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                c.role === 'Admin'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : c.role === 'Approver'
                                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {c.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                            {assignedSiteNames || 'None'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-700 font-bold font-mono text-[11px]">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {c.lastActive}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: White-label */}
      {activeTab === 'whitelabel' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs max-w-2xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-600" />
              <span>White-Label Customization</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Replace RichScore badges with your own agency branding across client dashboards and exported audit reports.
            </p>
          </div>

          <form onSubmit={handleSaveWhiteLabel} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Agency Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Custom CNAME Domain for Client Portal
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full bg-white font-mono text-sky-800 font-bold border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Point a CNAME record from <code className="text-slate-800">{customDomain}</code> to{' '}
                <code className="text-slate-800">cname.richscore.io</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideBranding}
                  onChange={(e) => setHideBranding(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-900 font-bold">
                  Hide all RichScore branding and watermarks
                </span>
              </label>
              <p className="text-slate-500 text-[11px] pl-6">
                Client users will see "{agencyName}" in page headers, emails, and generated PDF audits.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSettings ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>White-label settings saved successfully!</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Save White-Label Config
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Reports */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Automated Weekly Email Reports</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every Monday morning, your clients receive a formatted email summarizing their website's SEO health score, keyword movements, and active script fixes.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs shadow-2xs">
              <div className="flex justify-between text-slate-600">
                <span>Next Scheduled Dispatch:</span>
                <strong className="text-slate-900 font-mono">Monday, 08:00 AM UTC</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Recipients:</span>
                <strong className="text-slate-900 font-mono">{clients.length} Client Users</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sender Domain:</span>
                <strong className="text-sky-700 font-mono font-bold">reports@{customDomain}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowEmailPreview(true)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview Email Template</span>
              </button>

              <button
                onClick={() => {
                  setEmailSent(true);
                  setTimeout(() => setEmailSent(false), 3000);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{emailSent ? 'Sample Report Sent!' : 'Send Test Report'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 border border-sky-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Client Audit Exporter</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate a clean, high-density SEO audit report formatted for client executive presentations, pitching prospects, or quarterly reviews.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs shadow-2xs">
              <div className="text-sky-900 font-bold">{agencyName} Official Audit</div>
              <p className="text-slate-500">
                Includes full technical breakdown, schema inventory, keyword ranking deltas, and plain-language action log.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print or Save as PDF Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Invite Client Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 space-y-4 text-xs shadow-xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Invite Client to Portal</span>
            </h3>
            <p className="text-slate-500">
              Your client will receive an invitation to access their branded SEO workspace.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="client@company.com"
                  required
                  className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Permission Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-white text-slate-800 font-semibold border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer shadow-2xs"
                >
                  <option value="Approver">Approver (Can review &amp; approve script fixes)</option>
                  <option value="Viewer">Viewer (Read-only reports and score analytics)</option>
                  <option value="Admin">Admin (Full access to crawler and keywords)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Assigned Website</label>
                <select
                  value={inviteSite}
                  onChange={(e) => setInviteSite(e.target.value)}
                  className="w-full bg-white text-slate-800 font-semibold border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer shadow-2xs"
                >
                  {sites.length > 0 ? (
                    sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.url})
                      </option>
                    ))
                  ) : (
                    <option value="">No sites available</option>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Send Client Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Report Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {hideBranding ? agencyName : 'RichScore'} • Weekly SEO Performance Digest
              </span>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="border-b pb-3">
                <h4 className="text-base font-bold text-slate-900">
                  Weekly SEO Health Report
                </h4>
                <p className="text-slate-500 text-[11px]">Audit Period: Past 7 Days</p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Current On-Page Score</span>
                  <div className="text-3xl font-black text-sky-900 font-mono">61 / 100</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px] font-semibold">Target Potential</span>
                  <div className="text-xl font-bold text-emerald-600 font-mono">94 / 100 (+33 pts)</div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowEmailPreview(false)}
                  className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Review Fixes in Client Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
