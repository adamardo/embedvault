import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CodeLibraryPage({ searchParams }: { searchParams: { platform?: string } }) {
  const all = await prisma.codeSnippet.findMany({
    orderBy: { updatedAt: "desc" },
    include: { tags: { include: { tag: true } }, entry: { select: { title: true } } },
  });

  // Count snippets per platform for the filter chips.
  const counts = new Map<string, number>();
  for (const s of all) counts.set(s.platform, (counts.get(s.platform) ?? 0) + 1);
  const platforms = Array.from(counts.keys()).sort();

  const selected = searchParams.platform && counts.has(searchParams.platform) ? searchParams.platform : undefined;
  const snippets = selected ? all.filter((s) => s.platform === selected) : all;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs ${
      active ? "border-accent bg-accent/20 text-white" : "border-white/10 text-gray-400 hover:text-white"
    }`;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Code Library</h1>
          <p className="text-sm text-gray-500">
            {snippets.length} snippet{snippets.length === 1 ? "" : "s"}
            {selected ? ` for ${selected}` : ""}
          </p>
        </div>
        <Link
          href="/code/new"
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-light"
        >
          <Plus size={16} /> New snippet
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/code" className={chip(!selected)}>
          All ({all.length})
        </Link>
        {platforms.map((p) => (
          <Link key={p} href={`/code?platform=${encodeURIComponent(p)}`} className={chip(p === selected)}>
            {p} ({counts.get(p)})
          </Link>
        ))}
      </div>

      {snippets.length === 0 && (
        <p className="text-sm text-gray-500">No snippets yet. Click “New snippet” to add your first one.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {snippets.map((s) => (
          <Link
            key={s.id}
            href={`/code/${s.id}`}
            className="rounded-lg border border-white/10 bg-[#12141a] p-4 hover:border-accent/60"
          >
            <div className="font-medium text-white">{s.title}</div>
            <div className="mt-1 text-xs text-gray-500">
              {[s.platform, s.language, s.style].filter(Boolean).join(" · ")}
            </div>
            {s.description && <p className="mt-2 text-sm text-gray-400">{s.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.tags.map((t) => (
                <span key={t.tagId} className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                  #{t.tag.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
