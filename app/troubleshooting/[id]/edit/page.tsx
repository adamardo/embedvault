import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GuideForm from "@/components/GuideForm";
import { updateGuide } from "@/app/actions/guides";

export const dynamic = "force-dynamic";

export default async function EditGuidePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const g = await prisma.troubleshootingGuide.findUnique({ where: { id: params.id } });
  if (!g) notFound();

  const entries = await prisma.entry.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href={`/troubleshooting/${g.id}`} className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">Edit guide</h1>
      <GuideForm action={updateGuide} submitLabel="Save changes" error={searchParams.error} entries={entries} defaults={g} />
    </div>
  );
}
