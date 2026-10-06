import { DocumentChunk, SourceType } from './types';

export interface ChunkerOptions {
  chunkSize?: number; // maximum words per chunk (default 90)
  chunkOverlap?: number; // words of overlap when a single section must be split (default 20)
}

const BULLET = /^\s*(?:[-*•]|\d+[.)])\s+/;

/** A line is a heading when it is short, not a bullet, and introduces content (ends with ":" or is markdown). */
function isHeading(line: string, next: string | undefined): boolean {
  const text = line.trim();
  if (!text || BULLET.test(text)) return false;
  if (/^#{1,6}\s/.test(text)) return true;
  const words = text.split(/\s+/).length;
  if (text.endsWith(':') && words <= 10) return true;
  return words <= 9 && !/[.!?]$/.test(text) && next !== undefined && BULLET.test(next);
}

/**
 * Structure-aware chunking. Sections (a heading and its lines) are kept together when
 * they fit; long sections are split on line boundaries with a small overlap. Every chunk
 * carries its document and section title, so a retrieved passage stands on its own and a
 * citation points at the specific section rather than a whole file.
 */
export function chunkDocument(
  documentId: string,
  sourceName: string,
  sourceType: SourceType,
  rawText: string,
  pageOrUrl?: string,
  options: ChunkerOptions = {},
): DocumentChunk[] {
  const maxWords = options.chunkSize || 90;
  const overlapWords = options.chunkOverlap ?? 20;

  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[  ]+/g, ' ')
    .split('\n')
    .map((l) => l.trim());
  if (!lines.some(Boolean)) return [];

  // The first non-empty line is the document title when it is not itself content.
  const firstIndex = lines.findIndex(Boolean);
  const first = lines[firstIndex];
  const docTitle = !BULLET.test(first) && first.split(/\s+/).length <= 14 && !/[.!?]$/.test(first) ? first : '';
  const body = docTitle ? lines.slice(firstIndex + 1) : lines;

  type Section = { title: string; lines: string[] };
  const sections: Section[] = [];
  let current: Section = { title: '', lines: [] };
  body.forEach((line, i) => {
    if (!line) return;
    const next = body.slice(i + 1).find(Boolean);
    if (isHeading(line, next)) {
      if (current.lines.length) sections.push(current);
      current = { title: line.replace(/^#+\s*/, '').replace(/:$/, ''), lines: [] };
    } else {
      // Long prose paragraphs are split into sentences so chunks can stay small.
      const pieces = line.split(/\s+/).length > maxWords ? line.split(/(?<=[.!?])\s+/) : [line];
      current.lines.push(...pieces);
    }
  });
  if (current.lines.length) sections.push(current);

  const chunks: DocumentChunk[] = [];
  const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const push = (section: Section, group: string[]) => {
    const header = [docTitle, section.title].filter(Boolean).join(' — ');
    const content = [header, ...group].filter(Boolean).join('\n');
    chunks.push({
      id: `${documentId}-c${chunks.length}`,
      documentId,
      sourceName,
      sourceType,
      content,
      pageOrUrl,
      chunkIndex: chunks.length,
      tokensEstimate: Math.round(wordCount(content) * 1.3),
      metadata: { section: section.title || docTitle || sourceName },
    });
  };

  for (const section of sections) {
    let group: string[] = [];
    let words = 0;
    for (const line of section.lines) {
      const n = wordCount(line);
      if (group.length && words + n > maxWords) {
        push(section, group);
        // Carry trailing lines forward as overlap so a fact split across the boundary survives.
        const carry: string[] = [];
        let carried = 0;
        for (let k = group.length - 1; k >= 0 && carried + wordCount(group[k]) <= overlapWords; k--) {
          carry.unshift(group[k]);
          carried += wordCount(group[k]);
        }
        group = carry;
        words = carried;
      }
      group.push(line);
      words += n;
    }
    if (group.length) push(section, group);
  }
  return chunks;
}
