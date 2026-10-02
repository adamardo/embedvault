import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TroubleshootingPage({ searchParams }: { searchParams: { entry?: string } }) {
  const all = await prisma.troubleshootingGuide.findMany({
    orderBy: { updatedAt: "desc" },
    include: { entry: { select: { slug: true, title: true } } },
  });

  // Filter chips: one per related entry, plus "General" for guides with none.
  const groups = new Map<string, { label: string; count: number }>();
  for (const g of all) {
    const key = g.entry?.slug ?? "none";
    const cur = groups.get(key) ?? { label: g.entry?.title ?? "General", count: 0 };
    cur.count++;
    groups.set(key, cur);
  }
  const chips = Array.from(groups.entries()).sort((a, b) => a[1].label.localeCompare(b[1].label));

  const selected = searchParams.entry && groups.has(searchParams.entry) ? searchParams.entry : undefined;
  const guides = selected ? all.filter((g) => (g.entry?.slug ?? "none") === selected) : all;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs ${
      active ? "border-accent bg-accent/20 text-white" : "border-white/10 text-gray-400 hover:text-white"
    }`;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Troubleshooting</h1>
          <p className="text-sm text-gray-500">
            {guides.length} guide{guides.length === 1 ? "" : "s"}
            {selected ? ` for ${groups.get(selected)?.label}` : ""}
          </p>
        </div>
        <Link
          href="/troubleshooting/new"
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-light"
        >
          <Plus size={16} /> New guide
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/troubleshooting" className={chip(!selected)}>
          All ({all.length})
        </Link>
        {chips.map(([key, g]) => (
          <Link key={key} href={`/troubleshooting?entry=${encodeURIComponent(key)}`} className={chip(key === selected)}>
            {g.label} ({g.count})
          </Link>
        ))}
      </div>

      {guides.length === 0 && (
        <p className="text-sm text-gray-500">No guides yet. Click “New guide” to write your first one.</p>
      )}

      <div className="space-y-3">
        {guides.map((g) => {
          const causes = g.possibleCauses.split("\n").filter((l) => l.trim()).length;
          return (
            <Link
              key={g.id}
              href={`/troubleshooting/${g.id}`}
              className="block rounded-lg border border-white/10 bg-[#12141a] p-4 hover:border-accent/60"
            >
              <div className="font-medium text-white">{g.problem}</div>
              <div className="mt-1 text-xs text-gray-500">
                {causes} possible cause{causes === 1 ? "" : "s"}
                {g.entry ? ` · Related: ${g.entry.title}` : ""}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
