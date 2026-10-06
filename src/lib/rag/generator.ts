import { VectorStore } from './vector-store';
import { RAGConfig, Citation, SearchResult, ExecutiveId } from './types';
import { EXECUTIVES } from './executives';
import { terms, units } from './text';

export interface GenerationResult {
  answer: string;
  citations: Citation[];
  /** Evidence coverage, 0 to 100: share of the question's terms found in the cited passages. */
  groundingConfidence: number;
  retrievedCount: number;
  /** True when the question was declined because the knowledge base does not cover it. */
  isHallucinationPrevented: boolean;
  executiveId: ExecutiveId;
  executiveName: string;
  trace: string[];
}

/** Minimum evidence coverage for an answer: strict mode needs most of the question covered. */
const MIN_COVERAGE = { strict: 0.6, relaxed: 0.4 };
const MAX_ANSWER_LINES = 3;

const INTRO: Partial<Record<ExecutiveId, string>> = {
  chief_of_staff: 'Chief of Staff',
  chief_of_engineering: 'Chief of Engineering',
  chief_of_it: 'Chief of IT & Security',
  chief_of_accounts: 'Chief of Accounts',
};

function decline(
  query: string,
  store: VectorStore,
  exec: (typeof EXECUTIVES)[number],
  results: SearchResult[],
  trace: string[],
): GenerationResult {
  const topics = [...new Set(store.getAllChunks().map((c) => c.sourceName))].slice(0, 6);
  const closest = results[0];
  const near =
    closest && (closest.coverage ?? 0) >= 0.25
      ? `\n\nThe closest passage is in **${closest.chunk.sourceName}**, but it does not answer this question.`
      : '';
  return {
    answer:
      `I couldn't find "${query}" in the knowledge base, so I won't guess.${near}\n\n` +
      `I can answer questions about:\n${topics.map((t) => `- ${t}`).join('\n')}`,
    citations: [],
    groundingConfidence: Math.round((closest?.coverage ?? 0) * 100),
    retrievedCount: results.length,
    isHallucinationPrevented: true,
    executiveId: exec.id,
    executiveName: exec.name,
    trace,
  };
}

/**
 * Grounded, extractive answering: retrieve passages, check that they actually cover the
 * question, then answer with the most relevant lines from them, each tagged with its
 * citation. Nothing is generated beyond the source text, so every statement is traceable.
 */
export function answerQuestion(query: string, store: VectorStore, config: RAGConfig): GenerationResult {
  const cleanQuery = query.trim();
  const exec = EXECUTIVES.find((e) => e.id === config.activeExecutive) || EXECUTIVES[0];
  const queryTerms = terms(cleanQuery);
  const trace: string[] = [];

  if (!cleanQuery || !queryTerms.length) {
    return {
      answer: `Ask the ${exec.name} a question about the documents in the knowledge base.`,
      citations: [],
      groundingConfidence: 0,
      retrievedCount: 0,
      isHallucinationPrevented: false,
      executiveId: exec.id,
      executiveName: exec.name,
      trace: ['No searchable terms in the question.'],
    };
  }

  const results = store.search(cleanQuery, Math.max(config.topK || 4, 4), 0);
  const minCoverage = config.strictGroundingOnly ? MIN_COVERAGE.strict : MIN_COVERAGE.relaxed;
  trace.push(`Searched ${store.getCount()} passages for: ${queryTerms.join(', ')}`);
  if (results[0]) {
    trace.push(
      `Best passage: ${results[0].chunk.sourceName} (BM25 ${results[0].bm25Score}, cosine ${results[0].cosineScore}, evidence coverage ${Math.round((results[0].coverage ?? 0) * 100)}%)`,
    );
  }

  const best = results[0];
  if (!best || (best.coverage ?? 0) < minCoverage) {
    trace.push(`Declined: evidence coverage below the ${Math.round(minCoverage * 100)}% minimum.`);
    return decline(cleanQuery, store, exec, results, trace);
  }

  // Candidate answer lines from the passages that clear the bar.
  const passages = results.filter(
    (r) => (r.coverage ?? 0) >= minCoverage * 0.75 && r.score >= Math.max(config.similarityThreshold || 0, best.score * 0.6),
  );
  type Line = { text: string; passage: number; order: number; score: number };
  const candidates: Line[] = [];
  passages.forEach((result, passage) => {
    units(result.chunk.content)
      .slice(1) // first unit is the "Document — Section" header
      .forEach((text, order) => {
        const { coverage } = store.coverage(queryTerms, text);
        if (coverage > 0) candidates.push({ text, passage, order, score: coverage + 0.15 * result.score });
      });
  });
  if (!candidates.length) {
    trace.push('Declined: no single line in the passages addresses the question.');
    return decline(cleanQuery, store, exec, results, trace);
  }
  const top = Math.max(...candidates.map((c) => c.score));
  const chosen = candidates
    .filter((c) => c.score >= top * 0.75)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ANSWER_LINES)
    .sort((a, b) => a.passage - b.passage || a.order - b.order);

  // Number citations in the order the answer uses them.
  const used = [...new Set(chosen.map((c) => c.passage))];
  const citations: Citation[] = used.map((passageIndex, i) => {
    const r = passages[passageIndex];
    const body = units(r.chunk.content).slice(1).join(' ');
    return {
      id: `cite-${i + 1}`,
      index: i + 1,
      sourceName: r.chunk.sourceName,
      sourceType: r.chunk.sourceType,
      pageOrUrl: r.chunk.pageOrUrl,
      excerpt: body.length > 320 ? `${body.slice(0, 320).trim()}…` : body,
      similarityScore: Math.round(r.score * 100),
      chunkId: r.chunk.id,
    };
  });

  // A passage's heading ("AcmeCloud API Reference — Rate Limits") is part of its evidence.
  const headers = used.map((p) => units(passages[p].chunk.content)[0] ?? '');
  const evidence = store.coverage(queryTerms, [...headers, ...chosen.map((c) => c.text)].join(' '));
  const section = passages[used[0]].chunk.metadata?.section as string | undefined;
  const intro = `**${section ?? passages[used[0]].chunk.sourceName}** · ${INTRO[exec.id] ?? 'From the knowledge base'}`;
  const lines = chosen.map((c) => `- ${c.text.replace(/\s*\.$/, '.')} [${used.indexOf(c.passage) + 1}]`);
  const gap = evidence.missing.length
    ? `\n\nNot found in the sources: ${evidence.missing.map((m) => `"${m}"`).join(', ')}. Check the cited passages before relying on this.`
    : '';

  trace.push(`Answer built from ${chosen.length} line(s) in ${citations.length} passage(s); nothing added beyond the source text.`);
  trace.push(`Evidence coverage of the answer: ${Math.round(evidence.coverage * 100)}%${evidence.missing.length ? ` (missing: ${evidence.missing.join(', ')})` : ''}.`);

  return {
    answer: `${intro}\n${lines.join('\n')}${gap}`,
    citations,
    groundingConfidence: Math.round(evidence.coverage * 100),
    retrievedCount: results.length,
    isHallucinationPrevented: false,
    executiveId: exec.id,
    executiveName: exec.name,
    trace,
  };
}

/** Async wrapper kept for callers that await a provider; local answering is synchronous. */
export async function generateRAGAnswer(query: string, vectorStore: VectorStore, config: RAGConfig): Promise<GenerationResult> {
  return answerQuestion(query, vectorStore, config);
}
