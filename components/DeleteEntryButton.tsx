"use client";

// A tiny Client Component: the browser's confirm() popup only exists in the
// browser, so this one piece can't be a Server Component.

export default function DeleteEntryButton({
  action,
  id,
  title,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  title: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
            e.preventDefault();
          }
        }}
        className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
      >
        Delete
      </button>
    </form>
  );
}
