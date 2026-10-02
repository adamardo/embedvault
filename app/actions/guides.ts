"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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

async function readGuide(fd: FormData) {
  // Only accept a related entry that really exists.
  const entryId = text(fd, "entryId");
  const entry = entryId ? await prisma.entry.findUnique({ where: { id: entryId }, select: { id: true } }) : null;

  return {
    problem: text(fd, "problem"),
    possibleCauses: text(fd, "possibleCauses"),
    symptoms: optional(fd, "symptoms"),
    diagnosticSteps: text(fd, "diagnosticSteps"),
    solution: text(fd, "solution"),
    example: optional(fd, "example"),
    commonMistakes: optional(fd, "commonMistakes"),
    entryId: entry?.id ?? null,
  };
}

function validate(
  d: { problem: string; possibleCauses: string; diagnosticSteps: string; solution: string },
  path: string
) {
  if (!d.problem) fail(path, "Problem is required.");
  if (!d.possibleCauses) fail(path, "Add at least one possible cause.");
  if (!d.diagnosticSteps) fail(path, "Add at least one diagnostic step.");
  if (!d.solution) fail(path, "Solution is required.");
}

export async function createGuide(formData: FormData) {
  const data = await readGuide(formData);
  validate(data, "/troubleshooting/new");

  const guide = await prisma.troubleshootingGuide.create({ data });

  revalidatePath("/troubleshooting");
  revalidatePath("/");
  redirect(`/troubleshooting/${guide.id}`);
}

export async function updateGuide(formData: FormData) {
  const id = text(formData, "id");
  if (!id) redirect("/troubleshooting");

  const data = await readGuide(formData);
  validate(data, `/troubleshooting/${id}/edit`);

  await prisma.troubleshootingGuide.update({ where: { id }, data });

  revalidatePath("/troubleshooting");
  revalidatePath(`/troubleshooting/${id}`);
  redirect(`/troubleshooting/${id}`);
}

export async function deleteGuide(formData: FormData) {
  const id = text(formData, "id");
  if (id) await prisma.troubleshootingGuide.delete({ where: { id } }).catch(() => null);
  revalidatePath("/troubleshooting");
  revalidatePath("/");
  redirect("/troubleshooting");
}
