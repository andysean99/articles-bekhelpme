#!/usr/bin/env python3
"""燈塔文摘 (Lighthouse Digest) — package a self-contained digest HTML into a
Next.js route.ts for articles.bekhelpme.com.

Takes a finished single-file digest HTML and article metadata, injects the
SEO/GEO meta block (description, canonical, OG article, JSON-LD Article)
right after </title>, and writes app/<slug>/route.ts in the articles repo.
Static segments beat the [slug] markdown route, so the digest owns
articles.bekhelpme.com/<slug>.

Public by default (indexable). --internal adds noindex,nofollow — internal
digests must then NOT be added to lib/digests.ts or llms.txt.

Usage:
  python3 make_digest_route.py --html digest.html --slug my-article \
      --title "標題" --date 2026-07-28 --excerpt "一句話摘要" [--internal] \
      [--deploy-dir /workspace/articles-bekhelpme] [--lang zh-Hant]

After running (public digests):
  1. Append {title, date, slug, excerpt} to lib/digests.ts `digests` array
     (this wires the homepage list, blog JSON-LD, and sitemap.xml).
  2. Append the article line to public/llms.txt.
  3. npm ci && npx next build — must show ○ /<slug>.
  4. Verify, then push main (Vercel auto-deploys).
"""
import argparse
import datetime
import json
import os
import re
import sys

SHELL_PREFIX = 'export const dynamic = "force-static";\n\nconst html = String.raw`'
SHELL_SUFFIX = """`;

export async function GET() {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
"""
SITE_URL = "https://articles.bekhelpme.com"
AUTHOR = "Bek"
# Same GA property as app/layout.tsx — digest routes bypass the Next.js layout,
# so analytics must be injected inline here. No backticks/${ (String.raw-safe).
GA_ID = "G-NLVESXBBMR"
GA_SNIPPET = (
    f'<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>\n'
    "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}"
    f"gtag('js',new Date());gtag('config','{GA_ID}');</script>"
)


def esc_attr(s: str) -> str:
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def build_meta_block(a) -> str:
    url = f"{SITE_URL}/{a.slug}"
    lines = [
        f'<meta name="description" content="{esc_attr(a.excerpt)}">',
    ]
    if a.internal:
        lines.append('<meta name="robots" content="noindex, nofollow">')
    lines += [
        f'<link rel="canonical" href="{url}">',
        '<meta property="og:type" content="article">',
        f'<meta property="og:title" content="{esc_attr(a.title)}">',
        f'<meta property="og:description" content="{esc_attr(a.excerpt)}">',
        f'<meta property="og:url" content="{url}">',
        '<meta property="og:locale" content="zh_TW">',
        f'<meta property="article:published_time" content="{a.date}">',
    ]
    jsonld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": a.title,
        "description": a.excerpt,
        "datePublished": a.date,
        "inLanguage": a.lang,
        "author": {"@type": "Person", "name": AUTHOR},
        "mainEntityOfPage": url,
    }
    # "</" would close the script tag early inside HTML; escape it.
    jsonld_text = json.dumps(jsonld, ensure_ascii=False).replace("</", "<\\/")
    lines.append(f'<script type="application/ld+json">{jsonld_text}</script>')
    lines.append(GA_SNIPPET)
    return "\n" + "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--html", required=True, help="finished self-contained digest HTML")
    ap.add_argument("--slug", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--date", required=True, help="ISO YYYY-MM-DD")
    ap.add_argument("--excerpt", required=True)
    ap.add_argument("--lang", default="zh-Hant")
    ap.add_argument("--internal", action="store_true",
                    help="noindex,nofollow; keep OUT of lib/digests.ts and llms.txt")
    ap.add_argument("--deploy-dir", default="/workspace/articles-bekhelpme")
    a = ap.parse_args()

    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", a.slug):
        sys.exit(f"ERROR: slug {a.slug!r} must be lowercase URL-safe (a-z, 0-9, hyphens)")
    try:
        datetime.date.fromisoformat(a.date)
    except ValueError:
        sys.exit(f"ERROR: date {a.date!r} is not a real ISO date")

    html = open(a.html, encoding="utf-8").read()
    for hazard in ("`", "${"):
        if hazard in html:
            sys.exit(f"ERROR: {a.html} contains {hazard!r}; String.raw would break. Aborting.")
    if "</title>" not in html:
        sys.exit(f"ERROR: {a.html} has no </title>; aborting.")
    if os.path.isfile(os.path.join(a.deploy_dir, "content", a.slug + ".md")):
        sys.exit(f"ERROR: content/{a.slug}.md already exists; a digest route would shadow it.")

    idx = html.index("</title>") + len("</title>")
    full = html[:idx] + build_meta_block(a) + html[idx:]

    route_dir = os.path.join(a.deploy_dir, "app", a.slug)
    os.makedirs(route_dir, exist_ok=True)
    route_path = os.path.join(route_dir, "route.ts")
    with open(route_path, "w", encoding="utf-8") as f:
        f.write(SHELL_PREFIX + full + SHELL_SUFFIX)

    print(f"wrote {route_path}")
    print(f"url:   {SITE_URL}/{a.slug}")
    if a.internal:
        print("mode:  INTERNAL (noindex) — do NOT register in lib/digests.ts or llms.txt")
    else:
        print("mode:  PUBLIC — next steps:")
        print(f'  1. lib/digests.ts → digests 陣列加入:')
        entry = {"title": a.title, "date": a.date, "slug": a.slug, "excerpt": a.excerpt}
        print("     " + json.dumps(entry, ensure_ascii=False) + ",")
        print("  2. public/llms.txt → ## 文章 區塊補一行")
        print("  3. npm ci && npx next build（必須看到 ○ /" + a.slug + "）→ 驗證 → push main")


if __name__ == "__main__":
    main()
