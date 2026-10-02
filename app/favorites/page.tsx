import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TYPE_LABELS, isEntryType } from "@/lib/entry-types";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const favorites = await prisma.favorite.findMany({
    orderBy: { createdAt: "desc" },
    include: { entry: { include: { tags: { include: { tag: true } } } } },
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-1 text-2xl font-semibold text-white">Favorites</h1>
      <p className="mb-6 text-sm text-gray-500">{favorites.length} entries</p>

      {favorites.length === 0 && (
        <p className="text-sm text-gray-500">
          Nothing favorited yet. Open any entry and click the star to pin it here.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {favorites.map(({ entry }) => (
          <Link
            key={entry.id}
            href={`/entry/${entry.slug}`}
            className="rounded-lg border border-white/10 bg-[#12141a] p-4 hover:border-accent/60"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-white">{entry.title}</span>
              <Star size={14} className="mt-0.5 shrink-0 text-yellow-400" fill="currentColor" />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {isEntryType(entry.type) ? TYPE_LABELS[entry.type] : entry.type}
            </div>
            <p className="mt-2 text-sm text-gray-400">{entry.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
