// One form for creating AND editing a troubleshooting guide.

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  entries: { id: string; title: string }[];
  defaults?: {
    id?: string;
    problem?: string;
    possibleCauses?: string;
    symptoms?: string | null;
    diagnosticSteps?: string;
    solution?: string;
    example?: string | null;
    commonMistakes?: string | null;
    entryId?: string | null;
  };
};

const inputClass =
  "w-full rounded-md border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-400">
        {label}
        {hint && <span className="ml-2 text-xs text-gray-600">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export default function GuideForm({ action, submitLabel, error, entries, defaults = {} }: Props) {
  return (
    <form action={action} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
      )}
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <Field label="Problem *">
        <input name="problem" required defaultValue={defaults.problem} placeholder="e.g. UART gives garbage characters" className={inputClass} />
      </Field>

      <Field label="Related entry (optional)">
        <select name="entryId" defaultValue={defaults.entryId ?? ""} className={inputClass}>
          <option value="">None (general problem)</option>
          {entries.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Symptoms" hint="What you actually see happening">
        <textarea name="symptoms" rows={3} defaultValue={defaults.symptoms ?? ""} className={inputClass} />
      </Field>

      <Field label="Possible causes *" hint="one per line, e.g. “1. Wrong baud rate”">
        <textarea name="possibleCauses" required rows={5} defaultValue={defaults.possibleCauses ?? ""} className={inputClass} />
      </Field>

      <Field label="Diagnostic steps *" hint="one per line, in the order you should try them">
        <textarea name="diagnosticSteps" required rows={5} defaultValue={defaults.diagnosticSteps ?? ""} className={inputClass} />
      </Field>

      <Field label="Solution *">
        <textarea name="solution" required rows={4} defaultValue={defaults.solution ?? ""} className={inputClass} />
      </Field>

      <Field label="Example" hint="a real case where this happened">
        <textarea name="example" rows={3} defaultValue={defaults.example ?? ""} className={inputClass} />
      </Field>

      <Field label="Common mistakes">
        <textarea name="commonMistakes" rows={3} defaultValue={defaults.commonMistakes ?? ""} className={inputClass} />
      </Field>

      <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light">
        {submitLabel}
      </button>
    </form>
  );
}
