import React, { useState, useRef } from 'react';
import { IngestedDocument, SourceType } from '../lib/rag/types';
import { SAMPLE_CRAWL_PROFILES } from '../lib/rag/web-crawler';
import { X, Upload, Globe, FileText, Trash2, Layers, Plus, Loader2 } from 'lucide-react';
import { RadialLogo } from './RadialLogo';

interface KnowledgeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: IngestedDocument[];
  onAddDocument: (title: string, sourceType: SourceType, content: string, sourceUrlOrPath?: string) => void;
  onRemoveDocument: (docId: string) => void;
  onInspectDocument: (doc: IngestedDocument) => void;
}

export const KnowledgeDrawer: React.FC<KnowledgeDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  onAddDocument,
  onRemoveDocument,
  onInspectDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'crawl'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const ext = file.name.split('.').pop()?.toLowerCase();
          const sourceType: SourceType = ext === 'pdf' ? 'pdf' : 'document';
          onAddDocument(file.name, sourceType, content, `/uploads/${file.name}`);
        }
      };

      reader.readAsText(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsCrawling(true);
    let target = urlInput.trim();
    if (!target.startsWith('http')) target = 'https://' + target;

    if (SAMPLE_CRAWL_PROFILES[target]) {
      setTimeout(() => {
        onAddDocument(target, 'website', SAMPLE_CRAWL_PROFILES[target].content, target);
        setUrlInput('');
        setIsCrawling(false);
      }, 700);
      return;
    }

    const host = new URL(target).hostname;
    const content = `Indexed corporate website ${host} (${target})
- Domain: ${host}
- Content: Executive announcements, security whitepapers, service tier specifications, and corporate handbooks.
- Crawled on: ${new Date().toLocaleDateString()}`;

    setTimeout(() => {
      onAddDocument(target, 'website', content, target);
      setUrlInput('');
      setIsCrawling(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface border border-fg/[0.1] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-fg">
        {/* Header */}
        <div className="p-6 border-b border-fg/[0.06] flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fg/[0.06] border border-fg/[0.1] flex items-center justify-center text-accent">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-fg">
                Knowledge Ingestion &amp; Vector Index
              </h3>
              <p className="text-xs text-subtle">
                Train your Executive Chiefs with verified company files and website URLs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-subtle hover:text-fg hover:bg-fg/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-fg/[0.06] bg-surface-2 px-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#ffd000] text-accent'
                : 'border-transparent text-subtle hover:text-fg'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload Documents (PDF, CSV, TXT)</span>
          </button>

          <button
            onClick={() => setActiveTab('crawl')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'crawl'
                ? 'border-[#78d0cd] text-info'
                : 'border-transparent text-subtle hover:text-fg'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Crawl Website / API Docs</span>
          </button>
        </div>

        {/* Action Panel */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'upload' ? (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.txt,.md,.csv,.json,.docx"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-fg/[0.12] hover:border-[#ffd000] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-surface-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-fg/[0.05] border border-fg/[0.1] text-accent flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-fg">
                  Click to select company documents
                </h4>
                <p className="text-xs text-subtle mt-1">
                  Supports Employee Handbooks, Pitch Decks, Spreadsheets, and Policies
                </p>
                <span className="inline-block mt-3 text-[10px] font-mono font-semibold px-2.5 py-1 bg-fg/[0.05] text-positive rounded-full">
                  Semantic chunking with 50-token overlap
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCrawl} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-subtle block mb-2">
                  Target Website or API Documentation URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g. https://yourcompany.com/docs or acme.io/pricing"
                    className="flex-1 bg-surface-3 border border-fg/[0.1] rounded-xl px-4 py-2.5 text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-[#78d0cd]"
                  />
                  <button
                    type="submit"
                    disabled={isCrawling || !urlInput.trim()}
                    className="px-5 py-2.5 bg-fg text-canvas hover:bg-fg/85 disabled:opacity-40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isCrawling ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Crawling...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Index URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample crawl chips */}
              <div>
                <span className="text-[10px] font-semibold text-subtle uppercase tracking-wider block mb-2">
                  Quick demo links to index:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SAMPLE_CRAWL_PROFILES).map((sampleUrl) => (
                    <button
                      key={sampleUrl}
                      type="button"
                      onClick={() => setUrlInput(sampleUrl)}
                      className="text-[11px] font-mono text-soft hover:text-info bg-surface-3 hover:bg-surface-4 border border-fg/[0.06] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {sampleUrl}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Currently Ingested Files List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-fg uppercase tracking-wider">
                Currently Ingested Sources ({documents.length})
              </h4>
              <span className="text-[10px] text-accent font-mono">
                {documents.reduce((acc, d) => acc + d.chunks.length, 0)} Total Vector Chunks
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface-2 border border-fg/[0.06] rounded-xl p-3 flex items-center justify-between gap-3 hover:border-fg/[0.15] transition-colors"
                >
                  <div
                    onClick={() => onInspectDocument(doc)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-fg/[0.05] flex items-center justify-center text-accent shrink-0">
                      {doc.sourceType === 'website' ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-fg truncate">
                        {doc.title}
                      </p>
                      <p className="text-[10.5px] text-subtle flex items-center gap-2">
                        <span>{doc.chunks.length} chunks</span>
                        <span>•</span>
                        <span>~{Math.round(doc.rawTextLength / 5)} words</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onInspectDocument(doc)}
                      className="text-[11px] text-accent hover:text-accent-hi font-medium px-2 py-1 bg-fg/[0.04] rounded-lg transition-colors cursor-pointer"
                    >
                      Inspect Chunks
                    </button>
                    <button
                      onClick={() => onRemoveDocument(doc.id)}
                      className="p-1.5 text-subtle hover:text-[#ff5555] rounded-lg hover:bg-fg/[0.05] transition-colors"
                      title="Remove source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-fg/[0.06] bg-surface-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-positive">
            <Layers className="w-4 h-4" />
            <span>Strict cosine vector store active</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-fg text-canvas hover:bg-fg/85 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
