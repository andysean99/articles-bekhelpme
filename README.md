# articles.bekhelpme.com — Bek 文章站

Stratechery 式、文字優先的長文章站。Next.js（App Router）· TypeScript · Tailwind v4。
版式學 Stratechery（masthead／單欄／反時序列表／byline），紙感沿用 Bek 品牌（奶油紙＋serif，取自 4days 的 `.prose-letter`）。

## 發新文（最簡單）

在 `content/` 加一個 `.md`，含 frontmatter：

```yaml
---
title: "文章標題"
date: "2026-06-16"
slug: "url-slug"
excerpt: "首頁與 OG 用的一句摘要"
---
```

正文用 Markdown（小標 `##`）。存檔 → `npm run build` → push，首頁與文章頁自動出現。

**Frontmatter 規則（build 時強制驗證，違反就 build 失敗並指出檔名）：**

- `title`：必填、非空字串
- `date`：必填、ISO 格式 `YYYY-MM-DD`（其他格式如 `June 16` 會 fail）
- `slug`：必填、小寫 URL-safe（`a-z` `0-9` 連字號）、全站不可重複
- `excerpt`：必填、非空（首頁 dek 與 OG description 都用它）
- 正文不可為空

**每次發文的 commit checklist（v1 手動，v1.1 改自動）：**

- [ ] 新 `.md` frontmatter 四欄齊全、`date` 為 ISO、`slug` 唯一
- [ ] 同步更新 `public/llms.txt` 的文章清單
- [ ] `npm run build` 通過後再 push

## 本機指令

```bash
npm install
npm run build      # 上線前先本機 build 過（別用 next dev 留殘留 process）
npm run start      # 本機預覽 production build
```

## 部署（沿用 4days 鐵則）

子網域 → 獨立 Vercel 專案＋獨立 GitHub repo（建議 repo 名 `articles-bekhelpme`）＋ GoDaddy 一筆 CNAME。

```powershell
cd C:\dev\articles-bekhelpme
Remove-Item .\.git\index.lock -Force -ErrorAction SilentlyContinue
npm run build
git add -A
git commit -m "描述修改"
git push                      # Vercel 自動部署
# 上線後 https://articles.bekhelpme.com/?x=1 驗證（避開 CDN 舊快取）
```

DNS（GoDaddy）：加一筆 CNAME `articles` → Vercel 給的目標（形如 `xxxxxxxx.vercel-dns-017.com.`；實際值以 Vercel Domains 介面為準）。

## 內建（v1 Definition of Done）

- zh-TW、奶油紙＋serif、Stratechery 版式（masthead／單欄／反時序列表／byline）✅
- `content/` Markdown 管線（gray-matter + react-markdown + remark-gfm）✅
- 第一篇〈為什麼 AI 越便宜，差距越大〉已放入並正確渲染 ✅
- GA4 `G-NLVESXBBMR`（`next/script`、`afterInteractive`）✅
- AI 層：語意化 `<article>` ＋ JSON-LD（首頁 `Blog`／`WebSite`、文章頁 `Article`）＋ OG／canonical ＋ `sitemap.xml`／`robots.txt`／`public/llms.txt` ✅
- 與 www / 4days 互連；footer 聯絡 `bek8278728@gmail.com` / `0908 278 094` ✅

## 改站名／聯絡資訊

集中在 `lib/site.ts`（站名、tagline、email、電話、姊妹站連結）。

## 待決 / 之後

- 訂閱／電子報（Stratechery 有付費牆；v1 先不做）
- 文章分類／tag
- og:image 自動產生
- `llms.txt` 改為自 `content/` 自動產生
