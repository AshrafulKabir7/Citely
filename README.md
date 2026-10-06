# Citely

A grounded document chatbot ("AI executives") that answers only from a company's own documents, quotes the passages it used, and declines questions the documents do not cover. Everything runs in the browser on bundled sample documents (fictional companies).

## Run

```bash
npm install
npm run dev      # local dev server
npm test         # retrieval and answer tests (node:test via tsx)
npm run eval     # evaluation report on the sample knowledge base
npm run build    # production build in dist/
```

## How answering works (`src/lib/rag/`)

1. **Section-aware chunking** (`chunker.ts`): documents are split along their own headings and bullet points (up to 90 words per chunk, small overlap when a section must be split). Each chunk carries its document and section title, so a citation points at a specific section.
2. **Hybrid retrieval** (`vector-store.ts`): Okapi BM25 (k1 = 1.2, b = 0.75) ranks passages, with hashed n-gram vectors (cosine) for fuzzy matching. A light stemmer and a small synonym table (`text.ts`) connect wording such as "vacation" and "paid time off".
3. **Evidence gate:** evidence coverage, the IDF-weighted share of the question's terms found in a passage, must reach 60% in strict mode (40% relaxed) or the question is declined with a list of the topics the knowledge base covers.
4. **Extractive answer** (`generator.ts`): the most relevant lines of the qualifying passages are quoted, each tagged with its citation number. Nothing is generated beyond the source text; terms of the question the sources do not contain are listed.
5. **Trace:** each answer records what retrieval did (passages searched, best BM25 score and coverage, why it answered or declined), shown under "How this was answered".

## Evaluation (`tests/rag-eval.ts`)

20 answerable questions across five sample documents, plus 6 off-topic questions.

| Metric | Before (whole-document chunks, overlap score) | Now |
| :-- | --: | --: |
| Expected fact in the answer | 17/17 (answers pasted whole documents) | 20/20 |
| First citation from the right document | 17/17 | 20/20 |
| Off-topic questions declined | 4/6 | 6/6 |
| Mean answer length | 2,276 characters | about 250 characters |

The earlier engine answered "What is the capital of France?" with three unrelated passages labelled as verified; it now declines.

## Changes in this pass (6 October 2026)

- Replaced the hard-coded opening conversations (fixed 97–99% scores, and a citation to a security page that was not in the knowledge base) with answers produced by the engine at load. Added the AcmeCloud security page to the sample documents.
- The "thought process" panel now shows the real retrieval trace instead of fixed text.
- "DeepThink" (which did nothing) is now a working strict/relaxed grounding switch.
- Homepage: removed the placeholder "logoipsum" logo strip, replaced the scripted showcase (it claimed to analyse a Q3 sales database the app cannot access) with live engine output including a real decline, rewrote pipeline copy to describe what is implemented, and aligned package prices with `FIVERR-GIG.md` ($75 / $150 / $350).

## Not implemented here

- LLM generation: the settings list OpenAI and Gemini as providers, but no provider is called; answers are extractive. Connecting a model is a buyer-build step.
- Fetching websites: `web-crawler.ts` cleans HTML that is supplied to it; browsers cannot crawl other sites, so live crawling belongs on a server.
