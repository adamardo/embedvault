// Shows a block of text the way you typed it. If most lines are numbered
// ("1. Check the cable") or dashed ("- Check the cable"), it becomes a
// proper list so causes and steps are easy to scan.

export default function TextBlock({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const numberedRe = /^\d+[.)]\s+/;
  const bulletRe = /^[-*•]\s+/;

  const numbered = lines.filter((l) => numberedRe.test(l)).length;
  const bullets = lines.filter((l) => bulletRe.test(l)).length;
  const half = Math.ceil(lines.length / 2);

  if (lines.length > 1 && numbered >= half) {
    return (
      <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-gray-300">
        {lines.map((l, i) => (
          <li key={i}>{l.replace(numberedRe, "")}</li>
        ))}
      </ol>
    );
  }
  if (lines.length > 1 && bullets >= half) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-300">
        {lines.map((l, i) => (
          <li key={i}>{l.replace(bulletRe, "")}</li>
        ))}
      </ul>
    );
  }
  return <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{text}</p>;
}
