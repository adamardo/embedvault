import SearchBox from "@/components/SearchBox";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EntryType } from "@/lib/entry-types";

// This is a Server Component (the default in the app/ directory) — it runs
// on the server, can talk to the database directly with `await`, and sends
// only the final HTML to the browser. No API route or useEffect needed for
// a simple read like this.
async function getStats() {
  const [total, microcontrollers, components, concepts, codeSnippets, guides, projects, favorites] =
    await Promise.all([
      prisma.entry.count(),
      prisma.entry.count({ where: { type: EntryType.MICROCONTROLLER } }),
      prisma.entry.count({ where: { type: EntryType.COMPONENT } }),
      prisma.entry.count({ where: { type: EntryType.CONCEPT } }),
      prisma.codeSnippet.count(),
      prisma.troubleshootingGuide.count(),
      prisma.project.count(),
      prisma.favorite.count(),
    ]);

  return [
    { label: "Total Entries", value: total },
    { label: "Microcontrollers", value: microcontrollers },
    { label: "Components", value: components },
    { label: "Concepts", value: concepts },
    { label: "Code Snippets", value: codeSnippets },
    { label: "Troubleshooting Guides", value: guides },
    { label: "Projects", value: projects },
    { label: "Favorites", value: favorites },
  ];
}

async function getRecentEntries() {
  return prisma.entry.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, title: true, type: true, slug: true, updatedAt: true },
  });
}

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentEntries()]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Live counts from your database.
      </p>

      <div className="mb-8">
        <SearchBox size="large" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-white/10 bg-[#12141a] p-4"
          >
            <div className="text-2xl font-semibold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recently updated */}
      <div className="rounded-lg border border-white/10 bg-[#12141a]">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-medium text-gray-300">
          Recently Updated
        </div>
        <div className="divide-y divide-white/5">
          {recent.length === 0 && (
            <div className="px-4 py-4 text-sm text-gray-500">
              No entries yet — run the seed script to add starter data.
            </div>
          )}
          {recent.map((entry) => (
            <Link
              key={entry.id}
              href={`/entry/${entry.slug}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-white/5"
            >
              <span className="text-gray-200">{entry.title}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {entry.type}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
