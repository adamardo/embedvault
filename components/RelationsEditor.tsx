import Link from "next/link";
import { X } from "lucide-react";
import { addRelation, removeRelation } from "@/app/actions/relations";

type RelatedItem = {
  relationId: string;
  entry: { id: string; slug: string; title: string };
  label: string | null;
};
type Option = { id: string; title: string };

// Plain <form>s that call Server Actions: no client-side JavaScript is
// needed for "add one link, remove one link".
export default function RelationsEditor({
  entryId,
  entrySlug,
  related,
  options,
}: {
  entryId: string;
  entrySlug: string;
  related: RelatedItem[];
  options: Option[];
}) {
  // Don't offer entries that are already linked.
  const linkedIds = new Set(related.map((r) => r.entry.id));
  const available = options.filter((o) => !linkedIds.has(o.id));

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-white">Related</h2>

      {related.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {related.map((r) => (
            <span
              key={r.relationId}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-[#12141a] px-3 py-1.5 text-sm text-gray-300"
            >
              <Link href={`/entry/${r.entry.slug}`} className="hover:text-accent">
                {r.entry.title}
              </Link>
              {r.label && <span className="text-xs text-gray-500">{r.label}</span>}
              <form action={removeRelation}>
                <input type="hidden" name="id" value={r.relationId} />
                <input type="hidden" name="slug" value={entrySlug} />
                <button type="submit" title="Remove link" className="text-gray-500 hover:text-red-400">
                  <X size={13} />
                </button>
              </form>
            </span>
          ))}
        </div>
      )}

      {available.length > 0 ? (
        <form action={addRelation} className="flex flex-wrap gap-2">
          <input type="hidden" name="fromEntryId" value={entryId} />
          <input type="hidden" name="slug" value={entrySlug} />
          <select
            name="toEntryId"
            required
            className="rounded-md border border-white/10 bg-[#0f1115] px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-accent"
          >
            <option value="">Link to…</option>
            {available.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <input
            name="label"
            placeholder="label (optional, e.g. “uses”)"
            className="w-48 rounded-md border border-white/10 bg-[#0f1115] px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5">
            Add link
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          {related.length === 0 ? "No other entries to link to yet." : "Every other entry is already linked."}
        </p>
      )}
    </section>
  );
}
