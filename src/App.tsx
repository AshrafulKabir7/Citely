import React, { useState, useMemo } from 'react';
import { Homepage } from './components/Homepage';
import { ExecutiveRail } from './components/ExecutiveRail';
import { ChatsSidebar } from './components/ChatsSidebar';
import { TopicsSidebar } from './components/TopicsSidebar';
import { ExecutiveChat } from './components/ExecutiveChat';
import { KnowledgeDrawer } from './components/KnowledgeDrawer';
import { CitationModal } from './components/CitationModal';
import { ChunkInspectorModal } from './components/ChunkInspectorModal';
import { SettingsPanel } from './components/SettingsPanel';
import { WidgetEmbedModal } from './components/WidgetEmbedModal';
import { DirectoryModal } from './components/DirectoryModal';
import { ProfileModal } from './components/ProfileModal';
import { Toast } from './components/Toast';
import { VectorStore } from './lib/rag/vector-store';
import { chunkDocument } from './lib/rag/chunker';
import { answerQuestion, generateRAGAnswer } from './lib/rag/generator';
import { getInitialIngestedDocuments } from './lib/rag/sample-data';
import { EXECUTIVES } from './lib/rag/executives';
import {
  IngestedDocument,
  SourceType,
  ChatMessage,
  Citation,
  RAGConfig,
  ExecutiveId,
} from './lib/rag/types';

const SEED_QUESTIONS: [ExecutiveId, string][] = [
  ['chief_of_staff', 'How many paid time off days do full-time employees get, and what is the home office stipend?'],
  ['chief_of_engineering', 'What are the API rate limits and how do webhook retries work?'],
  ['chief_of_it', 'What encryption protects our data, and which security certifications do we hold?'],
  ['chief_of_accounts', 'What is the refund policy for new and annual subscriptions?'],
];

/** Opening messages for each executive, answered by the same engine as live questions. */
function seedConversations(documents: IngestedDocument[], config: RAGConfig): Record<ExecutiveId, ChatMessage[]> {
  const store = new VectorStore(documents.flatMap((doc) => doc.chunks));
  const conversations: Record<ExecutiveId, ChatMessage[]> = {
    chief_of_staff: [],
    chief_of_engineering: [],
    chief_of_it: [],
    chief_of_accounts: [],
    boardroom: [],
  };
  for (const [executiveId, question] of SEED_QUESTIONS) {
    const exec = EXECUTIVES.find((e) => e.id === executiveId)!;
    const result = answerQuestion(question, store, { ...config, activeExecutive: executiveId });
    conversations[executiveId] = [
      { id: `seed-${executiveId}-q`, sender: 'user', content: question, timestamp: '9:30 AM', attachedDocuments: [exec.sourceFileFocus] },
      {
        id: `seed-${executiveId}-a`,
        sender: 'assistant',
        content: result.answer,
        timestamp: '9:30 AM',
        citations: result.citations,
        groundingConfidence: result.groundingConfidence,
        retrievedChunksCount: result.retrievedCount,
        trace: result.trace,
        executiveId,
        executiveName: exec.name,
      },
    ];
  }
  return conversations;
}

