import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import { formatDate } from "@/lib/posts";
import { getAllEntries } from "@/lib/digests";
import { site } from "@/lib/site";
import { safeJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  const posts = getAllEntries();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: site.name,
    url: site.url,
    inLanguage: "zh-TW",
    author: { "@type": "Person", name: site.author, alternateName: site.authorRealName },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      datePublished: p.date,
      description: p.excerpt,
      url: `${site.url}/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogJsonLd) }}
      />
      <Masthead />
      <main className="mx-auto max-w-[680px] px-5 py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-[var(--color-ink-faint)]">尚無文章。</p>
        ) : (
          <ul className="space-y-12">
            {posts.map((post, i) => (
              <li key={post.slug}>
                <Reveal delay={i * 0.04}>
                  <article>
                    <p className="font-[family-name:var(--font-sans)] text-sm text-[var(--color-ink-faint)]">
                      {formatDate(post.date, site.locale)}
                    </p>
                    <h2 className="mt-1.5 text-2xl font-semibold leading-snug sm:text-[1.75rem]">
                      <Link
                        href={`/${post.slug}`}
                        className="text-[var(--color-ink)] no-underline transition-colors hover:text-[var(--color-accent)]"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-3 leading-relaxed text-[var(--color-ink-soft)]">
                        {post.excerpt}
                      </p>
                    )}
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
