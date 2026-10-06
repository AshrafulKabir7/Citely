/**
 * Retrieval and answer evaluation for the sample knowledge base.
 * Run: npm run eval
 *
 * Answerable questions check that the expected fact appears in the answer and that the
 * first citation comes from the right document. Off-topic questions must be declined.
 */
import { VectorStore } from '../src/lib/rag/vector-store';
import { generateRAGAnswer } from '../src/lib/rag/generator';
import { getInitialIngestedDocuments } from '../src/lib/rag/sample-data';
import type { RAGConfig } from '../src/lib/rag/types';

export const ANSWERABLE: { q: string; doc: string; fact: string }[] = [
  { q: 'How many vacation days do full-time employees get?', doc: 'Handbook', fact: '22 days' },
  { q: 'Can unused PTO roll over to next year?', doc: 'Handbook', fact: '10 days' },
  { q: 'How long is paid parental leave?', doc: 'Handbook', fact: '16 weeks' },
  { q: 'What is the home office stipend?', doc: 'Handbook', fact: '$1,200' },
  { q: 'What are the core collaboration hours?', doc: 'Handbook', fact: '10:00 AM to 3:00 PM' },
  { q: 'How much does the Growth tier cost?', doc: 'Pricing', fact: '$149' },
  { q: 'Is there a money-back guarantee?', doc: 'Pricing', fact: '14-day' },
  { q: 'What discount do annual subscriptions get?', doc: 'Pricing', fact: '20%' },
  { q: 'What uptime SLA does the Enterprise tier have?', doc: 'Pricing', fact: '99.999%' },
  { q: 'What is the API rate limit on the Growth tier?', doc: 'api-docs', fact: '600 requests per minute' },
  { q: 'What happens when I exceed the rate limit?', doc: 'api-docs', fact: '429' },
  { q: 'How do webhook retries work?', doc: 'api-docs', fact: 'exponential backoff' },
  { q: 'How do I authenticate API requests?', doc: 'api-docs', fact: 'Bearer' },
  { q: 'How long do I have to return a NovaTech product?', doc: 'Returns', fact: '30 days' },
  { q: 'Is accidental damage covered by the warranty?', doc: 'Returns', fact: 'NovaCare+' },
  { q: 'Is there a restocking fee?', doc: 'Returns', fact: '0% restocking' },
  { q: 'How long is the hardware warranty?', doc: 'Returns', fact: '2-Year' },
  { q: 'What encryption protects data in transit?', doc: 'security', fact: 'TLS 1.3' },
  { q: 'Do we have SOC 2 certification?', doc: 'security', fact: 'SOC 2 Type II' },
  { q: 'How quickly are customers told about a security incident?', doc: 'security', fact: '72 hours' },
];

export const OFF_TOPIC = [
  'What is the capital of France?',
  'Who won the 2022 World Cup?',
  'How do I bake sourdough bread?',
  "What's the weather tomorrow?",
  'Recommend a good sci-fi novel.',
  'What is our stock price today?',
];

const config: RAGConfig = {
  topK: 4,
  similarityThreshold: 0.18,
  temperature: 0.2,
  activeExecutive: 'chief_of_staff',
  strictGroundingOnly: true,
  provider: 'local_rag',
};

export async function runEval(verbose = false) {
  const store = new VectorStore(getInitialIngestedDocuments().flatMap((d) => d.chunks));
  let correctFact = 0;
  let correctSource = 0;
  let declinedOffTopic = 0;
  let answerChars = 0;
  for (const item of ANSWERABLE) {
    const r = await generateRAGAnswer(item.q, store, config);
    const factOk = r.answer.includes(item.fact) && !r.isHallucinationPrevented;
    const sourceOk = (r.citations[0]?.sourceName ?? '').includes(item.doc);
    correctFact += Number(factOk);
    correctSource += Number(sourceOk);
    answerChars += r.answer.length;
    if (verbose && (!factOk || !sourceOk)) console.log('  MISS', item.q, '->', r.citations[0]?.sourceName, factOk ? '' : '(fact missing)');
  }
  for (const q of OFF_TOPIC) {
    const r = await generateRAGAnswer(q, store, config);
    declinedOffTopic += Number(r.isHallucinationPrevented);
    if (verbose && !r.isHallucinationPrevented) console.log('  ANSWERED OFF-TOPIC', q, '->', r.citations.map((c) => c.sourceName).join(', '));
  }
  return {
    factAccuracy: correctFact / ANSWERABLE.length,
    top1Source: correctSource / ANSWERABLE.length,
    offTopicDeclined: declinedOffTopic / OFF_TOPIC.length,
    meanAnswerChars: Math.round(answerChars / ANSWERABLE.length),
    counts: { answerable: ANSWERABLE.length, offTopic: OFF_TOPIC.length, correctFact, correctSource, declinedOffTopic },
  };
}

if (process.argv[1]?.includes('rag-eval')) {
  runEval(true).then((r) => console.log(JSON.stringify(r, null, 2)));
}
