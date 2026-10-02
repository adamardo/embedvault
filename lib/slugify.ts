// Turns "HC-SR04 Sensor" into "hc-sr04-sensor" for use in URLs.
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // "new" is reserved: /entry/new is the create page.
  return slug === "" || slug === "new" ? "entry" : slug;
}
