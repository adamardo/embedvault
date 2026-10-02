import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CodeBlock from "@/components/CodeBlock";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import { deleteSnippet } from "@/app/actions/snippets";

export const dynamic = "force-dynamic";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

export default async function SnippetPage({ params }: { params: { id: string } }) {
  const s = await prisma.codeSnippet.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } }, entry: { select: { title: true, slug: true } } },
  });
  if (!s) notFound();

  const prose = "whitespace-pre-wrap text-sm leading-relaxed text-gray-300";
  const mono = "whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-300";

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/code" className="text-sm text-gray-500 hover:text-gray-300">
        ← Back to Code Library
      </Link>

      <div className="mb-2 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-accent">
            {[s.platform, s.language, s.style].filter(Boolean).join(" · ")}
          </div>
          <h1 className="text-3xl font-semibold text-white">{s.title}</h1>
          {s.description && <p className="mt-1 text-gray-400">{s.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {s.tags.map((t) => (
              <span key={t.tagId} className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                #{t.tag.name}
              </span>
            ))}
            {s.entry && (
              <Link href={`/entry/${s.entry.slug}`} className="ml-2 text-xs text-accent hover:underline">
                Related: {s.entry.title}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/code/${s.id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
          >
            <Pencil size={14} /> Edit
          </Link>
          <DeleteEntryButton action={deleteSnippet} id={s.id} title={s.title} />
        </div>
      </div>

      {s.hardwareRequired && (
        <Section title="Hardware required">
          <p className={prose}>{s.hardwareRequired}</p>
        </Section>
      )}
      {s.wiring && (
        <Section title="Wiring">
          <p className={mono}>{s.wiring}</p>
        </Section>
      )}

      <Section title="Code">
        <CodeBlock code={s.code} language={s.language} />
      </Section>

      {s.explanation && (
        <Section title="Explanation">
          <p className={prose}>{s.explanation}</p>
        </Section>
      )}
      {s.expectedOutput && (
        <Section title="Expected output">
          <p className={mono}>{s.expectedOutput}</p>
        </Section>
      )}
      {s.commonErrors && (
        <Section title="Common errors">
          <p className={prose}>{s.commonErrors}</p>
        </Section>
      )}
    </div>
  );
}
