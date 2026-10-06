import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chunkDocument } from '../src/lib/rag/chunker';
import { answerQuestion } from '../src/lib/rag/generator';
import { getInitialIngestedDocuments } from '../src/lib/rag/sample-data';
import { VectorStore } from '../src/lib/rag/vector-store';
import { runEval } from './rag-eval';

const config = {
  topK: 4,
  similarityThreshold: 0.18,
  temperature: 0.2,
  activeExecutive: 'chief_of_staff' as const,
  strictGroundingOnly: true,
  provider: 'local_rag' as const,
};

test('answers every evaluation question from the right source and declines off-topic ones', async () => {
  const r = await runEval();
  assert.equal(r.factAccuracy, 1);
  assert.equal(r.top1Source, 1);
  assert.equal(r.offTopicDeclined, 1);
  assert.ok(r.meanAnswerChars < 600, `answers should be concise, got ${r.meanAnswerChars} chars`);
});

test('chunks follow document sections and carry their heading', () => {
  const chunks = chunkDocument('d', 'Doc', 'document', 'Guide Title\n\nSection A:\n- one\n- two\n\nSection B:\n- three');
  assert.equal(chunks.length, 2);
  assert.match(chunks[0].content, /^Guide Title — Section A/);
  assert.match(chunks[1].content, /three/);
});

test('every answer line is copied from a cited passage', () => {
  const store = new VectorStore(getInitialIngestedDocuments().flatMap((d) => d.chunks));
  const r = answerQuestion('What is the refund policy for annual subscriptions?', store, config);
  const sources = store.getAllChunks().map((c) => c.content);
  for (const line of r.answer.split('\n').filter((l) => l.startsWith('- '))) {
    const text = line.replace(/^- /, '').replace(/ \[\d+\]$/, '').replace(/\.$/, '');
    assert.ok(sources.some((s) => s.includes(text)), `not found in sources: ${text}`);
  }
});

test('missing question terms are reported instead of glossed over', () => {
  const store = new VectorStore(getInitialIngestedDocuments().flatMap((d) => d.chunks));
  const r = answerQuestion('What is the capital of France?', store, config);
  assert.equal(r.isHallucinationPrevented, true);
  assert.equal(r.citations.length, 0);
});
