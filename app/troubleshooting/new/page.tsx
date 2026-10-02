import Link from "next/link";
import { prisma } from "@/lib/prisma";
import GuideForm from "@/components/GuideForm";
import { createGuide } from "@/app/actions/guides";

export const dynamic = "force-dynamic";

export default async function NewGuidePage({ searchParams }: { searchParams: { error?: string } }) {
  const entries = await prisma.entry.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/troubleshooting" className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">New troubleshooting guide</h1>
      <GuideForm action={createGuide} submitLabel="Create guide" error={searchParams.error} entries={entries} />
    </div>
  );
}
