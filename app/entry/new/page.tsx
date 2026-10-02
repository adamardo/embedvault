import Link from "next/link";
import EntryForm from "@/components/EntryForm";
import { createEntry } from "@/app/actions/entries";
import { isEntryType } from "@/lib/entry-types";

export default function NewEntryPage({
  searchParams,
}: {
  searchParams: { type?: string; error?: string };
}) {
  const type = searchParams.type && isEntryType(searchParams.type) ? searchParams.type : undefined;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
        ← Cancel
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold text-white">New entry</h1>
      <EntryForm
        action={createEntry}
        submitLabel="Create entry"
        error={searchParams.error}
        defaults={{ type }}
      />
    </div>
  );
}
