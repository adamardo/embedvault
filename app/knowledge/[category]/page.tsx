import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/entry-types";

// Dynamic route: the folder name [category] means this ONE file serves
// /knowledge/microcontrollers, /knowledge/components, /knowledge/concepts...
// The matched URL part arrives in `params.category`.

export const dynamic = "force-dynamic"; // always read fresh data

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = CATEGORIES[params.category];
  if (!category) notFound();

  const entries = await prisma.entry.findMany({
    where: { type: category.type },
    orderBy: { title: "asc" },
    include: { tags: { include: { tag: true } } },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">{category.label}</h1>
          <p className="text-sm text-gray-500">{entries.length} entries</p>
        </div>
        <Link
          href={`/entry/new?type=${category.type}`}
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-light"
        >
          <Plus size={16} /> New entry
        </Link>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-gray-500">Nothing here yet. Click “New entry” to add the first one.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map((e) => (
          <Link
            key={e.id}
            href={`/entry/${e.slug}`}
            className="rounded-lg border border-white/10 bg-[#12141a] p-4 hover:border-accent/60"
          >
            <div className="font-medium text-white">{e.title}</div>
            <p className="mt-1 text-sm text-gray-400">{e.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {e.tags.map((t) => (
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