export function App() {
  // View Mode: 'landing' (Homepage) | 'app' (Executive AI Workspace)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  // Knowledge Base Documents
  const [documents, setDocuments] = useState<IngestedDocument[]>(() =>
    getInitialIngestedDocuments()
  );

  // Active Navigation & Executive
  const [activeRailTab, setActiveRailTab] = useState<string>('chat');
  const [activeCategory, setActiveCategory] = useState<string>('current');
  const [activeExecutiveId, setActiveExecutiveId] = useState<ExecutiveId>('chief_of_staff');
  const [chatsSearchTerm, setChatsSearchTerm] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Bookmarked and Favorited Messages
  const [bookmarkedMessages, setBookmarkedMessages] = useState<ChatMessage[]>([]);

  // RAG Configuration
  const [ragConfig, setRagConfig] = useState<RAGConfig>({
    topK: 4,
    similarityThreshold: 0.18,
    temperature: 0.2,
    activeExecutive: 'chief_of_staff',
    strictGroundingOnly: true,
    provider: 'local_rag',
  });

  // Vector Store instance memoized based on all chunks
  const vectorStore = useMemo(() => {
    const allChunks = documents.flatMap((doc) => doc.chunks);
    return new VectorStore(allChunks);
  }, [documents]);

  // Conversations per executive, opened with one real question answered by the engine.
  const [conversations, setConversations] = useState<Record<ExecutiveId, ChatMessage[]>>(() =>
    seedConversations(documents, ragConfig),
  );

  const [isThinking, setIsThinking] = useState(false);

  // Modals state
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<IngestedDocument | null>(null);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Current active executive object
  const currentExecutive =
    EXECUTIVES.find((e) => e.id === activeExecutiveId) || EXECUTIVES[0];

  // Current conversation messages based on active category
  const currentMessages = useMemo(() => {
    if (activeCategory === 'bookmark') {
      return bookmarkedMessages;
    }
    return conversations[activeExecutiveId] || [];
  }, [activeCategory, bookmarkedMessages, conversations, activeExecutiveId]);

  // Launch App from Homepage with optional Executive and optional initial prompt
  const handleLaunchApp = (executiveId?: ExecutiveId, initialQuery?: string) => {
    const targetExec = executiveId || activeExecutiveId;
    setActiveExecutiveId(targetExec);
    setRagConfig((prev) => ({ ...prev, activeExecutive: targetExec }));
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Entered Executive Workspace — ${EXECUTIVES.find(e => e.id === targetExec)?.name}`);
    if (initialQuery && initialQuery.trim()) {
      setTimeout(() => {
        handleSendMessage(initialQuery.trim());
      }, 150);
    }
  };

  // Switch executive
  const handleSelectExecutive = (execId: ExecutiveId) => {
    setActiveExecutiveId(execId);
    setRagConfig((prev) => ({ ...prev, activeExecutive: execId }));
    setActiveCategory('current');
    showToast(`Switched to ${EXECUTIVES.find((e) => e.id === execId)?.name}`);
  };

  // Add document
  const handleAddDocument = (
    title: string,
    sourceType: SourceType,
    content: string,
    sourceUrlOrPath?: string
  ) => {
    const docId = `doc-${Date.now()}`;
    const chunks = chunkDocument(docId, title, sourceType, content, sourceUrlOrPath);

    const newDoc: IngestedDocument = {
      id: docId,
      title,
      sourceType,
      sourceUrlOrPath,
      rawTextLength: content.length,
      chunkCount: chunks.length,
      createdAt: 'Just now',
      status: 'ready',
      chunks,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Indexed ${title} (${chunks.length} vector chunks)`);
  };

  // Remove document
  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showToast('Removed document from vector index');
  };

  // Inspect document from pill or title
  const handleInspectDocumentTitle = (docTitle: string) => {
    const found = documents.find(
      (d) =>
        d.title.toLowerCase().includes(docTitle.toLowerCase()) ||
        docTitle.toLowerCase().includes(d.title.toLowerCase())
    );
    if (found) {
      setInspectingDoc(found);
    } else {
      setIsKnowledgeOpen(true);
    }
  };

  // Bookmark message
  const handleBookmarkMessage = (msg: ChatMessage) => {
    if (!bookmarkedMessages.some((b) => b.id === msg.id)) {
      setBookmarkedMessages((prev) => [...prev, msg]);
      showToast('Briefing saved to Bookmarks');
    } else {
      showToast('Briefing is already bookmarked');
    }
  };

  // Share topic
  const handleShareTopic = (topicTitle: string) => {
    const url = `${window.location.origin}/#${encodeURIComponent(topicTitle)}`;
    navigator.clipboard.writeText(url);
    showToast(`Copied share link for "${topicTitle}"`);
  };

  // Send message
  const handleSendMessage = async (query: string) => {
    const userMessage: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedDocuments: [currentExecutive.sourceFileFocus],
    };

    setConversations((prev) => ({
      ...prev,
      [activeExecutiveId]: [...(prev[activeExecutiveId] || []), userMessage],
    }));

    setIsThinking(true);

    try {
      const execConfig = { ...ragConfig, activeExecutive: activeExecutiveId };
      const startTime = Date.now();
      const ragResult = await generateRAGAnswer(query, vectorStore, execConfig);
      const elapsed = Date.now() - startTime;
      const minDelay = Math.max(0, 450 - elapsed);

      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: `msg-b-${Date.now()}`,
          sender: 'assistant',
          content: ragResult.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: ragResult.citations,
          groundingConfidence: ragResult.groundingConfidence,
          retrievedChunksCount: ragResult.retrievedCount,
          trace: ragResult.trace,
          executiveId: currentExecutive.id,
          executiveName: currentExecutive.name,
        };

        setConversations((prev) => ({
          ...prev,
          [activeExecutiveId]: [...(prev[activeExecutiveId] || []), botMessage],
        }));
        setIsThinking(false);
      }, minDelay);
    } catch (err) {
      console.error('Error generating answer:', err);
      setIsThinking(false);
    }
  };

  // Filtered executives for search
  const filteredExecutives = useMemo(() => {
    if (!chatsSearchTerm.trim()) return EXECUTIVES;
    return EXECUTIVES.filter(
      (e) =>
        e.name.toLowerCase().includes(chatsSearchTerm.toLowerCase()) ||
        e.department.toLowerCase().includes(chatsSearchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(chatsSearchTerm.toLowerCase())
    );
  }, [chatsSearchTerm]);

  const totalChunks = documents.reduce((acc, d) => acc + d.chunkCount, 0);

  // If in 'landing' mode, display the full homepage!
  if (viewMode === 'landing') {
    return (
      <>
        <Homepage
          onLaunchApp={handleLaunchApp}
          onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        />

        {/* Global Modals accessible from homepage */}
        <KnowledgeDrawer
          isOpen={isKnowledgeOpen}
          onClose={() => setIsKnowledgeOpen(false)}
          documents={documents}
          onAddDocument={handleAddDocument}
          onRemoveDocument={handleRemoveDocument}
          onInspectDocument={(doc) => setInspectingDoc(doc)}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  // Otherwise, display the full-screen 4-column Executive AI Workspace!
  return (
    <div className="executive-app-frame">
      {/* 1. Far-Left Dark Espresso Rail */}
      <ExecutiveRail
        activeTab={activeRailTab}
        onSelectTab={(tab) => {
          setActiveRailTab(tab);
          if (tab === 'saved') {
            setActiveCategory('bookmark');
          } else if (tab === 'chat') {
            setActiveCategory('current');
          } else if (tab === 'executives') {
            setIsDirectoryOpen(true);
          } else if (tab === 'profile') {
            setIsProfileOpen(true);
          }
        }}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHome={() => {
          setViewMode('landing');
          showToast('Returned to Homepage Overview');
        }}
      />

      {/* 2. Chats / Category Sidebar */}
      <ChatsSidebar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (cat === 'trash') {
            showToast('Trash is currently empty');
          } else if (cat === 'unassigned') {
            showToast('No unassigned queries');
          } else if (cat === 'favorites') {
            showToast('Showing favorite conversations');
          }
        }}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
        bookmarkCount={bookmarkedMessages.length}
        trashCount={0}
        searchTerm={chatsSearchTerm}
        onSearchChange={setChatsSearchTerm}
      />

      {/* 3. Topics / Executives Sidebar */}
      <TopicsSidebar
        executives={filteredExecutives}
        activeExecutiveId={activeExecutiveId}
        onSelectExecutive={handleSelectExecutive}
        onOpenNewConversation={() => {
          setConversations((prev) => ({ ...prev, [activeExecutiveId]: [] }));
          showToast(`Started new conversation with ${currentExecutive.name}`);
        }}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onShareTopic={handleShareTopic}
      />

      {/* 4. Main White Chat Card */}
      <ExecutiveChat
        executive={currentExecutive}
        messages={currentMessages}
        isThinking={isThinking}
        onSendMessage={handleSendMessage}
        onSelectCitation={(cite) => setSelectedCitation(cite)}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onBookmarkMessage={handleBookmarkMessage}
        onInspectDocumentTitle={handleInspectDocumentTitle}
        onToast={showToast}
        strictGrounding={ragConfig.strictGroundingOnly}
        onToggleStrict={() => {
          setRagConfig((current) => ({ ...current, strictGroundingOnly: !current.strictGroundingOnly }));
          showToast(ragConfig.strictGroundingOnly ? 'Relaxed grounding: partial matches answered with a warning' : 'Strict grounding: answers need 60% evidence coverage');
        }}
      />

      {/* Modals & Drawers */}
      <KnowledgeDrawer
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
        documents={documents}
        onAddDocument={handleAddDocument}
        onRemoveDocument={handleRemoveDocument}
        onInspectDocument={(doc) => setInspectingDoc(doc)}
      />

      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      <ChunkInspectorModal
        document={inspectingDoc}
        onClose={() => setInspectingDoc(null)}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={ragConfig}
        onChangeConfig={(newCfg) => {
          setRagConfig(newCfg);
          showToast('Updated RAG parameters');
        }}
      />

      <WidgetEmbedModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        activePreset={activeExecutiveId}
      />

      <DirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectTopic={handleSelectExecutive}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        chunkCount={totalChunks}
        docCount={documents.length}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
