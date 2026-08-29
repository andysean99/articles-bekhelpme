#!/usr/bin/env node
/**
 * 燈塔文摘 (Lighthouse Digest) — package a self-contained digest HTML into a
 * Next.js route.ts for articles.bekhelpme.com.
 *
 * Node.js port of scripts/../.claude/skills/lighthouse-digest/scripts/make_digest_route.py
 * (ported because this machine has no python3). Line-for-line behavioral parity
 * with the python version — same CLI flags, same validation order, same meta
 * block content/order, same String.raw escape rules, same stdout messages.
 *
 * Takes a finished single-file digest HTML and article metadata, injects the
 * SEO/GEO meta block (description, canonical, OG article, JSON-LD Article)
 * right after </title>, and writes app/<slug>/route.ts in the articles repo.
 * Static segments beat the [slug] markdown route, so the digest owns
 * articles.bekhelpme.com/<slug>.
 *
 * Public by default (indexable). --internal adds noindex,nofollow — internal
 * digests must then NOT be added to lib/digests.ts or llms.txt.
 *
 * Usage:
 *   node make_digest_route.mjs --html digest.html --slug my-article \
 *       --title "標題" --date 2026-07-28 --excerpt "一句話摘要" [--internal] \
 *       [--deploy-dir /workspace/articles-bekhelpme] [--lang zh-Hant]
 *
 * After running (public digests):
 *   1. Append {title, date, slug, excerpt} to lib/digests.ts `digests` array
 *      (this wires the homepage list, blog JSON-LD, and sitemap.xml).
 *   2. Append the article line to public/llms.txt.
 *   3. npm ci && npx next build — must show ○ /<slug>.
 *   4. Verify, then push main (Vercel auto-deploys).
 */
import fs from "node:fs";
import path from "node:path";

const SHELL_PREFIX = 'export const dynamic = "force-static";\n\nconst html = String.raw`';
const SHELL_SUFFIX = `\`;

export async function GET() {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
`;
const SITE_URL = "https://articles.bekhelpme.com";
const SITE_NAME = "Bek 文章";
// Mirrors authorPerson in lib/site.ts — the one Person entity every JSON-LD block
// on the site points at. Keep the two in sync; site-integration-checklist.md
// asserts this shape on every digest.
const AUTHOR_PERSON = {
  "@type": "Person",
  name: "Bek Tsai",
  alternateName: ["蔡奇峯", "Andy Tsai", "Bek"],
  sameAs: ["https://www.bekhelpme.com"],
};
// Same GA property as app/layout.tsx — digest routes bypass the Next.js layout,
// so analytics must be injected inline here. No backticks/${} (String.raw-safe).
const GA_ID = "G-NLVESXBBMR";
const GA_SNIPPET =
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>\n` +
  "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
  `gtag('js',new Date());gtag('config','${GA_ID}');</script>`;

function escAttr(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildMetaBlock(a) {
  const url = `${SITE_URL}/${a.slug}`;
  const lines = [`<meta name="description" content="${escAttr(a.excerpt)}">`];
  if (a.internal) {
    lines.push('<meta name="robots" content="noindex, nofollow">');
  }
  lines.push(
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:site_name" content="${escAttr(SITE_NAME)}">`,
    '<meta property="og:type" content="article">',
    `<meta property="og:title" content="${escAttr(a.title)}">`,
    `<meta property="og:description" content="${escAttr(a.excerpt)}">`,
    `<meta property="og:url" content="${url}">`,
    '<meta property="og:locale" content="zh_TW">',
    `<meta property="article:published_time" content="${a.date}">`
  );
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    inLanguage: a.lang,
    author: AUTHOR_PERSON,
    mainEntityOfPage: url,
  };
  // "</" would close the script tag early inside HTML; escape it.
  const jsonldText = JSON.stringify(jsonld).replaceAll("</", "<\\/");
  lines.push(`<script type="application/ld+json">${jsonldText}</script>`);
  lines.push(GA_SNIPPET);
  return "\n" + lines.join("\n");
}

