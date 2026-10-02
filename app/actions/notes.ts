"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const norm = (v: FormDataEntryValue | null) => String(v ?? "").replace(/\r\n/g, "\n").trim();
const text = (fd: FormData, key: string) => norm(fd.get(key));

// Notes are shown inline on the entry page (see EntryNotes.tsx), so these
// actions just revalidate that page rather than redirecting anywhere new.

export async function createNote(formData: FormData) {
  const entryId = text(formData, "entryId");
  const content = text(formData, "content");
  const slug = text(formData, "slug");
  if (entryId && content) {
    await prisma.note.create({ data: { entryId, content } });
  }
  revalidatePath(`/entry/${slug}`);
}

export async function updateNote(formData: FormData) {
  const id = text(formData, "id");
  const content = text(formData, "content");
  const slug = text(formData, "slug");
  if (id && content) {
    await prisma.note.update({ where: { id }, data: { content } });
  }
  revalidatePath(`/entry/${slug}`);
  revalidatePath("/notes");
}

export async function deleteNote(formData: FormData) {
  const id = text(formData, "id");
  const slug = text(formData, "slug");
  if (id) await prisma.note.delete({ where: { id } }).catch(() => null);
  revalidatePath(`/entry/${slug}`);
  revalidatePath("/notes");
}
