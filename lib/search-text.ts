// Pure text helpers for search (no database here, so they are easy to test).

// Words that carry no meaning for a search. "STM32 LED not blinking"
// becomes the useful words: stm32, led, blink.
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with", "at", "by", "as",
  "is", "are", "was", "be", "my", "me", "it", "its", "how", "why", "what", "when", "does",
  "do", "did", "not", "no", "won", "don", "doesn", "isn", "didn", "cant", "cannot",
  "get", "gets", "getting", "using", "this", "that", "from", "vs", "difference",
  "differences", "between", "should", "would", "could", "please", "help",
  // generic words that would match almost everything
  "code", "example", "examples", "project", "projects", "guide", "guides", "problem", "problems",
]);

// Very light "stemming" so that "blinking" finds "blink" and "resetting" finds "reset".
function stem(t: string): string {
  let out = t;
  if (t.length > 6 && t.endsWith("ing")) out = t.slice(0, -3);
  else if (t.length > 5 && t.endsWith("ed")) out = t.slice(0, -2);
  else if (t.length > 4 && t.endsWith("s") && !t.endsWith("ss")) out = t.slice(0, -1);
  // "resett" -> "reset", "runn" -> "run" (but keep "pull", "class")
  if (out !== t && out.length > 3 && out[out.length - 1] === out[out.length - 2] && !"lsz".includes(out[out.length - 1])) {
    out = out.slice(0, -1);
  }
  return out;
}

export function tokenize(query: string): string[] {
  const raw = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
  let words = raw.filter((t) => !STOPWORDS.has(t));
  if (words.length === 0) words = raw; // e.g. the query was just "code"
  return Array.from(new Set(words.map(stem))).slice(0, 6);
}

export type Field = {
  label: string;
  text: string | null | undefined;
  weight: number;
  primary?: boolean; // shown as the card's own title/summary, so never used as the "matched in" excerpt
};

function excerptAround(text: string, idx: number, len: number): string {
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + len + 90);
  const body = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${body}${end < text.length ? "…" : ""}`;
}

// A token counts as a match when it starts a word: "led" matches "LED" and
// "LEDC" but NOT "enabled". (The database over-fetches with substring
// matching; this is where we tighten it.)
export function scoreFields(fields: Field[], tokens: string[]) {
  let score = 0;
  let matched = 0;
  let best: { label: string; excerpt: string; weight: number } | undefined;

  for (const token of tokens) {
    const re = new RegExp(`(^|[^a-z0-9])${token}`, "i");
    let hit = false;
    for (const f of fields) {
      if (!f.text) continue;
      const m = re.exec(f.text);
      if (!m) continue;
      hit = true;
      score += f.weight;
      if (!f.primary && (!best || f.weight > best.weight)) {
        best = { label: f.label, excerpt: excerptAround(f.text, m.index + m[1].length, token.length), weight: f.weight };
      }
    }
    if (hit) matched++;
  }

  score += matched * 5;
  const title = fields.find((f) => f.primary && f.weight >= 10);
  if (title?.text && tokens.includes(title.text.toLowerCase())) score += 20; // exact title match

  return { score, matched, matchedIn: best ? { label: best.label, excerpt: best.excerpt } : undefined };
}

// With 3+ words, require at least half of them to match, so a result that
// only shares one random word with a long question is dropped.
export function enoughMatched(matched: number, tokenCount: number): boolean {
  if (matched < 1) return false;
  return tokenCount < 3 || matched >= Math.ceil(tokenCount / 2);
}
