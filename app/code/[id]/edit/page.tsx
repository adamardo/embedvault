import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SnippetForm from "@/components/SnippetForm";
import { updateSnippet } from "@/app/actions/snippets";
import { DEFAULT_PLATFORMS } from "@/lib/platforms";

export const dynamic = "force-dynamic";

export default async function EditSnippetPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const s = await prisma.codeSnippet.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } } },
  });
  if (!s) notFound();

  const [entries, used] = await Promise.all([
    prisma.entry.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.codeSnippet.findMany({ select: { platform: true }, distinct: ["platform"] }),
  ]);
  const platformOptions = Array.from(new Set([...used.map((u) => u.platform), ...DEFAULT_PLATFORMS]));

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href={`/code/${s.id}`} className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">Edit: {s.title}</h1>
      <SnippetForm
        action={updateSnippet}
        submitLabel="Save changes"
        error={searchParams.error}
        entries={entries}
        platformOptions={platformOptions}
        defaults={{ ...s, tags: s.tags.map((t) => t.tag.name).join(", ") }}
      />
    </div>
  );
}
