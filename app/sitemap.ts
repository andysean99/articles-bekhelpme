import type { MetadataRoute } from "next";
import { getAllEntries, getLanguageAlternates } from "@/lib/digests";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllEntries();
  const articles = posts.map((p) => {
    const pair = getLanguageAlternates(p.slug);
    // Both rows of a translation pair carry the same alternates block, so
    // crawlers see the hreflang cluster no matter which URL they start from.
    const languages = Object.fromEntries(
      pair.map((alt) => [alt.lang ?? "zh-Hant", `${site.url}/${alt.slug}`]),
    );
    return {
      url: `${site.url}/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(pair.length ? { alternates: { languages } } : {}),
    };
  });
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...articles,
  ];
}
