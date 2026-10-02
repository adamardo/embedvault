"use server";

// Server Actions: functions marked "use server" that run on the server but
// can be called directly from a <form action={...}>. No API route needed.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ENTRY_FIELDS, isEntryType } from "@/lib/entry-types";
import { slugify } from "@/lib/slugify";

// Read a form value as trimmed text.
function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// Collect all the long-text sections; empty boxes are stored as null.
function readFields(formData: FormData) {
  const out: Record<string, string | null> = {};
  for (const f of ENTRY_FIELDS) {
    const v = text(formData, f.name);
    out[f.name] = v === "" ? null : v;
  }
  return out;
}

// Make a slug that doesn't collide: esp32, esp32-2, esp32-3 ...
async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await prisma.entry.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

// "ESP32, #IoT, uart" -> tags ESP32, IoT, uart (created if new).
async function setTags(entryId: string, raw: string) {
  const names = Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().replace(/^#+/, ""))
        .filter(Boolean)
    )
  );
  await prisma.entryTag.deleteMany({ where: { entryId } });
  for (const name of names) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.entryTag.create({ data: { entryId, tagId: tag.id } });
  }
}

function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

export async function createEntry(formData: FormData) {
  const title = text(formData, "title");
  const type = text(formData, "type");
  const summary = text(formData, "summary");

  if (!title) fail("/entry/new", "Title is required.");
  if (!isEntryType(type)) fail("/entry/new", "Please choose a valid type.");
  if (!summary) fail("/entry/new", "A short summary is required.");

  const slug = await uniqueSlug(title);
  const entry = await prisma.entry.create({
    data: { title, type, slug, summary, ...readFields(formData) },
  });
  await setTags(entry.id, text(formData, "tags"));

  revalidatePath("/");
  redirect(`/entry/${entry.slug}`);
}

export async function updateEntry(formData: FormData) {
  const id = text(formData, "id");
  const slug = text(formData, "slug");
  const title = text(formData, "title");
  const type = text(formData, "type");
  const summary = text(formData, "summary");
  const editPath = `/entry/${slug}/edit`;

  if (!id || !slug) redirect("/");
  if (!title) fail(editPath, "Title is required.");
  if (!isEntryType(type)) fail(editPath, "Please choose a valid type.");
  if (!summary) fail(editPath, "A short summary is required.");

  // The slug is kept as-is on edit so existing links never break.
  await prisma.entry.update({
    where: { id },
    data: { title, type, summary, ...readFields(formData) },
  });
  await setTags(id, text(formData, "tags"));

  revalidatePath("/");
  revalidatePath(`/entry/${slug}`);
  redirect(`/entry/${slug}`);
}

export async function deleteEntry(formData: FormData) {
  const id = text(formData, "id");
  if (id) {
    // Tags links, notes, favorites, relations cascade-delete (see schema).
    await prisma.entry.delete({ where: { id } }).catch(() => null);
  }
  revalidatePath("/");
  redirect("/");
}
