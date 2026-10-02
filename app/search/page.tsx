import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import Highlight from "@/components/Highlight";
import { search, type ResultItem } from "@/lib/search";

export const dynamic = "force-dynamic";

function ResultCard({ item, tokens }: { item: ResultItem; tokens: string[] }) {
  const body = (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium text-white">
          <Highlight text={item.title} tokens={tokens} />
        </span>
        {item.badge && <span className="text-xs text-gray-500">{item.badge}</span>}
      </div>
      {item.subtitle && (
        <p className="mt-1 text-sm text-gray-400">
          <Highlight text={item.subtitle} tokens={tokens} />
        </p>
      )}
      {item.matchedIn && (
        <p className="mt-2 text-xs text-gray-500">
          <span className="text-gray-400">In {item.matchedIn.label}:</span>{" "}
          <Highlight text={item.matchedIn.excerpt} tokens={tokens} />
        </p>
      )}
    </>
  );
  const cls = "block rounded-lg border border-white/10 bg-[#12141a] p-4";
  return item.href ? (
    <Link href={item.href} className={`${cls} hover:border-accent/60`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const results = q ? await search(q) : null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="mb-4 text-2xl font-semibold text-white">Search</h1>
      <SearchBox key={q} defaultValue={q} />

      {!results && (
        <p className="mt-6 text-sm text-gray-500">
          Try a single word like <code className="text-gray-300">UART</code>, or a question like{" "}
          <code className="text-gray-300">STM32 LED not blinking</code>.
        </p>
      )}

      {results && (
        <>
          <p className="mt-4 text-sm text-gray-500">
            {results.total} result{results.total === 1 ? "" : "s"}
            {results.tokens.length > 0 && (
              <>
                {" "}
                for <span className="text-gray-300">{results.tokens.join(" · ")}</span>
              </>
            )}
          </p>

          {results.total === 0 && (
            <p className="mt-6 text-sm text-gray-500">
              Nothing found. Try fewer or simpler words, or add the topic as a new entry.
            </p>
          )}

          <div className="mt-6 space-y-8">
            {results.groups.map((g) => (
              <section key={g.key}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  {g.label} <span className="text-gray-600">({g.items.length})</span>
                </h2>
                <div className="space-y-2">
                  {g.items.map((item) => (
                    <ResultCard key={item.id} item={item} tokens={results.tokens} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
