import React, { useState } from 'react';
import { X, Search, Check, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { ExecutiveId } from '../lib/rag/types';

interface TopicCatalogItem {
  id: string;
  executiveId: ExecutiveId;
  title: string;
  department: string;
  sourceDoc: string;
  badge: string;
  isVerified: boolean;
}

const ALL_TOPICS: TopicCatalogItem[] = [
  { id: 't1', executiveId: 'chief_of_staff', title: 'Mental Health & Employee Wellbeing', department: 'People Ops', sourceDoc: 'Nexus_Employee_Handbook_v4.pdf', badge: '8', isVerified: true },
  { id: 't2', executiveId: 'chief_of_staff', title: 'Paid Time Off & Parental Leave', department: 'People Ops', sourceDoc: 'Nexus_Employee_Handbook_v4.pdf', badge: '12', isVerified: true },
  { id: 't3', executiveId: 'chief_of_staff', title: 'Remote Work & Hardware Stipend', department: 'Operations', sourceDoc: 'Nexus_Employee_Handbook_v4.pdf', badge: '4', isVerified: true },
  { id: 't4', executiveId: 'chief_of_engineering', title: 'REST API Authentication & Tokens', department: 'Engineering', sourceDoc: 'acmecloud.io/api-docs', badge: '7', isVerified: true },
  { id: 't5', executiveId: 'chief_of_engineering', title: 'Rate Limiting & Burst Quotas', department: 'Engineering', sourceDoc: 'acmecloud.io/api-docs', badge: '5', isVerified: true },
  { id: 't6', executiveId: 'chief_of_engineering', title: 'Webhook Retries & Dead Letter Queue', department: 'Engineering', sourceDoc: 'acmecloud.io/api-docs', badge: '3', isVerified: true },
  { id: 't7', executiveId: 'chief_of_it', title: 'SOC-2 Type II Compliance & Audit', department: 'IT & Security', sourceDoc: 'acmecloud.io/security', badge: '9', isVerified: true },
  { id: 't8', executiveId: 'chief_of_it', title: 'TLS 1.3 & AES-256 Data Encryption', department: 'IT & Security', sourceDoc: 'acmecloud.io/security', badge: '6', isVerified: true },
  { id: 't9', executiveId: 'chief_of_it', title: 'SAML SSO & FIDO2 Multi-Factor Auth', department: 'IT & Security', sourceDoc: 'acmecloud.io/security', badge: '4', isVerified: true },
  { id: 't10', executiveId: 'chief_of_accounts', title: 'SaaS Subscription Pricing Tiers', department: 'Finance', sourceDoc: 'AcmeCloud_Pricing_SLA_2026.pdf', badge: '2', isVerified: true },
  { id: 't11', executiveId: 'chief_of_accounts', title: '14-Day Money-Back & Refund Terms', department: 'Finance', sourceDoc: 'AcmeCloud_Pricing_SLA_2026.pdf', badge: '1', isVerified: true },
  { id: 't12', executiveId: 'chief_of_accounts', title: '99.999% SLA Uptime Guarantees', department: 'Finance', sourceDoc: 'AcmeCloud_Pricing_SLA_2026.pdf', badge: '3', isVerified: true },
  { id: 't13', executiveId: 'chief_of_accounts', title: '30-Day Hardware Returns & RMA', department: 'Commercial', sourceDoc: 'NovaTech_Warranty_Returns_FAQ.md', badge: '5', isVerified: true },
];

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (execId: ExecutiveId) => void;
}

export const DirectoryModal: React.FC<DirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = ALL_TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceDoc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface border border-fg/[0.1] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-fg">
        {/* Header */}
        <div className="p-6 border-b border-fg/[0.06] flex items-center justify-between bg-surface-2">
          <div>
            <h3 className="text-base font-semibold text-fg flex items-center gap-2">
              Corporate Knowledge Directory
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fg/[0.05] text-accent">
                {ALL_TOPICS.length} Topics Indexed
              </span>
            </h3>
            <p className="text-xs text-subtle">
              Search verified enterprise subjects and jump directly to the responsible Executive
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-subtle hover:text-fg hover:bg-fg/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-fg/[0.06] bg-surface-2">
          <div className="flex items-center gap-2 bg-surface-3 border border-fg/[0.1] rounded-xl px-3.5 py-2">
            <Search className="w-4 h-4 text-subtle" />
            <input
              type="text"
              placeholder="Filter topics by title, department, or source file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-fg placeholder:text-subtle focus:outline-none flex-1"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
          {filtered.map((topic) => (
            <div
              key={topic.id}
              onClick={() => {
                onSelectTopic(topic.executiveId);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-fg/[0.06] bg-surface-2 hover:bg-surface-3 hover:border-fg/[0.15] transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-fg group-hover:text-accent transition-colors truncate">
                    {topic.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-fg/[0.05] text-subtle">
                    {topic.department}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-subtle truncate">
                  <FileText className="w-3 h-3 text-accent" />
                  <span className="truncate">{topic.sourceDoc}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-positive flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
                <ArrowRight className="w-4 h-4 text-subtle group-hover:text-fg transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-fg/[0.06] bg-surface-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-fg text-canvas hover:bg-fg/85 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