function die(msg) {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

const USAGE = `usage: make_digest_route.mjs --html HTML --slug SLUG --title TITLE --date DATE
                             --excerpt EXCERPT [--lang LANG] [--internal]
                             [--deploy-dir DEPLOY_DIR]`;

function parseArgs(argv) {
  const spec = {
    html: { required: true },
    slug: { required: true },
    title: { required: true },
    date: { required: true },
    excerpt: { required: true },
    lang: { required: false, default: "zh-Hant" },
    "deploy-dir": { required: false, default: "/workspace/articles-bekhelpme" },
  };
  const out = { internal: false, lang: spec.lang.default, deployDir: spec["deploy-dir"].default };
  let i = 0;
  while (i < argv.length) {
    let tok = argv[i];
    if (!tok.startsWith("--")) {
      die(`${USAGE}\nmake_digest_route.mjs: error: unrecognized arguments: ${tok}`);
    }
    tok = tok.slice(2);
    let inlineVal = null;
    const eq = tok.indexOf("=");
    if (eq !== -1) {
      inlineVal = tok.slice(eq + 1);
      tok = tok.slice(0, eq);
    }
    if (tok === "internal") {
      out.internal = true;
      i += 1;
      continue;
    }
    const key = tok === "deploy-dir" ? "deployDir" : tok;
    if (!(tok in spec)) {
      die(`${USAGE}\nmake_digest_route.mjs: error: unrecognized arguments: --${tok}`);
    }
    let value;
    if (inlineVal !== null) {
      value = inlineVal;
      i += 1;
    } else {
      value = argv[i + 1];
      if (value === undefined) {
        die(`${USAGE}\nmake_digest_route.mjs: error: argument --${tok}: expected one argument`);
      }
      i += 2;
    }
    out[key] = value;
  }
  for (const [name, s] of Object.entries(spec)) {
    const key = name === "deploy-dir" ? "deployDir" : name;
    if (s.required && out[key] === undefined) {
      die(`${USAGE}\nmake_digest_route.mjs: error: the following arguments are required: --${name}`);
    }
  }
  return out;
}

function isIsoDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [, y, mo, d] = m.map(Number);
  if (mo < 1 || mo > 12) return false;
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (d < 1 || d > daysInMonth) return false;
  return true;
}

function main() {
  const a = parseArgs(process.argv.slice(2));

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) {
    die(`ERROR: slug '${a.slug}' must be lowercase URL-safe (a-z, 0-9, hyphens)`);
  }
  if (!isIsoDate(a.date)) {
    die(`ERROR: date '${a.date}' is not a real ISO date`);
  }

  // Matches python: no existence pre-check — a missing file throws here,
  // same as python's uncaught FileNotFoundError (non-zero exit, traceback).
  const html = fs.readFileSync(a.html, "utf8");
  for (const hazard of ["`", "${"]) {
    if (html.includes(hazard)) {
      die(`ERROR: ${a.html} contains '${hazard}'; String.raw would break. Aborting.`);
    }
  }
  if (!html.includes("</title>")) {
    die(`ERROR: ${a.html} has no </title>; aborting.`);
  }
  const shadowPath = path.join(a.deployDir, "content", a.slug + ".md");
  if (fs.existsSync(shadowPath) && fs.statSync(shadowPath).isFile()) {
    die(`ERROR: content/${a.slug}.md already exists; a digest route would shadow it.`);
  }

  const idx = html.indexOf("</title>") + "</title>".length;
  const full = html.slice(0, idx) + buildMetaBlock(a) + html.slice(idx);

  const routeDir = path.join(a.deployDir, "app", a.slug);
  fs.mkdirSync(routeDir, { recursive: true });
  const routePath = path.join(routeDir, "route.ts");
  fs.writeFileSync(routePath, SHELL_PREFIX + full + SHELL_SUFFIX, "utf8");

  console.log(`wrote ${routePath}`);
  console.log(`url:   ${SITE_URL}/${a.slug}`);
  if (a.internal) {
    console.log("mode:  INTERNAL (noindex) — do NOT register in lib/digests.ts or llms.txt");
  } else {
    console.log("mode:  PUBLIC — next steps:");
    console.log("  1. lib/digests.ts → digests 陣列加入:");
    const entry = { title: a.title, date: a.date, slug: a.slug, excerpt: a.excerpt };
    console.log("     " + JSON.stringify(entry) + ",");
    console.log("  2. public/llms.txt → ## 文章 區塊補一行");
    console.log("  3. npm ci && npx next build（必須看到 ○ /" + a.slug + "）→ 驗證 → push main");
  }
}

main();
