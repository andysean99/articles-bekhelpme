import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Masthead from "@/components/Masthead";
import SiteFooter from "@/components/SiteFooter";
import { getAllSlugs, getPostBySlug, formatDate } from "@/lib/posts";
import { site } from "@/lib/site";
import { safeJsonLd } from "@/lib/jsonld";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${site.url}/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      type: "article",
      locale: "zh_TW",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.date,
      authors: [site.author],
      siteName: site.name,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    description: post.excerpt,
    inLanguage: "zh-TW",
    author: {
      "@type": "Person",
      name: site.author,
      alternateName: site.authorRealName,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/${post.slug}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      <Masthead />
      <main className="mx-auto max-w-[680px] px-5 py-12 sm:py-16">
        <article>
          <p className="font-[family-name:var(--font-sans)] text-sm text-[var(--color-ink-faint)]">
            {formatDate(post.date, site.locale)}
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 font-[family-name:var(--font-sans)] text-sm text-[var(--color-ink-faint)]">
            作者 {site.author}
          </p>
          <hr className="rule-soft my-8" />
          <div className="prose-letter">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
        <hr className="rule-soft my-10" />
        <Link
          href="/"
          className="font-[family-name:var(--font-sans)] text-sm text-[var(--color-accent)] no-underline hover:underline"
        >
          ← 回所有文章
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
