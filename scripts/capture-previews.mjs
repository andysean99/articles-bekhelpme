#!/usr/bin/env node
// 燈塔文摘 — 來源預覽產生器
//
// 對每篇 digest 的全部來源連結：
//   1. 探測 X-Frame-Options / CSP frame-ancestors → 寫入頁內 noframeHosts 名單
//      （popup 對這些網域不再嘗試 iframe，直接顯示導覽卡，杜絕瀏覽器錯誤頁）
//   2. 用 Playwright 拍一張截圖存到 public/previews/<sha1前8>.jpg
//      （popup 優先顯示截圖，「blocked」畫面從此不會出現）
//   3. 把結果回寫進 route.ts 的 previewShots / noframeHosts 兩個 JSON 區塊
//
// 需要對外網路。用法（repo 根目錄）：
//   npm ci && npx playwright install chromium
//   node scripts/capture-previews.mjs            # 全部 digest
//   node scripts/capture-previews.mjs --dry-run  # 只列出計畫，不碰網路
//
// 冪等：重跑只補缺的截圖；--force 全部重拍。

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW_DIR = path.join(ROOT, "public", "previews");
const ROUTE_FILES = [
  "app/measuring-the-half-ai-does-better/route.ts",
  "app/measuring-the-half-ai-does-better-cn/route.ts",
];
const VIEWPORT = { width: 1280, height: 960 };
const NAV_TIMEOUT_MS = 30_000;

export function shotName(url) {
  return createHash("sha1").update(url).digest("hex").slice(0, 8) + ".jpg";
}

export function hostOf(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function isPdf(url) {
  return /\.pdf($|[?#])/i.test(url) || /arxiv\.org\/pdf\//i.test(url);
}

// 來源 = linkCards 的 key ∪ 所有 class="ent" 的 href。
export function extractUrls(source) {
  const urls = new Set();
  const cardsMatch = source.match(
    /<script id="linkCards" type="application\/json">(.*?)<\/script>/s,
  );
  if (cardsMatch) for (const u of Object.keys(JSON.parse(cardsMatch[1]))) urls.add(u);
  for (const m of source.matchAll(/class="ent" href="([^"]+)"/g)) urls.add(m[1]);
  return [...urls].sort();
}

// 回寫頁內 JSON 區塊。區塊不存在就大聲失敗——代表頁面模板漏了整合層。
export function rewriteBlock(source, id, value) {
  const re = new RegExp(`(<script id="${id}" type="application/json">).*?(</script>)`, "s");
  if (!re.test(source)) throw new Error(`route file is missing the ${id} block`);
  return source.replace(re, `$1${JSON.stringify(value)}$2`);
}

export function parseFrameHeaders(headers) {
  const xfo = (headers["x-frame-options"] || "").toLowerCase();
  const csp = (headers["content-security-policy"] || "").toLowerCase();
  const ancestors = csp.match(/frame-ancestors([^;]*)/);
  const blockedByCsp =
    ancestors && !/(^|\s)(\*|https?:)(\s|$)/.test(ancestors[1] || "");
  return Boolean(xfo.includes("deny") || xfo.includes("sameorigin") || blockedByCsp);
}

async function probe(url) {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
  const headers = Object.fromEntries(res.headers.entries());
  return { status: res.status, blocked: parseFrameHeaders(headers) };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  const files = ROUTE_FILES.map((rel) => ({
    rel,
    abs: path.join(ROOT, rel),
    source: fs.readFileSync(path.join(ROOT, rel), "utf8"),
  }));
  const allUrls = [...new Set(files.flatMap((f) => extractUrls(f.source)))];
  console.log(`sources: ${allUrls.length} unique URLs across ${files.length} pages`);

  if (dryRun) {
    for (const u of allUrls)
      console.log(`  ${isPdf(u) ? "pdf " : "page"}  ${shotName(u)}  ${u}`);
    console.log("dry-run: no network, no files written");
    return;
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "playwright 未安裝。先跑：npm i -D playwright && npx playwright install chromium",
    );
    process.exit(1);
  }

  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });

  const shots = {}; // url -> /previews/<hash>.jpg
  const noframeHosts = new Set();
  const frameOkHosts = new Set(); // 驗證過允許內嵌——popup 只對這份白名單嘗試 iframe
  const failures = [];

  for (const url of allUrls) {
    // 1) header 探測（PDF 也要——它可能被 <object> 以外的方式引用）
    try {
      const { blocked } = await probe(url);
      if (blocked) noframeHosts.add(hostOf(url));
      else frameOkHosts.add(hostOf(url));
    } catch (e) {
      failures.push(`probe ${url}: ${e.message}`);
    }
    // 2) 截圖（PDF 跳過：瀏覽器內建 <object> 檢視器已能直接顯示）
    if (isPdf(url)) continue;
    const file = path.join(PREVIEW_DIR, shotName(url));
    if (!force && fs.existsSync(file)) {
      shots[url] = "/previews/" + shotName(url);
      continue;
    }
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS }).catch(
        () => page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS }),
      );
      await page.waitForTimeout(1500);
      await page.screenshot({ path: file, type: "jpeg", quality: 72 });
      shots[url] = "/previews/" + shotName(url);
      console.log(`shot  ${shotName(url)}  ${url}`);
    } catch (e) {
      failures.push(`shot ${url}: ${e.message}`);
    } finally {
      await page.close();
    }
  }
  await browser.close();

  // 3) 回寫兩頁的 JSON 區塊（每頁只帶自己用得到的 URL）
  for (const f of files) {
    const mine = extractUrls(f.source);
    const myShots = Object.fromEntries(mine.filter((u) => shots[u]).map((u) => [u, shots[u]]));
    // 同網域不同 URL 的探測結果衝突時，一律當拒嵌處理
    const okHosts = [...frameOkHosts].filter((h) => !noframeHosts.has(h)).sort();
    let out = rewriteBlock(f.source, "previewShots", myShots);
    out = rewriteBlock(out, "noframeHosts", [...noframeHosts].sort());
    out = rewriteBlock(out, "frameOkHosts", okHosts);
    fs.writeFileSync(f.abs, out);
    console.log(`wrote ${f.rel}: ${Object.keys(myShots).length} shots, ${noframeHosts.size} noframe, ${okHosts.length} frame-ok`);
  }

  // 沒有靜默截斷：漏掉哪些一定列出來
  if (failures.length) {
    console.log(`\n${failures.length} failures (這些來源維持導覽卡+開新分頁，不影響上線):`);
    for (const f of failures) console.log("  " + f);
  }
  console.log("\ndone. 接著跑: npm run build && git diff --stat");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
