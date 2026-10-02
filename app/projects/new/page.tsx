import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import { createProject } from "@/app/actions/projects";

export default function NewProjectPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">New project</h1>
      <ProjectForm action={createProject} submitLabel="Create project" error={searchParams.error} />
    </div>
  );
}
