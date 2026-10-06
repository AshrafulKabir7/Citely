import { DocumentChunk, SearchResult } from './types';
import { generateLocalEmbedding, cosineSimilarity } from './embeddings';
import { expand, termMatches, terms } from './text';

const K1 = 1.2;
const B = 0.75;

type Indexed = { chunk: DocumentChunk; tf: Map<string, number>; length: number };

/**
 * Hybrid retriever over document chunks.
 *
 * - Okapi BM25 (k1 = 1.2, b = 0.75) ranks by keyword relevance with IDF weighting.
 * - Hashed n-gram vectors (cosine) add fuzzy matching for typos and word variants.
 * - Evidence coverage, the IDF-weighted share of the question's terms found in a chunk
 *   (synonyms included), is an absolute 0..1 signal that does not depend on the other
 *   chunks, so it can decide whether the knowledge base answers the question at all.
 */
export class VectorStore {
  private items: Indexed[] = [];
  private df = new Map<string, number>();
  private totalLength = 0;

  constructor(initialChunks: DocumentChunk[] = []) {
    this.addChunks(initialChunks);
  }

  public addChunks(newChunks: DocumentChunk[]): void {
    for (const chunk of newChunks) {
      if (!chunk.embedding || chunk.embedding.length === 0) {
        chunk.embedding = generateLocalEmbedding(chunk.content);
      }
      const tokens = terms(chunk.content);
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      this.items.push({ chunk, tf, length: tokens.length });
      this.totalLength += tokens.length;
    }
  }

  public removeByDocumentId(documentId: string): void {
    const keep = this.items.filter((i) => i.chunk.documentId !== documentId);
    this.clear();
    this.addChunks(keep.map((i) => i.chunk));
  }

  public clear(): void {
    this.items = [];
    this.df.clear();
    this.totalLength = 0;
  }

  public getCount(): number {
    return this.items.length;
  }

  public getAllChunks(): DocumentChunk[] {
    return this.items.map((i) => i.chunk);
  }

  /** IDF with +1 smoothing; terms absent from the corpus get the highest weight. */
  public idf(term: string): number {
    const n = this.items.length || 1;
    const df = this.df.get(term) ?? 0;
    return Math.log(1 + (n - df + 0.5) / (df + 0.5));
  }

  /** IDF-weighted share of the query's terms present in a piece of text (0..1), plus which terms were missing. */
  public coverage(queryTerms: string[], text: string | Map<string, number>): { coverage: number; missing: string[] } {
    const docTerms = text instanceof Map ? [...text.keys()] : terms(text);
    let total = 0;
    let found = 0;
    const missing: string[] = [];
    for (const q of new Set(queryTerms)) {
      const weight = this.idf(q);
      total += weight;
      const alternatives = expand(q);
      if (docTerms.some((d) => termMatches(q, d, alternatives))) found += weight;
      else missing.push(q);
    }
    return { coverage: total ? found / total : 0, missing };
  }

  /**
   * Returns up to topK chunks ranked by BM25 (plus a small vector-similarity term).
   * `score` is the absolute relevance used for display and gating:
   * 0.75 x evidence coverage + 0.25 x cosine similarity.
   */
  public search(query: string, topK: number = 4, threshold: number = 0.25): SearchResult[] {
    if (!query.trim() || this.items.length === 0) return [];
    const queryTerms = terms(query);
    const queryVector = generateLocalEmbedding(query);
    const avgLength = this.totalLength / this.items.length || 1;

    const scored = this.items.map((item) => {
      let bm25 = 0;
      for (const q of new Set(queryTerms)) {
        const alternatives = expand(q);
        let tf = 0;
        for (const [term, count] of item.tf) if (termMatches(q, term, alternatives)) tf += count;
        if (!tf) continue;
        bm25 += this.idf(q) * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * item.length) / avgLength)));
      }
      const cosine = item.chunk.embedding ? cosineSimilarity(queryVector, item.chunk.embedding) : 0;
      const { coverage, missing } = this.coverage(queryTerms, item.tf);
      return { item, bm25, cosine, coverage, missing };
    });

    const maxBm25 = Math.max(1e-9, ...scored.map((s) => s.bm25));
    return scored
      .map(({ item, bm25, cosine, coverage, missing }) => ({
        chunk: item.chunk,
        score: Math.round((0.75 * coverage + 0.25 * cosine) * 1000) / 1000,
        cosineScore: Math.round(cosine * 1000) / 1000,
        bm25Score: Math.round(bm25 * 1000) / 1000,
        coverage: Math.round(coverage * 1000) / 1000,
        missingTerms: missing,
        rank: 0.7 * (bm25 / maxBm25) + 0.3 * cosine,
      }))
      .filter((r) => r.score >= threshold && r.bm25Score > 0)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, topK)
      .map(({ rank: _rank, ...result }) => result);
  }
}
