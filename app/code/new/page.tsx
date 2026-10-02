import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SnippetForm from "@/components/SnippetForm";
import { createSnippet } from "@/app/actions/snippets";
import { DEFAULT_PLATFORMS } from "@/lib/platforms";

export const dynamic = "force-dynamic";

export default async function NewSnippetPage({ searchParams }: { searchParams: { error?: string } }) {
  const [entries, used] = await Promise.all([
    prisma.entry.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.codeSnippet.findMany({ select: { platform: true }, distinct: ["platform"] }),
  ]);
  const platformOptions = Array.from(new Set([...used.map((u) => u.platform), ...DEFAULT_PLATFORMS]));

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/code" className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">New code snippet</h1>
      <SnippetForm
        action={createSnippet}
        submitLabel="Create snippet"
        error={searchParams.error}
        entries={entries}
        platformOptions={platformOptions}
      />
    </div>
  );
}
