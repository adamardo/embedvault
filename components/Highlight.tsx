// Wraps every occurrence of the search words in <mark> so you can see why
// a result matched. Works on the server: no JavaScript sent to the browser.

export default function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${tokens.join("|")})`, "gi"); // tokens are letters/digits only
  // split() with a capture group returns [before, match, between, match, ...]
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-accent/30 px-0.5 text-white">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
