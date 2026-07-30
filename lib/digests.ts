import { getAllPosts, type PostMeta } from "./posts";

// Registry of full-HTML "燈塔文摘" (Lighthouse Digest) articles.
// These are self-contained interactive HTML pages served from app/<slug>/route.ts
// (static segments take precedence over the [slug] markdown route), so they can't
// be discovered by scanning content/*.md — each published digest registers its
// metadata here to appear on the homepage, in the blog JSON-LD, and in sitemap.xml.
// The lighthouse-digest skill appends one entry per published digest.
export type DigestMeta = PostMeta;

export const digests: DigestMeta[] = [
  { title: "我們正在衡量 AI 已經做得比人好的那一半", date: "2026-07-29", slug: "measuring-the-half-ai-does-better", excerpt: "我們想拿來衡量工程師的那些指標——bug 數、修復速度、缺陷率——描述的正好是 agent 已經做得不錯的那一半工作。" },
  { title: "我们正在衡量 AI 已经做得比人好的那一半", date: "2026-07-29", slug: "measuring-the-half-ai-does-better-cn", excerpt: "我们想拿来衡量工程师的那些指标——bug 数、修复速度、缺陷率——描述的正好是 agent 已经做得不错的那一半工作。" },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const URL_SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(slug: string, message: string): never {
  // Thrown at build time so a bad registry entry fails `next build` loudly,
  // matching the validation philosophy of lib/posts.ts.
  throw new Error(`[digests] "${slug}": ${message}`);
}

function validate(d: DigestMeta): void {
  if (typeof d.title !== "string" || d.title.trim() === "")
    fail(d.slug, "`title` is required and must be a non-empty string");
  if (typeof d.date !== "string" || !ISO_DATE.test(d.date) || Number.isNaN(new Date(d.date).getTime()))
    fail(d.slug, `\`date\` must be a real ISO date, got "${d.date}"`);
  if (typeof d.slug !== "string" || !URL_SAFE_SLUG.test(d.slug))
    fail(d.slug, "`slug` must be lowercase URL-safe (a-z, 0-9, hyphens)");
  if (typeof d.excerpt !== "string" || d.excerpt.trim() === "")
    fail(d.slug, "`excerpt` is required (used for the homepage dek and sitemap)");
}

// All articles — markdown posts plus registered digests — newest first.
export function getAllEntries(): PostMeta[] {
  const posts = getAllPosts();
  const bySlug = new Map<string, string>(posts.map((p) => [p.slug, p.sourceFile]));
  for (const d of digests) {
    validate(d);
    const existing = bySlug.get(d.slug);
    if (existing)
      fail(d.slug, `slug collides with ${existing} — a digest route would shadow that article`);
    bySlug.set(d.slug, "lib/digests.ts");
  }
  const entries: PostMeta[] = [
    ...posts.map(({ title, date, slug, excerpt }) => ({ title, date, slug, excerpt })),
    ...digests,
  ];
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}
