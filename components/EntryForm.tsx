import { ENTRY_FIELDS, EntryType, TYPE_LABELS } from "@/lib/entry-types";

// One form used for BOTH creating and editing an entry.
// `action` is the server action to run on submit; `defaults` pre-fills it.

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  defaults?: {
    id?: string;
    slug?: string;
    title?: string;
    type?: string;
    summary?: string;
    tags?: string;
    fields?: Record<string, string | null>;
  };
};

const inputClass =
  "w-full rounded-md border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent";

export default function EntryForm({ action, submitLabel, error, defaults = {} }: Props) {
  return (
    <form action={action} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {defaults.slug && <input type="hidden" name="slug" value={defaults.slug} />}

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="sm:col-span-2 block">
          <span className="mb-1 block text-sm text-gray-400">Title *</span>
          <input
            name="title"
            required
            defaultValue={defaults.title}
            placeholder="e.g. ESP32"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-gray-400">Type *</span>
          <select name="type" defaultValue={defaults.type ?? EntryType.COMPONENT} className={inputClass}>
            {Object.values(EntryType).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-gray-400">Summary * (one line, shown in lists)</span>
        <input
          name="summary"
          required
          defaultValue={defaults.summary}
          placeholder="What is it, in one sentence?"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-gray-400">Tags (comma separated)</span>
        <input
          name="tags"
          defaultValue={defaults.tags}
          placeholder="ESP32, IoT, UART"
          className={inputClass}
        />
      </label>

      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          All sections below are optional. Leave a box empty and that section is hidden on the entry page.
        </p>
        {ENTRY_FIELDS.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-sm text-gray-400">{f.label}</span>
            <textarea
              name={f.name}
              rows={f.rows}
              defaultValue={defaults.fields?.[f.name] ?? ""}
              className={`${inputClass} font-mono`}
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light"
      >
        {submitLabel}
      </button>
    </form>
  );
}
