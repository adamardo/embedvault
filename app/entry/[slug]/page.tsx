import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ENTRY_FIELDS, TYPE_LABELS, categoryUrlFor, isEntryType } from "@/lib/entry-types";
import { deleteEntry } from "@/app/actions/entries";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import CodeBlock from "@/components/CodeBlock";
import FavoriteButton from "@/components/FavoriteButton";
import EntryNotes from "@/components/EntryNotes";

export const dynamic = "force-dynamic";

const box = "rounded-lg border border-white/10 bg-[#12141a]";

export default async function EntryPage({ params }: { params: { slug: string } }) {
  const entry = await prisma.entry.findUnique({
    where: { slug: params.slug },
    include: {
      tags: { include: { tag: true } },
      codeSnippets: true,
      troubleshooting: true,
      relationsFrom: { include: { toEntry: true } },
      relationsTo: { include: { fromEntry: true } },
      notes: { orderBy: { updatedAt: "desc" } },
      favorites: true,
    },
  });
  if (!entry) notFound();
  const isFavorite = entry.favorites.length > 0;

  // Only show sections that actually have content.
  const values = entry as Record<string, unknown>;
  const sections = ENTRY_FIELDS.filter((f) => values[f.name]);

  // Relations can point either way; show both as "related".
  const related = [
    ...entry.relationsFrom.map((r) => ({ id: r.id, entry: r.toEntry, label: r.label })),
    ...entry.relationsTo.map((r) => ({ id: r.id, entry: r.fromEntry, label: r.label })),
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href={categoryUrlFor(entry.type)} className="text-sm text-gray-500 hover:text-gray-300">
        ← Back to list
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wide text-accent">
            {isEntryType(entry.type) ? TYPE_LABELS[entry.type] : entry.type}
          </span>
          <h1 className="text-3xl font-semibold text-white">{entry.title}</h1>
          <p className="mt-1 text-gray-400">{entry.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span key={t.tagId} className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                #{t.tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton entryId={entry.id} isFavorite={isFavorite} />
          <Link
            href={`/entry/${entry.slug}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
          >
            <Pencil size={14} /> Edit
          </Link>
          <DeleteEntryButton action={deleteEntry} id={entry.id} title={entry.title} />
        </div>
      </div>

      {/* Content sections as accordions: <details> is built into HTML, no JavaScript needed. */}
      <div className="space-y-3">
        {sections.map((f) => (
          <details key={f.name} open className={box}>
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-gray-200">
              {f.label}
            </summary>
            <div className="whitespace-pre-wrap px-4 pb-4 text-sm leading-relaxed text-gray-300">
              {String(values[f.name])}
            </div>
          </details>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-gray-500">No content yet. Click Edit to add sections.</p>
        )}
      </div>

      {entry.codeSnippets.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-white">Code Examples</h2>
          <div className="space-y-3">
            {entry.codeSnippets.map((s) => (
              <details key={s.id} className={box}>
                <summary className="cursor-pointer select-none px-4 py-3 text-sm text-gray-200">
                  {s.title}{" "}
                  <span className="ml-2 text-xs text-gray-500">
                    {s.platform} · {s.language}
                    {s.style ? ` · ${s.style}` : ""}
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  {s.description && <p className="mb-3 text-sm text-gray-400">{s.description}</p>}
                  <CodeBlock code={s.code} language={s.language} />
                  <Link href={`/code/${s.id}`} className="mt-2 inline-block text-xs text-accent hover:underline">
                    Open full snippet →
                  </Link>
                  {s.explanation && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-300">{s.explanation}</p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {entry.troubleshooting.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-white">Troubleshooting</h2>
          <div className="space-y-3">
            {entry.troubleshooting.map((g) => (
              <details key={g.id} className={box}>
                <summary className="cursor-pointer select-none px-4 py-3 text-sm text-gray-200">
                  {g.problem}
                </summary>
                <div className="space-y-3 px-4 pb-4 text-sm text-gray-300">
                  <div>
                    <div className="text-xs uppercase text-gray-500">Possible causes</div>
                    <div className="whitespace-pre-wrap">{g.possibleCauses}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Diagnostic steps</div>
                    <div className="whitespace-pre-wrap">{g.diagnosticSteps}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Solution</div>
                    <div className="whitespace-pre-wrap">{g.solution}</div>
                  </div>
                  <Link href={`/troubleshooting/${g.id}`} className="inline-block text-xs text-accent hover:underline">
                    Open full guide →
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}


      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-white">My Notes</h2>
        <EntryNotes
          entryId={entry.id}
          entrySlug={entry.slug}
          notes={entry.notes.map((n) => ({ id: n.id, content: n.content, updatedAt: n.updatedAt.toISOString() }))}
        />
      </section>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-white">Related</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/entry/${r.entry.slug}`}
                className="rounded-md border border-white/10 bg-[#12141a] px-3 py-1.5 text-sm text-gray-300 hover:border-accent/60"
              >
                {r.entry.title}
                {r.label && <span className="ml-2 text-xs text-gray-500">{r.label}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
