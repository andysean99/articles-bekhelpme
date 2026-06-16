import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const URL_SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PostMeta = {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
};

export type Post = PostMeta & { content: string; sourceFile: string };

function fail(file: string, message: string): never {
  // Thrown at build time (during getAllPosts) so a bad post fails `next build`
  // loudly with the offending file path, instead of shipping a broken route.
  throw new Error(`[content] ${file}: ${message}`);
}

function parsePost(fileName: string): Post {
  const fullPath = path.join(CONTENT_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const title = data.title;
  const date = data.date;
  const slug = data.slug;
  const excerpt = data.excerpt;

  if (typeof title !== "string" || title.trim() === "")
    fail(fileName, "frontmatter `title` is required and must be a non-empty string");
  if (typeof date !== "string" || !ISO_DATE.test(date))
    fail(fileName, "frontmatter `date` is required and must be ISO format YYYY-MM-DD");
  if (Number.isNaN(new Date(date).getTime()))
    fail(fileName, `frontmatter \`date\` is not a real calendar date: "${date}"`);
  if (typeof slug !== "string" || !URL_SAFE_SLUG.test(slug))
    fail(fileName, "frontmatter `slug` is required and must be lowercase URL-safe (a-z, 0-9, hyphens)");
  if (typeof excerpt !== "string" || excerpt.trim() === "")
    fail(fileName, "frontmatter `excerpt` is required (used for the homepage dek and OG description)");
  if (content.trim() === "")
    fail(fileName, "article body is empty");

  return { title, date, slug, excerpt, content, sourceFile: fileName };
}

let cache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (cache) return cache;
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const posts = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parsePost);

  // Duplicate-slug detection — naming both offending files.
  const bySlug = new Map<string, string>();
  for (const p of posts) {
    const existing = bySlug.get(p.slug);
    if (existing)
      fail(p.sourceFile, `duplicate slug "${p.slug}" — also defined in ${existing}`);
    bySlug.set(p.slug, p.sourceFile);
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = posts;
  return posts;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function formatDate(date: string, locale = "zh-TW"): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
