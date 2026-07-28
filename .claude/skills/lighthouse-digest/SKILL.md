---
name: lighthouse-digest
description: >
  燈塔文摘（Lighthouse Digest）——把研究素材變成敘事型互動 HTML article 並一條龍部署到
  articles.bekhelpme.com 的完整產線。觸發時機：Bek 說「燈塔文摘」「產一篇 article」
  「寫文章上 articles」「照 japan-art-digest 那種格式做」「做一篇 digest」，或丟研究素材
  說要變成可發佈的長文。涵蓋兩軌（markdown 輕文章／自包含 HTML 重文章）、CoffeeCopy 文案
  規則、popup 導覽卡與 SVG 圖表可選模組、GEO 公開預設與 --internal 內部版、部署 SOP 與
  驗證閘門。不觸發：改 www.bekhelpme.com 主站頁面、非文章類交付物。
---

# 燈塔文摘（Lighthouse Digest）

把研究素材編譯成「人和 AI 都看得見的燈塔」：敘事型、可互動、GEO 友善的長文，
發佈在 articles.bekhelpme.com。名字來自格式的原型作品 japan-art-digest
（「蓋燈塔＝蓋權威」的比喻）。原型源檔＝`andysean99/fu-chin` repo 的 `digest.html`
——所有模組的參考實作都在那裡，動工前先讀它。

## 第零步：問到 95% 再動工（Bek 的硬規則）

收到素材後先問，問到 95% 確定再寫。必問清單（已知就跳過）：

1. **主題與素材邊界**——哪些素材進文、哪些不進？素材裡「未查證」的數字照標，絕不腦補。
2. **公開還是內部**——公開＝預設（index、進 sitemap／首頁／llms.txt）；內部＝`--internal`
   （noindex、不進任何列表，網址私傳）。
3. **輕重軌道**（見下節）——建議一個，讓 Bek 拍板。
4. **slug、title、一句話 excerpt、發佈日期**——slug 必須 `a-z0-9-`。
5. **模組需求**——要不要導覽卡 popup？有沒有數據要畫圖？來源庫規模？要不要簡體版？

## 兩軌判斷

| 軌道 | 什麼時候 | 落地 |
|------|----------|------|
| **輕（markdown）** | 純敘事、少量連結、無互動需求 | `content/<slug>.md`＋frontmatter（title/date/slug/excerpt），走現有 ReactMarkdown 管線 |
| **重（digest route）** | 要 popup 導覽卡、SVG 圖表、來源庫任一 | 自包含 HTML → `scripts/make_digest_route.py` 包成 `app/<slug>/route.ts`（靜態路由優先於 `[slug]`，網址相同） |

判斷原則：素材有 10+ 條值得導覽的外部連結、或有可畫的數據、或超過 15 分鐘閱讀量 → 重軌。
否則輕軌。跟 Bek 確認後才動工。

量級參考：重軌原型（japan-art-digest）約 25 分鐘閱讀、九個敘事章節＋附錄卡＋來源庫；
輕軌不設下限，以一個論點講完為度。字數不是目標——寧可窄而深，砍到每段都有工作要做。
在非 Code 環境（純對話 session）套用本 skill 時：文案規則與格式骨架照用，
部署段落（route 生成、build、push）需要有 articles-bekhelpme repo 的 Claude Code session 才能執行。

## 文案規則（CoffeeCopy，兩軌通用）

- **開頭場景鉤子**：一個具體的人在具體的地方遇到具體的問題（原型：舊金山收藏者在東京畫廊）
- **敘事段落零 bullet**——list 只出現在附錄卡與表格
- **一貫核心比喻**貫穿全文（原型：米其林指南）
- **專有名詞白話解釋**：首次出現就用破折號或括號給一句人話（這正是 AI 最愛摘錄的句型）
- 每張圖表配一句文字 **Takeaway**（圖 AI 讀不到，結論讀得到）
- **「未查證」標注是硬規則**：`<span class="unverified">未查證</span>`，照素材保留，不得補全
- **通用敘事**：不指涉未經同意的真實人物；個人資歷無公開 URL 佐證就不寫

## 格式骨架（重軌）

單一自包含 HTML（無外部函式庫、無 CDN）。設計系統：

- 奶油底 `#FAF7F0`／墨字 `#211F1A`／強調青瓷綠 `#177A5B`／第二系列靛藍 `#4661C2`
- 深色主題三處定義：`:root`、`@media (prefers-color-scheme: dark)`、`[data-theme=dark]`，
  深色 token：`#2FA079`＋`#6B7FE0` on `#141715`；按鈕文字色用 `--btn-ink`
- 標題明朝體堆疊（Noto Serif TC…）、內文黑體堆疊；閱讀欄 740px；手機無橫向捲動
- 章節用中文數字眉標（壹貳參…）＋`<section>` 語意結構＋`<figure>/<figcaption>`
- 圖表用 inline SVG，配色先跑 dataviz skill 的雙主題 validator

