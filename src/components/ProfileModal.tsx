import React from 'react';
import { X, Shield, Database, Cpu, Building2, CheckCircle2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  chunkCount: number;
  docCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  chunkCount,
  docCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface border border-fg/[0.1] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-fg">
        {/* Header */}
        <div className="p-6 border-b border-fg/[0.06] flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-surface-3 border border-fg/20 text-fg flex items-center justify-center font-bold text-sm shadow-md">
              AK
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">Ashraful Kabir Alif</h3>
              <p className="text-xs text-subtle">Executive Workspace Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-subtle hover:text-fg hover:bg-fg/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-surface-2 border border-fg/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-subtle flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-accent" /> Organization
              </span>
              <span className="font-semibold text-fg">Acme Global Enterprises</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-subtle flex items-center gap-1.5 font-medium">
                <Shield className="w-4 h-4 text-positive" /> Compliance
              </span>
              <span className="font-semibold text-positive flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SOC-2 Type II Verified
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-subtle flex items-center gap-1.5 font-medium">
                <Database className="w-4 h-4 text-info" /> Vector Storage
              </span>
              <span className="font-semibold text-fg font-mono">
                {docCount} Sources • {chunkCount} Chunks
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-subtle flex items-center gap-1.5 font-medium">
                <Cpu className="w-4 h-4 text-accent" /> Active AI Chiefs
              </span>
              <span className="font-semibold text-positive">4 Online &amp; Grounded</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#86ca8a]/10 border border-[#86ca8a]/20 text-positive text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All inquiries are strictly encrypted with customer-managed keys.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-fg/[0.06] bg-surface-2 flex justify-end">
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
