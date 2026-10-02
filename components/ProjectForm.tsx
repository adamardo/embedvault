// One form for creating AND editing a project. Linking entries happens
// separately on the project's own page, once it exists.

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  defaults?: { id?: string; title?: string; description?: string | null; status?: string | null };
};

const inputClass =
  "w-full rounded-md border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent";
const STATUSES = ["Planned", "In progress", "Done", "On hold"];

export default function ProjectForm({ action, submitLabel, error, defaults = {} }: Props) {
  return (
    <form action={action} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
      )}
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <label className="block">
        <span className="mb-1 block text-sm text-gray-400">Title *</span>
        <input name="title" required defaultValue={defaults.title} placeholder="e.g. Smart Irrigation" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-gray-400">Status</span>
        <input name="status" list="status-list" defaultValue={defaults.status ?? ""} placeholder="Planned" className={inputClass} />
        <datalist id="status-list">
          {STATUSES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-gray-400">Description</span>
        <textarea name="description" rows={5} defaultValue={defaults.description ?? ""} className={inputClass} />
      </label>

      <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light">
        {submitLabel}
      </button>
    </form>
  );
}
