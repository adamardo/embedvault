import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/ProjectForm";
import { updateProject } from "@/app/actions/projects";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href={`/projects/${project.id}`} className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">Edit project</h1>
      <ProjectForm action={updateProject} submitLabel="Save changes" error={searchParams.error} defaults={project} />
    </div>
  );
}
