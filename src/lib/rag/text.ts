/**
 * Text normalisation shared by indexing and querying: tokenising, stop-word removal,
 * a light suffix stemmer and a small synonym table for common business wording.
 */

export const STOP_WORDS = new Set(
  (
    "a about above after again against all am an and any are aren't as at be because been before being below " +
    "between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each " +
    "few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself " +
    "him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most " +
    "mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same shan't " +
    "she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves then " +
    "there there's these they they'd they'll they're they've this those through to too under until up very was " +
    "wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while who who's " +
    "whom why why's with won't would wouldn't you you'd you'll you're you've your yours yourself yourselves " +
    'get gets got many much tell please explain give know need want us also does there any ' +
    // Words that describe the kind of answer wanted rather than its topic.
    'long quickly quick soon often usually typically exactly currently actually'
  ).split(' '),
);

/** Light English stemmer: enough to match plural, -ing, -ed and -e variants. */
export function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}y`;
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us')) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  if (w.length > 4 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

/** Content terms of a text, stemmed, in order (duplicates kept for term frequency). */
export function terms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/(\d),(\d)/g, '$1$2')
    .split(/[^a-z0-9%$]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .map(stem);
}

/**
 * Small synonym table (stemmed). A query term also matches its synonyms, so "vacation"
 * finds "paid time off" and "cost" finds "price". Extend per client vocabulary.
 */
const SYNONYM_GROUPS = [
  ['vacation', 'pto', 'holiday', 'leave'],
  ['cost', 'price', 'pricing', 'fee', 'charge'],
  ['refund', 'money-back', 'reimburs'],
  ['cancel', 'cancellation', 'terminat'],
  ['employe', 'staff', 'team', 'member'],
  ['limit', 'quota', 'cap'],
  ['uptime', 'availability', 'sla'],
  ['authent', 'auth', 'token', 'login'],
  ['return', 'refund'],
  ['broken', 'damag', 'defect'],
  ['encrypt', 'tls', 'aes'],
  ['certif', 'soc', 'iso', 'complianc'],
  ['remote', 'home', 'anywhere'],
  ['stipend', 'allowanc', 'budget', 'reimburs'],
  ['notif', 'told', 'tell', 'inform', 'alert'],
  ['incident', 'breach'],
].map((group) => group.map(stem));

export function expand(term: string): string[] {
  const out = new Set([term]);
  for (const group of SYNONYM_GROUPS) {
    // Prefix matching only for longer stems, so "capital" does not pull in "cap".
    const hit = group.some((g) => g === term || (g.length >= 5 && term.startsWith(g)) || (term.length >= 5 && g.startsWith(term)));
    if (hit) group.forEach((g) => out.add(g));
  }
  return [...out];
}

/** Whether a document term satisfies a query term (exact, synonym, or shared stem prefix). */
export function termMatches(queryTerm: string, docTerm: string, alternatives: string[]): boolean {
  if (docTerm === queryTerm) return true;
  return alternatives.some((alt) => docTerm === alt || (alt.length >= 4 && docTerm.startsWith(alt)));
}

/** Splits a passage into answerable units: bullet lines, then sentences inside long lines. */
export function units(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .flatMap((line) => (line.length > 220 ? line.split(/(?<=[.!?])\s+(?=[A-Z])/) : [line]))
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
