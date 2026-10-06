export type SourceType = 'pdf' | 'document' | 'website' | 'faq' | 'manual';

export interface DocumentChunk {
  id: string;
  documentId: string;
  sourceName: string;
  sourceType: SourceType;
  content: string;
  pageOrUrl?: string;
  chunkIndex: number;
  tokensEstimate: number;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface IngestedDocument {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceUrlOrPath?: string;
  fileSize?: string;
  rawTextLength: number;
  chunkCount: number;
  createdAt: string;
  status: 'indexing' | 'ready' | 'error';
  chunks: DocumentChunk[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  /** Absolute relevance, 0 to 1: 0.75 x evidence coverage + 0.25 x cosine similarity. */
  score: number;
  bm25Score?: number;
  cosineScore?: number;
  /** IDF-weighted share of the question's terms found in this chunk, 0 to 1. */
  coverage?: number;
  missingTerms?: string[];
}

export interface Citation {
  id: string;
  index: number;
  sourceName: string;
  sourceType: SourceType;
  pageOrUrl?: string;
  excerpt: string;
  similarityScore: number;
  chunkId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  executiveId?: string;
  executiveName?: string;
  attachedDocuments?: string[];
  citations?: Citation[];
  /** Evidence coverage of the answer, 0 to 100: share of the question's terms found in the cited passages. */
  groundingConfidence?: number;
  /** What retrieval actually did for this answer, shown in the "How this was answered" panel. */
  trace?: string[];
  isStreaming?: boolean;
  retrievedChunksCount?: number;
}

export type ExecutiveId =
  | 'chief_of_staff'
  | 'chief_of_engineering'
  | 'chief_of_it'
  | 'chief_of_accounts'
  | 'boardroom';

export interface ExecutiveDefinition {
  id: ExecutiveId;
  name: string;
  role: string;
  department: string;
  badge: string;
  badgeType: 'count' | 'check';
  iconType: 'shield' | 'terminal' | 'server' | 'chart' | 'briefcase';
  color: string;
  description: string;
  sourceFileFocus: string;
  samplePrompts: string[];
}

export interface RAGConfig {
  topK: number;
  similarityThreshold: number;
  temperature: number;
  activeExecutive: ExecutiveId;
  strictGroundingOnly: boolean; // anti-hallucination flag
  apiKey?: string;
  provider: 'local_rag' | 'openai' | 'gemini';
}
