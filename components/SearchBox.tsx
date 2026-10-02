"use client";

// The search input with autocomplete. It's a Client Component because it
// reacts to typing (state + fetch), which servers can't do.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

type Suggestion = { kind: "entry" | "tag" | "problem"; label: string; href: string };

const kindLabel: Record<Suggestion["kind"], string> = {
  entry: "Entry",
  tag: "Tag",
  problem: "Problem",
};

export default function SearchBox({
  defaultValue = "",
  size = "large",
}: {
  defaultValue?: string;
  size?: "large" | "compact";
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  // Debounce: wait 200ms after the last keystroke, then ask the server.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = await res.json();
        setItems(data.suggestions ?? []);
      } catch {
        /* aborted or offline: keep the old suggestions */
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const large = size === "large";

  return (
    <form onSubmit={submit} role="search" className="relative">
      <Search
        size={large ? 18 : 15}
        className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${large ? "left-4" : "left-3"}`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={large ? "What are you looking for?" : "Search…"}
        autoComplete="off"
        className={`w-full rounded-lg border border-white/10 bg-[#12141a] text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent ${
          large ? "py-3 pl-11 pr-4 text-sm" : "py-2 pl-9 pr-3 text-sm"
        }`}
      />

      {open && items.length > 0 && (
        <ul
          className={`absolute left-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#171a21] shadow-xl ${
            large ? "w-full" : "w-80"
          }`}
        >
          {items.map((s, i) => (
            <li key={`${s.kind}-${i}`}>
              <Link
                href={s.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
              >
                <span className="truncate">{s.label}</span>
                <span className="shrink-0 text-xs text-gray-500">{kindLabel[s.kind]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
