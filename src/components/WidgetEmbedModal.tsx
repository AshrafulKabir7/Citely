import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, Globe, Layers } from 'lucide-react';

interface WidgetEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: string;
}

export const WidgetEmbedModal: React.FC<WidgetEmbedModalProps> = ({
  isOpen,
  onClose,
  activePreset,
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'iframe' | 'api'>('script');

  if (!isOpen) return null;

  const scriptCode = `<!-- Citely Floating Website AI Assistant -->
<script
  src="https://chat.your-domain.com/widget.js"
  data-agent-id="citely_${activePreset}_v1"
  data-theme="dark"
  data-primary-color="#ffd000"
  data-greeting="Hi! Ask me anything about our company products, pricing, or policies."
  defer>
</script>`;

  const iframeCode = `<iframe
  src="https://chat.your-domain.com/embed/${activePreset}"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);"
  allow="clipboard-write">
</iframe>`;

  const apiPythonCode = `import requests

# Query your custom Citely knowledge base via REST API
response = requests.post(
    "https://chat.your-domain.com/api/query",
    headers={"Authorization": "Bearer YOUR_API_SECRET_KEY"},
    json={
        "query": "What is the return policy?",
        "top_k": 4,
        "strict_grounding": True
    }
)

result = response.json()
print("Answer:", result["answer"])
print("Citations:", result["citations"])
print("Grounding Score:", result["confidence"])`;

  const handleCopy = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface border border-fg/[0.1] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-fg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-fg/[0.06] flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fg/[0.06] border border-fg/[0.1] text-info flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">Embed &amp; Integrate Your RAG Chatbot</h3>
              <p className="text-xs text-subtle">Deploy to any WordPress, Shopify, Next.js, or custom app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-subtle hover:text-fg hover:bg-fg/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-fg/[0.06] bg-surface-2 text-xs px-6 pt-2">
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'script'
                ? 'border-[#ffd000] text-accent'
                : 'border-transparent text-subtle hover:text-fg'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Website Script Widget
          </button>
          <button
            onClick={() => setActiveTab('iframe')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'iframe'
                ? 'border-[#ffd000] text-accent'
                : 'border-transparent text-subtle hover:text-fg'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Embedded Iframe
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'api'
                ? 'border-[#ffd000] text-accent'
                : 'border-transparent text-subtle hover:text-fg'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Python / REST API
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'script' && (
            <div>
              <p className="text-xs text-soft mb-2">
                Paste this script before the closing <code className="text-accent font-mono text-[11px]">&lt;/body&gt;</code> tag of your website:
              </p>
              <div className="relative bg-surface-3 border border-fg/[0.06] rounded-xl p-3 font-mono text-xs text-fg overflow-x-auto">
                <button
                  onClick={() => handleCopy(scriptCode, 'script')}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-fg/[0.08] hover:bg-fg/[0.15] text-fg text-[10px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedTab === 'script' ? <Check className="w-3 h-3 text-positive" /> : <Copy className="w-3 h-3" />}
                  {copiedTab === 'script' ? 'Copied' : 'Copy'}
                </button>
                <pre>{scriptCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'iframe' && (
            <div>
              <p className="text-xs text-soft mb-2">
                Embed the full knowledge-base assistant directly inside a dedicated support or internal page:
              </p>
              <div className="relative bg-surface-3 border border-fg/[0.06] rounded-xl p-3 font-mono text-xs text-fg overflow-x-auto">
                <button
                  onClick={() => handleCopy(iframeCode, 'iframe')}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-fg/[0.08] hover:bg-fg/[0.15] text-fg text-[10px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedTab === 'iframe' ? <Check className="w-3 h-3 text-positive" /> : <Copy className="w-3 h-3" />}
                  {copiedTab === 'iframe' ? 'Copied' : 'Copy'}
                </button>
                <pre>{iframeCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <p className="text-xs text-soft mb-2">
                Integrate with your existing backend, WhatsApp bot, or Slack workspace using the Python / REST API:
              </p>
              <div className="relative bg-surface-3 border border-fg/[0.06] rounded-xl p-3 font-mono text-xs text-fg overflow-x-auto">
                <button
                  onClick={() => handleCopy(apiPythonCode, 'api')}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-fg/[0.08] hover:bg-fg/[0.15] text-fg text-[10px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedTab === 'api' ? <Check className="w-3 h-3 text-positive" /> : <Copy className="w-3 h-3" />}
                  {copiedTab === 'api' ? 'Copied' : 'Copy'}
                </button>
                <pre>{apiPythonCode}</pre>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 rounded-xl bg-fg/[0.04] border border-fg/[0.06] text-xs text-muted flex items-center gap-2">
            <span>💡 <strong>Live Test Available:</strong> Tested and verified on modern browsers, React, Shopify, and WordPress.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-fg/[0.06] bg-surface-2 flex justify-end">
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
