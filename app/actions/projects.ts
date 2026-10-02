"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const norm = (v: FormDataEntryValue | null) => String(v ?? "").replace(/\r\n/g, "\n");
const text = (fd: FormData, key: string) => norm(fd.get(key)).trim();
const optional = (fd: FormData, key: string) => {
  const v = text(fd, key);
  return v === "" ? null : v;
};

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createProject(formData: FormData) {
  const title = text(formData, "title");
  if (!title) fail("/projects/new", "Title is required.");

  const project = await prisma.project.create({
    data: {
      title,
      description: optional(formData, "description"),
      status: optional(formData, "status"),
    },
  });

  revalidatePath("/projects");
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(formData: FormData) {
  const id = text(formData, "id");
  if (!id) redirect("/projects");

  const title = text(formData, "title");
  if (!title) fail(`/projects/${id}/edit`, "Title is required.");

  await prisma.project.update({
    where: { id },
    data: {
      title,
      description: optional(formData, "description"),
      status: optional(formData, "status"),
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(formData: FormData) {
  const id = text(formData, "id");
  if (id) await prisma.project.delete({ where: { id } }).catch(() => null);
  revalidatePath("/projects");
  revalidatePath("/");
  redirect("/projects");
}

// Linking/unlinking entries happens right on the project page, so these
// redirect back there instead of somewhere new.

export async function addProjectEntry(formData: FormData) {
  const projectId = text(formData, "projectId");
  const entryId = text(formData, "entryId");
  if (projectId && entryId) {
    await prisma.projectEntry.upsert({
      where: { projectId_entryId: { projectId, entryId } },
      update: {},
      create: { projectId, entryId },
    });
  }
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function removeProjectEntry(formData: FormData) {
  const projectId = text(formData, "projectId");
  const entryId = text(formData, "entryId");
  if (projectId && entryId) {
    await prisma.projectEntry.delete({ where: { projectId_entryId: { projectId, entryId } } }).catch(() => null);
  }
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}