## 可選模組（按第零步的答案開關）

### A. Popup 導覽卡系統（參考 fu-chin/digest.html 的 JS 區塊，直接移植改造）

- **公開版連結寫法**：`<a class="ent" href="URL" data-url="URL">`——href 給爬蟲（GEO 引用
  圖譜靠它），JS `preventDefault` 開 popup。⚠ 只有 claude.ai Artifact 版才拿掉 href
- 點擊開仿瀏覽器 modal：唯讀網址列＋複製網址（clipboard＋execCommand fallback）＋
  開新分頁＋✕；Esc／點背景可關；document 層 event delegation＋Enter 鍵
- 導覽卡存 `<script type="application/json">`，key=完整 URL，value=`{t,d}`；
  卡片內容要**事實校對**（前科：subagent 把「訴訟指控」寫成「法院認定侵權」）
- **canEmbed 網域白名單**：只在 `(^|\.)bekhelpme\.com$|^localhost$|^127\.|^$` 嘗試 iframe
  背景載入，其他宿主停留在導覽卡（claude.ai Artifact 會把外部 iframe src 攔截成
  「Open external link」視窗——2026-07 平台行為）
- iframe `sandbox="allow-scripts allow-same-origin allow-forms allow-popups
  allow-popups-to-escape-sandbox"`、預設 `visibility:hidden`、load 成功才顯示、
  `securitypolicyviolation` 旗標防錯誤頁蓋卡；載入成功出現實心「看網頁」鈕，不自動跳轉
- 已知限制照抄提示文案：XFO 拒絕→停卡；米其林類「假成功」（load 有觸發但頁面自清空）

### B. SVG 圖表：先讀 dataviz skill 再寫第一行圖表碼；每張配 Takeaway

### C. 來源庫：底部全量 URL 純文字列出（引用圖譜原料），分組、掛 popup（無卡直接試 iframe）

### D. 簡體版：OpenCC `tw2sp`；先用 regex `https?://[^"\s<>]+` 把全部 URL 換佔位符保護
（前科：含日文的網址被轉字變死連結），轉完還原；「拷贝」→「复制」；`lang` 改 `zh-Hans`；
簡體版走獨立 slug（`<slug>-cn`），兩版之間不放語言切換連結

## GEO 設定

**公開（預設）**：真 href、無 noindex、`make_digest_route.py` 自動注入 description／
canonical／OG article／JSON-LD Article／GA（G-NLVESXBBMR，與站台 layout 同一 property
——digest route 繞過 layout 所以必須 inline）、登記進 `lib/digests.ts`（自動接首頁＋blog
JSON-LD＋sitemap.xml）、`public/llms.txt` 補一行。
**內部（`--internal`）**：noindex,nofollow；**不**登記 digests.ts、**不**碰 llms.txt。

## 部署 SOP

輕軌：寫 `content/<slug>.md`（frontmatter 四欄必填，lib/posts.ts 會在 build 時驗證）
→ 本地 `npm ci && npx next build` → push main（Vercel 自動部署，1–2 分鐘）。

重軌：
1. 產出自包含 HTML（先過驗證閘門，見下）
2. `python3 .claude/skills/lighthouse-digest/scripts/make_digest_route.py --html … --slug …
   --title … --date … --excerpt …`（內建 String.raw 前置檢查：HTML 不得含反引號或 `${`）
3. 公開版：照腳本輸出把 entry 加進 `lib/digests.ts`、llms.txt 補一行
4. `npm ci && npx next build`——必須看到 `○ /<slug>`
5. 驗證通過 → commit → push main
⚠ Bash cwd 會殘留在 articles repo，跨 repo commit 前先確認目錄

## 驗證閘門（交付前自己全過，不讓 Bek 試錯）

1. 本地 Playwright（chromium 在 `/opt/pw-browsers/chromium`）：頁面載入、popup 開關、
   雙主題、手機寬度無橫向捲動；本環境 egress 全擋，外站載入測不了屬正常
2. 逐位元組比對：route.ts 內嵌 HTML vs 源 HTML，唯一允許差異＝注入的 meta 區塊
3. `grep -c` 檢查：無殘留佔位符、未查證標注數量與素材一致、公開版每個 `.ent` 都有 href
4. build 輸出確認 `○ /<slug>`，且首頁與 sitemap 包含新文章（公開版）

## 模型分工

文案初稿與機械步驟（HTML 組裝、OpenCC、route 生成、build）→ **Sonnet subagent**；
判斷與整合（軌道選擇、事實校對、驗證閘門、push）→ 主模型。導覽卡批次生產可派
subagent，但卡片內容必須回到主模型做事實校對。

## 版本紀錄

- 2026-07-28 v1：從 japan-art-digest 專案（fu-chin HANDOFF.md）萃取成 skill；
  雙軌落地、canEmbed、GEO 公開預設均為實戰驗證過的行為
