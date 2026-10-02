"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseTagNames } from "@/lib/tags";

// Browsers send textarea line breaks as \r\n; store plain \n instead.
const norm = (v: FormDataEntryValue | null) => String(v ?? "").replace(/\r\n/g, "\n");
const text = (fd: FormData, key: string) => norm(fd.get(key)).trim();
const optional = (fd: FormData, key: string) => {
  const v = text(fd, key);
  return v === "" ? null : v;
};

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function setTags(snippetId: string, raw: string) {
  await prisma.snippetTag.deleteMany({ where: { snippetId } });
  for (const name of parseTagNames(raw)) {
    const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
    await prisma.snippetTag.create({ data: { snippetId, tagId: tag.id } });
  }
}

async function readSnippet(fd: FormData) {
  // Code keeps its indentation: only strip blank lines at the start and whitespace at the end.
  const code = norm(fd.get("code")).replace(/^\n+/, "").replace(/\s+$/, "");

  // Only accept a related entry that really exists.
  const entryId = text(fd, "entryId");
  const entry = entryId ? await prisma.entry.findUnique({ where: { id: entryId }, select: { id: true } }) : null;

  return {
    title: text(fd, "title"),
    platform: text(fd, "platform"),
    language: text(fd, "language"),
    style: optional(fd, "style"),
    description: optional(fd, "description"),
    hardwareRequired: optional(fd, "hardwareRequired"),
    wiring: optional(fd, "wiring"),
    code,
    explanation: optional(fd, "explanation"),
    expectedOutput: optional(fd, "expectedOutput"),
    commonErrors: optional(fd, "commonErrors"),
    entryId: entry?.id ?? null,
  };
}

function validate(d: { title: string; platform: string; language: string; code: string }, path: string) {
  if (!d.title) fail(path, "Title is required.");
  if (!d.platform) fail(path, "Platform is required.");
  if (!d.language) fail(path, "Language is required.");
  if (!d.code.trim()) fail(path, "Code is required.");
}

export async function createSnippet(formData: FormData) {
  const data = await readSnippet(formData);
  validate(data, "/code/new");

  const snippet = await prisma.codeSnippet.create({ data });
  await setTags(snippet.id, text(formData, "tags"));

  revalidatePath("/code");
  revalidatePath("/");
  redirect(`/code/${snippet.id}`);
}

export async function updateSnippet(formData: FormData) {
  const id = text(formData, "id");
  if (!id) redirect("/code");

  const data = await readSnippet(formData);
  validate(data, `/code/${id}/edit`);

  await prisma.codeSnippet.update({ where: { id }, data });
  await setTags(id, text(formData, "tags"));

  revalidatePath("/code");
  revalidatePath(`/code/${id}`);
  redirect(`/code/${id}`);
}

export async function deleteSnippet(formData: FormData) {
  const id = text(formData, "id");
  if (id) await prisma.codeSnippet.delete({ where: { id } }).catch(() => null);
  revalidatePath("/code");
  revalidatePath("/");
  redirect("/code");
}
