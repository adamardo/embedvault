"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Copies text to the clipboard. Client Component: the clipboard only exists in the browser.
export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked by the browser: do nothing */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#171a21] px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
