import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by the search box while you type. Returns a few quick suggestions:
// matching entry titles, tags, and troubleshooting problems.

export const dynamic = "force-dynamic";

type Suggestion = { kind: "entry" | "tag" | "problem"; label: string; href: string };

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const [entries, tags, guides] = await Promise.all([
    prisma.entry.findMany({
      where: { OR: [{ title: { contains: q } }, { tags: { some: { tag: { name: { contains: q } } } } }] },
      select: { title: true, slug: true },
      take: 8,
    }),
    prisma.tag.findMany({ where: { name: { contains: q } }, take: 3, orderBy: { name: "asc" } }),
    prisma.troubleshootingGuide.findMany({ where: { problem: { contains: q } }, select: { problem: true }, take: 3 }),
  ]);

  const lower = q.toLowerCase();
  // Titles that START with what you typed come first.
  entries.sort((a, b) => Number(b.title.toLowerCase().startsWith(lower)) - Number(a.title.toLowerCase().startsWith(lower)));

  const suggestions: Suggestion[] = [
    ...entries.slice(0, 5).map((e): Suggestion => ({ kind: "entry", label: e.title, href: `/entry/${e.slug}` })),
    ...tags.map((t): Suggestion => ({ kind: "tag", label: `#${t.name}`, href: `/search?q=${encodeURIComponent(t.name)}` })),
    ...guides.map((g): Suggestion => ({ kind: "problem", label: g.problem, href: `/search?q=${encodeURIComponent(g.problem)}` })),
  ];

  return NextResponse.json({ suggestions });
}
