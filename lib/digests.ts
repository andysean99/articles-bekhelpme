import { getAllPosts, type PostMeta } from "./posts";

// Registry of full-HTML "燈塔文摘" (Lighthouse Digest) articles.
// These are self-contained interactive HTML pages served from app/<slug>/route.ts
// (static segments take precedence over the [slug] markdown route), so they can't
// be discovered by scanning content/*.md — each published digest registers its
// metadata here to appear on the homepage, in the blog JSON-LD, and in sitemap.xml.
// The lighthouse-digest skill appends one entry per published digest.
export type DigestMeta = PostMeta & {
  // BCP 47 script tag of the digest body. Omitted = the site default (zh-Hant).
  lang?: "zh-Hant" | "zh-Hans";
  // Slug of the primary-language digest this entry translates. Entries carrying
  // this field stay in sitemap.xml / llms.txt / JSON-LD (paired via hreflang)
  // but are hidden from the visible homepage list, so readers see one card per
  // article instead of one per language.
  translationOf?: string;
};

export const digests: DigestMeta[] = [
  { title: "我們正在衡量 AI 已經做得比人好的那一半", date: "2026-07-29", slug: "measuring-the-half-ai-does-better", excerpt: "我們想拿來衡量工程師的那些指標——bug 數、修復速度、缺陷率——描述的正好是 agent 已經做得不錯的那一半工作。", lang: "zh-Hant" },
  { title: "我们正在衡量 AI 已经做得比人好的那一半", date: "2026-07-29", slug: "measuring-the-half-ai-does-better-cn", excerpt: "我们想拿来衡量工程师的那些指标——bug 数、修复速度、缺陷率——描述的正好是 agent 已经做得不错的那一半工作。", lang: "zh-Hans", translationOf: "measuring-the-half-ai-does-better" },
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
  if (d.translationOf !== undefined) {
    if (!digests.some((o) => o.slug === d.translationOf))
      fail(d.slug, `\`translationOf\` points to "${d.translationOf}", which is not a registered digest slug`);
    if (d.translationOf === d.slug)
      fail(d.slug, "`translationOf` must reference a different digest, not itself");
    if (!d.lang)
      fail(d.slug, "a translation entry must declare `lang` so hreflang pairs can be emitted");
  }
}

// All articles — markdown posts plus registered digests — newest first.
export function getAllEntries(): DigestMeta[] {
  const posts = getAllPosts();
  const bySlug = new Map<string, string>(posts.map((p) => [p.slug, p.sourceFile]));
  for (const d of digests) {
    validate(d);
    const existing = bySlug.get(d.slug);
    if (existing)
      fail(d.slug, `slug collides with ${existing} — a digest route would shadow that article`);
    bySlug.set(d.slug, "lib/digests.ts");
  }
  const entries: DigestMeta[] = [
    ...posts.map(({ title, date, slug, excerpt }) => ({ title, date, slug, excerpt })),
    ...digests,
  ];
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}

// Entries for the visible homepage list: one card per article, in the site's
// primary language. Translations stay reachable via hreflang, sitemap, llms.txt.
export function getVisibleEntries(): DigestMeta[] {
  return getAllEntries().filter((e) => !e.translationOf);
}

// Language alternates for a slug: [primary, ...translations], or [] when the
// slug has no registered translation pair. Used for hreflang in sitemap.xml.
export function getLanguageAlternates(slug: string): DigestMeta[] {
  const primary =
    digests.find((d) => d.slug === slug && !d.translationOf) ??
    digests.find((d) => d.slug === digests.find((t) => t.slug === slug)?.translationOf);
  if (!primary) return [];
  const translations = digests.filter((d) => d.translationOf === primary.slug);
  return translations.length ? [primary, ...translations] : [];
}
