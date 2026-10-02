"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// One form, one action: if a favorite exists it's removed, otherwise it's
// added. `redirectTo` lets the button work the same on the entry page and
// on the Favorites list (where removing one should refresh that list).
export async function toggleFavorite(formData: FormData) {
  const entryId = text(formData, "entryId");
  if (!entryId) return;

  const existing = await prisma.favorite.findUnique({ where: { entryId } });
  if (existing) {
    await prisma.favorite.delete({ where: { entryId } });
  } else {
    await prisma.favorite.create({ data: { entryId } });
  }

  revalidatePath("/entry/[slug]", "page");
  revalidatePath("/favorites");
  revalidatePath("/");
}
