// "ESP32, #IoT, uart" -> ["ESP32", "IoT", "uart"] (no duplicates, no "#").
export function parseTagNames(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().replace(/^#+/, ""))
        .filter(Boolean)
    )
  );
}
