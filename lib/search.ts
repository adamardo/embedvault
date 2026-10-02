import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ENTRY_FIELDS, TYPE_LABELS, EntryType, isEntryType } from "@/lib/entry-types";
import { tokenize, scoreFields, enoughMatched } from "@/lib/search-text";

// One row in the results list, whatever kind of thing it is.
export type ResultItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  href: string | null;
  badge?: string;
  matchedIn?: { label: string; excerpt: string };
  score: number;
};

export type ResultGroup = { key: string; label: string; items: ResultItem[]; topScore: number };

const PER_GROUP = 20;

// Small helpers to build "column contains token" conditions.
const tagLike = (t: string) => ({ tags: { some: { tag: { name: { contains: t } } } } });
const joinTags = (tags: { tag: { name: string } }[]) => tags.map((x) => x.tag.name).join(" ");

export async function search(query: string) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return { tokens, groups: [] as ResultGroup[], total: 0 };

  // Step 1: the database over-fetches candidates that contain ANY token.
  // Step 2: we score each candidate in JavaScript and keep the good ones.
  const entryWhere: Prisma.EntryWhereInput = {
    OR: tokens.flatMap((t) => [
      { title: { contains: t } },
      { summary: { contains: t } },
      { type: { contains: t } },
      tagLike(t),
      ...ENTRY_FIELDS.map((f) => ({ [f.name]: { contains: t } }) as Prisma.EntryWhereInput),
    ]),
  };

  const parentLike = (t: string): Prisma.EntryWhereInput[] => [
    { title: { contains: t } },
    tagLike(t),
  ];

  const snippetWhere: Prisma.CodeSnippetWhereInput = {
    OR: tokens.flatMap((t) => [
      { title: { contains: t } },
      { platform: { contains: t } },
      { language: { contains: t } },
      { style: { contains: t } },
      { description: { contains: t } },
      { hardwareRequired: { contains: t } },
      { wiring: { contains: t } },
      { code: { contains: t } },
      { explanation: { contains: t } },
      { expectedOutput: { contains: t } },
      { commonErrors: { contains: t } },
      tagLike(t),
      { entry: { is: { OR: parentLike(t) } } },
    ]),
  };

  const guideWhere: Prisma.TroubleshootingGuideWhereInput = {
    OR: tokens.flatMap((t) => [
      { problem: { contains: t } },
      { possibleCauses: { contains: t } },
      { symptoms: { contains: t } },
      { diagnosticSteps: { contains: t } },
      { solution: { contains: t } },
      { example: { contains: t } },
      { commonMistakes: { contains: t } },
      { entry: { is: { OR: parentLike(t) } } },
    ]),
  };

  const projectWhere: Prisma.ProjectWhereInput = {
    OR: tokens.flatMap((t) => [
      { title: { contains: t } },
      { description: { contains: t } },
      { status: { contains: t } },
      { entries: { some: { entry: { OR: parentLike(t) } } } },
    ]),
  };

  const parentSelect = { select: { slug: true, title: true, tags: { include: { tag: true } } } } as const;

  const [entryRows, snippetRows, guideRows, projectRows] = await Promise.all([
    prisma.entry.findMany({ where: entryWhere, include: { tags: { include: { tag: true } } }, take: 100 }),
    prisma.codeSnippet.findMany({
      where: snippetWhere,
      include: { entry: parentSelect, tags: { include: { tag: true } } },
      take: 100,
    }),
    prisma.troubleshootingGuide.findMany({ where: guideWhere, include: { entry: parentSelect }, take: 100 }),
    prisma.project.findMany({
      where: projectWhere,
      include: { entries: { include: { entry: { include: { tags: { include: { tag: true } } } } } } },
      take: 100,
    }),
  ]);

  const groups: ResultGroup[] = [];
  const addGroup = (key: string, label: string, items: ResultItem[]) => {
    const sorted = items.sort((a, b) => b.score - a.score).slice(0, PER_GROUP);
    if (sorted.length > 0) groups.push({ key, label, items: sorted, topScore: sorted[0].score });
  };

  // ---- Knowledge entries, grouped by type ----
  const entryItems = entryRows.flatMap((e) => {
    const r = scoreFields(
      [
        { label: "Title", text: e.title, weight: 10, primary: true },
        { label: "Summary", text: e.summary, weight: 5, primary: true },
        { label: "Category", text: isEntryType(e.type) ? TYPE_LABELS[e.type] : e.type, weight: 4, primary: true },
        { label: "Tags", text: joinTags(e.tags), weight: 8, primary: true },
        ...ENTRY_FIELDS.map((f) => ({
          label: f.label,
          text: (e as Record<string, unknown>)[f.name] as string | null,
          weight: f.name === "overview" ? 2 : 1,
        })),
      ],
      tokens
    );
    if (!enoughMatched(r.matched, tokens.length)) return [];
    const item: ResultItem = {
      id: e.id,
      title: e.title,
      subtitle: e.summary,
      href: `/entry/${e.slug}`,
      badge: joinTags(e.tags) ? e.tags.map((t) => `#${t.tag.name}`).join(" ") : undefined,
      matchedIn: r.matchedIn,
      score: r.score,
    };
    return [{ type: e.type, item }];
  });

  for (const type of Object.values(EntryType)) {
    const label = { MICROCONTROLLER: "Microcontrollers", COMPONENT: "Components", CONCEPT: "Concepts", PROTOCOL: "Protocols" }[type];
    addGroup(type, label, entryItems.filter((x) => x.type === type).map((x) => x.item));
  }

  // ---- Code snippets ----
  addGroup(
    "code",
    "Code",
    snippetRows.flatMap((s) => {
      const r = scoreFields(
        [
          { label: "Title", text: s.title, weight: 8, primary: true },
          { label: "Platform", text: s.platform, weight: 5, primary: true },
          { label: "Language", text: s.language, weight: 3, primary: true },
          { label: "Style", text: s.style, weight: 3, primary: true },
          { label: "Tags", text: joinTags(s.tags), weight: 8, primary: true },
          { label: "Entry", text: s.entry?.title, weight: 3, primary: true },
          { label: "Entry tags", text: s.entry ? joinTags(s.entry.tags) : "", weight: 3, primary: true },
          { label: "Description", text: s.description, weight: 3 },
          { label: "Hardware", text: s.hardwareRequired, weight: 1 },
          { label: "Wiring", text: s.wiring, weight: 1 },
          { label: "Code", text: s.code, weight: 1 },
          { label: "Explanation", text: s.explanation, weight: 1 },
          { label: "Expected output", text: s.expectedOutput, weight: 1 },
          { label: "Common errors", text: s.commonErrors, weight: 1 },
        ],
        tokens
      );
      if (!enoughMatched(r.matched, tokens.length)) return [];
      return [
        {
          id: s.id,
          title: s.title,
          subtitle: s.description,
          href: `/code/${s.id}`,
          badge: [s.platform, s.language, s.style].filter(Boolean).join(" · "),
          matchedIn: r.matchedIn,
          score: r.score,
        },
      ];
    })
  );

  // ---- Troubleshooting guides ----
  addGroup(
    "troubleshooting",
    "Troubleshooting",
    guideRows.flatMap((g) => {
      const r = scoreFields(
        [
          { label: "Problem", text: g.problem, weight: 10, primary: true },
          { label: "Entry", text: g.entry?.title, weight: 4, primary: true },
          { label: "Entry tags", text: g.entry ? joinTags(g.entry.tags) : "", weight: 3, primary: true },
          { label: "Symptoms", text: g.symptoms, weight: 4 },
          { label: "Possible causes", text: g.possibleCauses, weight: 3 },
          { label: "Diagnostic steps", text: g.diagnosticSteps, weight: 2 },
          { label: "Solution", text: g.solution, weight: 2 },
          { label: "Example", text: g.example, weight: 1 },
          { label: "Common mistakes", text: g.commonMistakes, weight: 1 },
        ],
        tokens
      );
      if (!enoughMatched(r.matched, tokens.length)) return [];
      return [
        {
          id: g.id,
          title: g.problem,
          subtitle: null,
          href: `/troubleshooting/${g.id}`,
          badge: g.entry ? `Related: ${g.entry.title}` : undefined,
          matchedIn: r.matchedIn,
          score: r.score,
        },
      ];
    })
  );

  // ---- Projects ----
  addGroup(
    "projects",
    "Projects",
    projectRows.flatMap((p) => {
      const r = scoreFields(
        [
          { label: "Title", text: p.title, weight: 10, primary: true },
          { label: "Description", text: p.description, weight: 4, primary: true },
          { label: "Status", text: p.status, weight: 1, primary: true },
          { label: "Uses", text: p.entries.map((x) => x.entry.title).join(", "), weight: 5 },
          { label: "Linked tags", text: p.entries.map((x) => joinTags(x.entry.tags)).join(" "), weight: 3 },
        ],
        tokens
      );
      if (!enoughMatched(r.matched, tokens.length)) return [];
      return [
        {
          id: p.id,
          title: p.title,
          subtitle: p.description,
          href: `/projects/${p.id}`,
          badge: p.status ?? undefined,
          matchedIn: r.matchedIn,
          score: r.score,
        },
      ];
    })
  );

  groups.sort((a, b) => b.topScore - a.topScore);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return { tokens, groups, total };
}
