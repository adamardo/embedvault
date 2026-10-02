import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  Done: "border-emerald-500/40 text-emerald-300",
  "In progress": "border-accent/50 text-accent-light",
  Planned: "border-white/20 text-gray-300",
  "On hold": "border-yellow-500/40 text-yellow-300",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { entries: { include: { entry: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-gray-500">{projects.length} projects</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-light"
        >
          <Plus size={16} /> New project
        </Link>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-gray-500">No projects yet. Click “New project” to add your first build.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="rounded-lg border border-white/10 bg-[#12141a] p-4 hover:border-accent/60"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-white">{p.title}</span>
              {p.status && (
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${statusColor[p.status] ?? "border-white/20 text-gray-300"}`}>
                  {p.status}
                </span>
              )}
            </div>
            {p.description && <p className="mt-2 line-clamp-2 text-sm text-gray-400">{p.description}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.entries.slice(0, 5).map((pe) => (
                <span key={pe.entryId} className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                  {pe.entry.title}
                </span>
              ))}
              {p.entries.length > 5 && (
                <span className="text-xs text-gray-600">+{p.entries.length - 5} more</span>
              )}
              {p.entries.length === 0 && <span className="text-xs text-gray-600">No parts linked yet</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
