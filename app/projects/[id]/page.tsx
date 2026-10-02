import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import { deleteProject, addProjectEntry, removeProjectEntry } from "@/app/actions/projects";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { entries: { include: { entry: true } } },
  });
  if (!project) notFound();

  const linkedIds = new Set(project.entries.map((pe) => pe.entryId));
  const available = await prisma.entry.findMany({
    where: { id: { notIn: Array.from(linkedIds) } },
    select: { id: true, title: true, type: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-300">
        ← Back to Projects
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          {project.status && <span className="text-xs uppercase tracking-wide text-accent">{project.status}</span>}
          <h1 className="text-3xl font-semibold text-white">{project.title}</h1>
          {project.description && <p className="mt-2 whitespace-pre-wrap text-gray-400">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
          >
            <Pencil size={14} /> Edit
          </Link>
          <DeleteEntryButton action={deleteProject} id={project.id} title={project.title} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Parts used</h2>

        {project.entries.length === 0 && (
          <p className="mb-3 text-sm text-gray-500">Nothing linked yet — add a microcontroller, component or concept below.</p>
        )}

        <div className="mb-4 space-y-2">
          {project.entries.map((pe) => (
            <div
              key={pe.entryId}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-[#12141a] px-4 py-2.5"
            >
              <Link href={`/entry/${pe.entry.slug}`} className="text-sm text-gray-200 hover:text-accent">
                {pe.entry.title}
                <span className="ml-2 text-xs text-gray-500">{pe.entry.type}</span>
              </Link>
              <form action={removeProjectEntry}>
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="entryId" value={pe.entryId} />
                <button type="submit" title="Remove from project" className="text-gray-500 hover:text-red-400">
                  <X size={16} />
                </button>
              </form>
            </div>
          ))}
        </div>

        {available.length > 0 ? (
          <form action={addProjectEntry} className="flex gap-2">
            <input type="hidden" name="projectId" value={project.id} />
            <select
              name="entryId"
              required
              className="flex-1 rounded-md border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
            >
              <option value="">Add a part…</option>
              {available.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.type})
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light">
              Add
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600">Every entry in your knowledge base is already linked.</p>
        )}
      </section>
    </div>
  );
}
