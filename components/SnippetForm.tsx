// One form for creating AND editing a code snippet.

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  entries: { id: string; title: string }[]; // for the "related entry" dropdown
  platformOptions: string[];
  defaults?: {
    id?: string;
    title?: string;
    platform?: string;
    language?: string;
    style?: string | null;
    description?: string | null;
    hardwareRequired?: string | null;
    wiring?: string | null;
    code?: string;
    explanation?: string | null;
    expectedOutput?: string | null;
    commonErrors?: string | null;
    tags?: string;
    entryId?: string | null;
  };
};

const inputClass =
  "w-full rounded-md border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent";
const LANGUAGES = ["C", "C++", "Arduino", "MicroPython", "Python", "Bash"];
const STYLES = ["Bare-metal", "HAL", "LL", "Arduino framework", "ESP-IDF", "FreeRTOS"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-400">{label}</span>
      {children}
    </label>
  );
}

export default function SnippetForm({ action, submitLabel, error, entries, platformOptions, defaults = {} }: Props) {
  return (
    <form action={action} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
      )}
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <Field label="Title *">
        <input name="title" required defaultValue={defaults.title} placeholder="e.g. STM32F401 Bare-Metal GPIO LED Blink" className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Platform *">
          <input name="platform" required list="platform-list" defaultValue={defaults.platform} placeholder="ESP32" className={inputClass} />
          <datalist id="platform-list">
            {platformOptions.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field label="Language *">
          <input name="language" required list="language-list" defaultValue={defaults.language} placeholder="C" className={inputClass} />
          <datalist id="language-list">
            {LANGUAGES.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Field>
        <Field label="Style">
          <input name="style" list="style-list" defaultValue={defaults.style ?? ""} placeholder="Bare-metal" className={inputClass} />
          <datalist id="style-list">
            {STYLES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Description">
        <input name="description" defaultValue={defaults.description ?? ""} placeholder="What does this code do?" className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tags (comma separated)">
          <input name="tags" defaultValue={defaults.tags} placeholder="GPIO, BareMetal, STM32" className={inputClass} />
        </Field>
        <Field label="Related entry (optional)">
          <select name="entryId" defaultValue={defaults.entryId ?? ""} className={inputClass}>
            <option value="">None</option>
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Hardware required">
        <textarea name="hardwareRequired" rows={2} defaultValue={defaults.hardwareRequired ?? ""} className={`${inputClass} font-mono`} />
      </Field>
      <Field label="Wiring">
        <textarea name="wiring" rows={3} defaultValue={defaults.wiring ?? ""} className={`${inputClass} font-mono`} />
      </Field>
      <Field label="Code *">
        <textarea name="code" required rows={16} spellCheck={false} defaultValue={defaults.code ?? ""} className={`${inputClass} font-mono text-xs`} />
      </Field>
      <Field label="Explanation">
        <textarea name="explanation" rows={4} defaultValue={defaults.explanation ?? ""} className={inputClass} />
      </Field>
      <Field label="Expected output">
        <textarea name="expectedOutput" rows={2} defaultValue={defaults.expectedOutput ?? ""} className={inputClass} />
      </Field>
      <Field label="Common errors">
        <textarea name="commonErrors" rows={3} defaultValue={defaults.commonErrors ?? ""} className={inputClass} />
      </Field>

      <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light">
        {submitLabel}
      </button>
    </form>
  );
}
