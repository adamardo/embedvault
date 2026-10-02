import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import TextBlock from "@/components/TextBlock";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import { deleteGuide } from "@/app/actions/guides";

export const dynamic = "force-dynamic";

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "solution" }) {
  return (
    <section
      className={`mt-4 rounded-lg border p-4 ${
        tone === "solution" ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-[#12141a]"
      }`}
    >
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

export default async function GuidePage({ params }: { params: { id: string } }) {
  const g = await prisma.troubleshootingGuide.findUnique({
    where: { id: params.id },
    include: {
      entry: {
        include: {
          relationsFrom: { include: { toEntry: true } },
          relationsTo: { include: { fromEntry: true } },
          // other guides about the same entry (not this one)
          troubleshooting: { where: { id: { not: params.id } }, select: { id: true, problem: true } },
        },
      },
    },
  });
  if (!g) notFound();

  // Related topics: the entry itself, the entries linked to it, and sibling guides.
  const relatedEntries = g.entry
    ? [
        ...g.entry.relationsFrom.map((r) => r.toEntry),
        ...g.entry.relationsTo.map((r) => r.fromEntry),
      ]
    : [];
  const siblings = g.entry?.troubleshooting ?? [];
  const hasRelated = g.entry || siblings.length > 0;

  const linkClass =
    "rounded-md border border-white/10 bg-[#0f1115] px-3 py-1.5 text-sm text-gray-300 hover:border-accent/60";

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/troubleshooting" className="text-sm text-gray-500 hover:text-gray-300">
        ← Back to Troubleshooting
      </Link>

      <div className="mb-2 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wide text-accent">Problem</span>
          <h1 className="text-2xl font-semibold text-white">{g.problem}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/troubleshooting/${g.id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
          >
            <Pencil size={14} /> Edit
          </Link>
          <DeleteEntryButton action={deleteGuide} id={g.id} title={g.problem} />
        </div>
      </div>

      {g.symptoms && (
        <Section title="Symptoms">
          <TextBlock text={g.symptoms} />
        </Section>
      )}
      <Section title="Possible causes">
        <TextBlock text={g.possibleCauses} />
      </Section>
      <Section title="Diagnostic steps">
        <TextBlock text={g.diagnosticSteps} />
      </Section>
      <Section title="Solution" tone="solution">
        <TextBlock text={g.solution} />
      </Section>
      {g.example && (
        <Section title="Example">
          <TextBlock text={g.example} />
        </Section>
      )}
      {g.commonMistakes && (
        <Section title="Common mistakes">
          <TextBlock text={g.commonMistakes} />
        </Section>
      )}

      {hasRelated && (
        <Section title="Related topics">
          <div className="flex flex-wrap gap-2">
            {g.entry && (
              <Link href={`/entry/${g.entry.slug}`} className={linkClass}>
                {g.entry.title}
              </Link>
            )}
            {relatedEntries.map((e) => (
              <Link key={e.id} href={`/entry/${e.slug}`} className={linkClass}>
                {e.title}
              </Link>
            ))}
          </div>
          {siblings.length > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 text-xs text-gray-500">Other guides for {g.entry?.title}</div>
              <ul className="space-y-1 text-sm">
                {siblings.map((s) => (
                  <li key={s.id}>
                    <Link href={`/troubleshooting/${s.id}`} className="text-accent hover:underline">
                      {s.problem}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
