# 燈塔文摘 — 站點整合檢查表（每篇 digest 必過）

2026-07-30 起生效。背景：第一篇重軌 digest（measuring）上線後補課的五件事，
以後每篇在 checker 階段直接斷言，不再事後修。lighthouse-digest skill 的
「部署 SOP」段落應同步這份清單。

## Head（自包含 HTML 的 `<head>`）

- [ ] 恰好 **1 個** `meta name="description"`（grep -c 必須 == 1）
- [ ] `link rel="canonical"` 絕對 URL
- [ ] 有翻譯版時：**三行 hreflang**（`zh-Hant`、`zh-Hans`、`x-default` → 繁體），
      絕對 URL，繁簡兩頁**互指同一組**
- [ ] `og:site_name` = `Bek 文章`
- [ ] `og:locale` 對應頁面語言（繁 `zh_TW`、簡 `zh_CN`），另一語言放 `og:locale:alternate`
- [ ] JSON-LD `author` 用全站統一 Person 實體：
      `{"@type": "Person", "name": "Bek Tsai", "alternateName": ["蔡奇峯", "Andy Tsai", "Bek"], "sameAs": ["https://www.bekhelpme.com"]}`

## Body（masthead 區）

- [ ] `header.masthead` 第一行 `.site-brand`：`<a href="/">Bek 文章</a>` 連回首頁
- [ ] `meta-line` 含 `作者 Bek Tsai（蔡奇峯）`
- [ ] 有翻譯版時：`.lang-alt` 互連（繁頁 → 简体中文版、簡頁 → 繁體中文版），
      `<a>` 帶 `hreflang` 與 `lang` 屬性

## 註冊表（lib/digests.ts）

- [ ] 主語言條目 `lang: "zh-Hant"`
- [ ] 翻譯條目 `lang: "zh-Hans"` + `translationOf: <主 slug>`
      （首頁只顯示主語言；sitemap 自動帶 hreflang cluster；validate 會在 build 擋漏填）

## llms.txt

- [ ] 一篇文章一個條目；翻譯版縮排在主條目底下標「简体中文版（同文翻譯，hreflang 配對）」，
      不另立條目

## Popup 來源預覽（防 blocked 畫面）

- [ ] 頁面含 `previewShots`、`noframeHosts`、`frameOkHosts` 三個 JSON 區塊（模板見 work/bootstrap/modal.html + popup.js）
- [ ] 即時 iframe 預覽是**白名單制**：只對 `frameOkHosts` 裡驗證過的網域嘗試，未驗證來源停在導覽卡——瀏覽器錯誤頁在任何狀態下都不該出現
- [ ] PDF 來源（含 arxiv.org/pdf/ 這種無副檔名路徑）走 `<object>` 內嵌，不走 sandboxed iframe
      （Chrome 的 PDF 檢視器拒絕在 sandbox 裡執行）
- [ ] 發佈後在有網路的機器跑一次 `npm run previews`（腳本：scripts/capture-previews.mjs），
      拍來源截圖＋探測拒嵌名單並回寫；雲端 session 拍不了（出口封鎖），
      本機 prompt 在 work/prompts/capture-previews-local.md

## 憲章不變式（重申）

- 正文一字不動：以上全部是 head/masthead/註冊表層的整合，touching `<nav class="toc">`
  之後的任何內容一律走 E1。
