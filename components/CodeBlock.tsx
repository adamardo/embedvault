import hljs from "highlight.js/lib/core";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import arduino from "highlight.js/lib/languages/arduino";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
import CopyButton from "@/components/CopyButton";

// Only the languages we need are loaded (keeps the app small).
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("arduino", arduino);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("plaintext", plaintext);

// Maps the free-text "Language" field of a snippet to a highlight.js language.
function toHljs(language: string): string {
  switch (language.trim().toLowerCase()) {
    case "c":
      return "c";
    case "c++":
    case "cpp":
      return "cpp";
    case "arduino":
      return "arduino";
    case "python":
    case "micropython":
      return "python";
    case "bash":
    case "shell":
    case "sh":
      return "bash";
    case "json":
      return "json";
    default:
      return "plaintext";
  }
}

export default function CodeBlock({ code, language }: { code: string; language: string }) {
  // highlight() returns already-escaped HTML, so it's safe to inject.
  const html = hljs.highlight(code, { language: toHljs(language), ignoreIllegals: true }).value;

  return (
    <div className="relative">
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
      <pre className="hljs overflow-x-auto rounded-md border border-white/10 bg-black/40 p-4 pr-24 font-mono text-xs leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
