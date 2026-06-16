import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const articles = posts.map((p) => ({
    url: `${site.url}/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
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
