import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AllNotesPage() {
  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
    include: { entry: { select: { title: true, slug: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-1 text-2xl font-semibold text-white">My Notes</h1>
      <p className="mb-6 text-sm text-gray-500">{notes.length} notes across all entries</p>

      {notes.length === 0 && (
        <p className="text-sm text-gray-500">
          No notes yet. Open any entry and scroll to “My Notes” to write your first one.
        </p>
      )}

      <div className="space-y-3">
        {notes.map((n) => (
          <Link
            key={n.id}
            href={`/entry/${n.entry.slug}`}
            className="block rounded-lg border border-white/10 bg-[#12141a] p-4 hover:border-accent/60"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-accent">{n.entry.title}</span>
              <span className="text-xs text-gray-600">{n.updatedAt.toLocaleDateString()}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-300 line-clamp-3">{n.content}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
