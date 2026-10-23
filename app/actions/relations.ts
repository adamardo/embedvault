"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCanAdd, requireMember } from "@/lib/permissions";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// A relation is stored with a direction (fromEntryId -> toEntryId), but the
// entry page shows it as a simple two-way link on BOTH entries (it reads
// relationsFrom AND relationsTo). Whichever entry you add the link from
// becomes the "from" side.
export async function addRelation(formData: FormData) {
  await requireCanAdd();
  const fromEntryId = text(formData, "fromEntryId");
  const toEntryId = text(formData, "toEntryId");
  const slug = text(formData, "slug");
  const label = text(formData, "label") || null;

  if (fromEntryId && toEntryId && fromEntryId !== toEntryId) {
    // If the pair is already linked the other way round, do nothing:
    // otherwise the same two entries would show up twice.
    const reverseExists = await prisma.relation.findUnique({
      where: { fromEntryId_toEntryId: { fromEntryId: toEntryId, toEntryId: fromEntryId } },
    });
    if (!reverseExists) {
      // upsert = "create it, or update it if it already exists", so
      // clicking Add twice never errors; it just updates the label.
      await prisma.relation.upsert({
        where: { fromEntryId_toEntryId: { fromEntryId, toEntryId } },
        update: { label },
        create: { fromEntryId, toEntryId, label },
      });
    }
  }

  revalidatePath(`/entry/${slug}`);
}

export async function removeRelation(formData: FormData) {
  await requireMember();
  const id = text(formData, "id");
  const slug = text(formData, "slug");
  if (id) await prisma.relation.delete({ where: { id } }).catch(() => null);
  revalidatePath(`/entry/${slug}`);
}
