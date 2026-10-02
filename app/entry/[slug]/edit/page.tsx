import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntryForm from "@/components/EntryForm";
import { updateEntry } from "@/app/actions/entries";

export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const entry = await prisma.entry.findUnique({
    where: { slug: params.slug },
    include: { tags: { include: { tag: true } } },
  });
  if (!entry) notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href={`/entry/${entry.slug}`} className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-white">Edit: {entry.title}</h1>
      <EntryForm
        action={updateEntry}
        submitLabel="Save changes"
        error={searchParams.error}
        defaults={{
          id: entry.id,
          slug: entry.slug,
          title: entry.title,
          type: entry.type,
          summary: entry.summary,
          tags: entry.tags.map((t) => t.tag.name).join(", "),
          fields: entry as Record<string, string | null>,
        }}
      />
    </div>
  );
}
